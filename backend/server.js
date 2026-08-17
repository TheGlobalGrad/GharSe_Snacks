const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const path = require('path');
const Razorpay = require('razorpay');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;
const BUSINESS_EMAIL = process.env.ORDER_NOTIFICATION_EMAIL || 'gharse.team@gmail.com';
const RESEND_FROM = process.env.EMAIL_FROM || 'GharSe Snacks <onboarding@resend.dev>';
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || true }));
app.use(express.json({ limit: '100kb' }));
app.use(express.static(path.join(__dirname, '..', 'frontend')));
const q = (sql, params = []) => db.promise().query(sql, params).then(([rows]) => rows);
const clean = (value, max = 255) => typeof value === 'string' ? value.trim().slice(0, max) : '';
const emailOk = value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const ref = (type, id) => `GSS_${type}_${String(id).padStart(6, '0')}`;

let mailTransport;

function getMailTransport() {
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) return null;
    if (!mailTransport) mailTransport = nodemailer.createTransport({ service: 'gmail', auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD.replace(/\s/g, '') } });
    return mailTransport;
}
async function sendEmail(to, subject, html) {
    if (!to) throw new Error('Email recipient is missing.');
    try {
        if (process.env.RESEND_API_KEY) {
            const response = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ from: RESEND_FROM, to: [to], subject, html })
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Resend rejected the message.');
            console.log(`Email accepted for delivery to ${to} (${result.id}).`);
            return result;
        }
        const transport = getMailTransport();
        if (!transport) throw new Error('Email is not configured. Set RESEND_API_KEY or Gmail SMTP credentials in backend/.env.');
        const result = await transport.sendMail({ from: `GharSe Snacks <${process.env.GMAIL_USER}>`, to, subject, html });
        console.log(`Email accepted for delivery to ${to} (${result.messageId}).`);
        return result;
    } catch (error) {
        console.error(`Email failed for ${to}:`, error.message);
        throw new Error('Email delivery failed. Please try again shortly.');
    }
}
const esc = value => String(value || '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));

async function createOrFindBulkCustomer({ name, email, phone, state, address }) {
    const existing = await q('SELECT id,user_id FROM users WHERE email=? LIMIT 1', [email]);
    if (existing.length) return { customerId: existing[0].user_id, accountCreated: false, setupCode: null };
    const passwordHash = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 12);
    const result = await q('INSERT INTO users (name,email,password_hash,phone,state,address,preferred_snacks) VALUES (?,?,?,?,?,?,?)', [name, email, passwordHash, phone, state, address, 'Bulk order enquiry']);
    const customerId = ref('USR', result.insertId);
    await q('UPDATE users SET user_id=? WHERE id=?', [customerId, result.insertId]);
    const setupCode = String(crypto.randomInt(100000, 1000000));
    await q('INSERT INTO password_reset_tokens (user_id,token_hash,expires_at) VALUES (?,?,DATE_ADD(NOW(), INTERVAL 15 MINUTE))', [result.insertId, crypto.createHash('sha256').update(setupCode).digest('hex')]);
    return { customerId, accountCreated: true, setupCode };
}

let razorpay = null;
const razorpayConfigured = Boolean(
    process.env.RAZORPAY_KEY_ID &&
    process.env.RAZORPAY_KEY_SECRET &&
    !process.env.RAZORPAY_KEY_ID.includes('replace_me') &&
    !process.env.RAZORPAY_KEY_SECRET.includes('replace_me')
);
if (razorpayConfigured) razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });

app.get('/test-db', async(_req, res) => {
    try {
        await q('SELECT 1');
        res.json({ success: true, message: 'MySQL connected successfully!' });
    } catch (error) { res.status(500).json({ success: false, error: error.message }); }
});
app.get('/api/health', async(_req, res) => {
    try {
        await q('SELECT 1');
        const email = process.env.RESEND_API_KEY ? 'configured (Resend)' : (getMailTransport() ? 'configured (Gmail SMTP)' : 'not configured');
        res.json({ success: true, database: 'connected', payments: razorpayConfigured ? 'configured' : 'not configured', email });
    } catch (error) { res.status(503).json({ success: false, database: 'unavailable', error: error.message }); }
});
app.get('/api/products', async(_req, res) => {
    try {
        const products = await q(`SELECT p.product_id,p.category_id,p.name,p.description,p.price,p.stock,p.pack_size,p.image_url,CAST(p.is_coming_soon AS UNSIGNED) AS is_coming_soon,c.city,c.name AS category_name FROM products p JOIN categories c ON c.category_id=p.category_id WHERE p.is_active=1 ORDER BY CAST(SUBSTRING_INDEX(p.category_id, '_', -1) AS UNSIGNED), CAST(SUBSTRING_INDEX(p.product_id, '_', -1) AS UNSIGNED)`);
        let variants = [];
        try {
            variants = await q(`SELECT variant_id,product_id,parent_variant_id,name,description,price,stock,pack_size,image_url,display_order FROM product_variants WHERE is_active=1 ORDER BY product_id,display_order`);
        } catch (variantError) {
            if (variantError.code !== 'ER_NO_SUCH_TABLE') throw variantError;
            console.warn('product_variants table is missing; serving standalone products until the catalog migration is applied.');
        }
        const byParent = new Map(products.map(product => [product.product_id, product]));
        const byVariant = new Map(variants.map(variant => [variant.variant_id, {...variant, variants: [] }]));
        for (const variant of byVariant.values()) {
            const parent = variant.parent_variant_id ? byVariant.get(variant.parent_variant_id) : byParent.get(variant.product_id);
            if (parent) parent.variants = parent.variants || [], parent.variants.push(variant);
        }
        res.json({ success: true, products });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Could not load products.' });
    }
});

app.post('/api/partner-interest', async(req, res) => {
    const name = clean(req.body.name, 120),
        contact = clean(req.body.contact, 20),
        email = clean(req.body.email).toLowerCase(),
        state = clean(req.body.state, 100),
        details = clean(req.body.details, 5000);
    if (!name || !contact || !emailOk(email) || !state || !details) return res.status(400).json({ success: false, error: 'Please complete all partner details with a valid email.' });
    try {
        const result = await q('INSERT INTO partner_applications (name,contact,email,state,details) VALUES (?,?,?,?,?)', [name, contact, email, state, details]);
        const partnerId = ref('PART', result.insertId);
        await q('UPDATE partner_applications SET partner_id=? WHERE id=?', [partnerId, result.insertId]);
        const summary = `<p><strong>${esc(name)}</strong> (${esc(partnerId)}) has submitted a partner enquiry.</p><p>Email: ${esc(email)}<br>Phone: ${esc(contact)}<br>State: ${esc(state)}</p><p>${esc(details)}</p>`;
        await Promise.all([sendEmail(email, 'We received your GharSe Snacks partner interest', `<p>Hi ${esc(name)},</p><p>Thank you for your interest in partnering with GharSe Snacks. Your partner ID is <strong>${partnerId}</strong>. Our team will contact you within seven days.</p>`), sendEmail(BUSINESS_EMAIL, `New partner interest: ${partnerId}`, summary)]);
        res.status(201).json({ success: true, partnerId, message: 'Partner interest submitted.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Could not save your partner interest.' });
    }
});

app.post('/api/bulk-order-enquiries', async(req, res) => {
    const name = clean(req.body.name, 120),
        email = clean(req.body.email).toLowerCase(),
        phone = clean(req.body.phone, 20),
        address = clean(req.body.address, 2000),
        state = clean(req.body.state, 100),
        product = clean(req.body.product, 160),
        quantity = clean(req.body.quantity, 100),
        requirements = clean(req.body.requirements, 5000);
    if (!name || !emailOk(email) || !phone || !address || !state || !product || !quantity) return res.status(400).json({ success: false, error: 'Please complete all required bulk-order details with a valid email.' });
    try {
        const customer = await createOrFindBulkCustomer({ name, email, phone, state, address });
        const result = await q('INSERT INTO bulk_order_enquiries (name,email,phone,delivery_address,state,product,quantity,requirements) VALUES (?,?,?,?,?,?,?,?)', [name, email, phone, address, state, product, quantity, requirements || null]);
        const enquiryId = ref('BULK', result.insertId);
        await q('UPDATE bulk_order_enquiries SET enquiry_id=? WHERE id=?', [enquiryId, result.insertId]);
        const details = `<p><strong>Bulk enquiry:</strong> ${esc(enquiryId)}</p><p><strong>Customer:</strong> ${esc(name)}<br><strong>Email:</strong> ${esc(email)}<br><strong>Phone:</strong> ${esc(phone)}<br><strong>State:</strong> ${esc(state)}<br><strong>Address:</strong> ${esc(address)}<br><strong>Product:</strong> ${esc(product)}<br><strong>Quantity:</strong> ${esc(quantity)}</p><p><strong>Requirements:</strong><br>${esc(requirements || 'None')}</p>`;
        const accountNote = customer.accountCreated ? `<p>We have also created your GharSe Snacks customer ID: <strong>${esc(customer.customerId)}</strong>. To set your password and log in, use reset code <strong>${esc(customer.setupCode)}</strong> on the Forgot password screen within 15 minutes.</p>` : `<p>Your GharSe Snacks customer ID is <strong>${esc(customer.customerId)}</strong>.</p>`;
        await Promise.all([sendEmail(email, 'Your GharSe Snacks bulk-order enquiry', `<p>Hi ${esc(name)},</p><p>We received your bulk-order enquiry. Your reference is <strong>${enquiryId}</strong>. Our team will contact you within seven days with availability and pricing.</p>${accountNote}`), sendEmail(BUSINESS_EMAIL, `New bulk order enquiry: ${enquiryId}`, details)]);
        res.status(201).json({ success: true, enquiryId, customerId: customer.customerId, accountCreated: customer.accountCreated });
    } catch (error) {
        console.error('Bulk order enquiry:', error);
        res.status(500).json({ success: false, error: 'Could not send your bulk-order enquiry.' });
    }
});

app.post('/api/subscriptions', async(req, res) => {
    const email = clean(req.body.email).toLowerCase();
    if (!emailOk(email)) return res.status(400).json({ success: false, error: 'Please enter a valid email address.' });
    try {
        const result = await q('INSERT INTO subscriptions (email) VALUES (?)', [email]);
        const subscriptionId = ref('SUB', result.insertId);
        await q('UPDATE subscriptions SET subscription_id=? WHERE id=?', [subscriptionId, result.insertId]);
        await Promise.all([
            sendEmail(email, 'Welcome to GharSe Snacks updates', `<p>Welcome to GharSe Snacks!</p><p>You will receive new regional snack drops, launch announcements and early-bird offers.</p>`),
            sendEmail(BUSINESS_EMAIL, `New newsletter subscriber: ${subscriptionId}`, `<p><strong>${esc(email)}</strong> subscribed to GharSe Snacks updates.</p><p>Subscription ID: ${esc(subscriptionId)}</p>`)
        ]);
        res.status(201).json({ success: true, subscriptionId });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') return res.json({ success: true, alreadySubscribed: true });
        res.status(500).json({ success: false, error: 'Could not subscribe you.' });
    }
});

app.post('/api/auth/signup', async(req, res) => {
    const name = clean(req.body.name, 120),
        email = clean(req.body.email).toLowerCase(),
        password = String(req.body.password || ''),
        phone = clean(req.body.contact, 20);
    if (!name || !emailOk(email) || password.length < 8) return res.status(400).json({ success: false, error: 'Enter your name, a valid email, and a password of at least 8 characters.' });
    try {
        const hash = await bcrypt.hash(password, 12);
        const result = await q('INSERT INTO users (name,email,password_hash,phone,place,state,address,preferred_snacks) VALUES (?,?,?,?,?,?,?,?)', [name, email, hash, phone || null, clean(req.body.place, 100) || null, clean(req.body.state, 100) || null, clean(req.body.address, 2000) || null, clean(req.body.preferredSnacks, 255) || null]);
        const userId = ref('USR', result.insertId);
        await q('UPDATE users SET user_id=? WHERE id=?', [userId, result.insertId]);
        await Promise.all([
            sendEmail(email, 'Welcome to GharSe Snacks', `<p>Hi ${esc(name)},</p><p>Your account is ready. Your GharSe Snacks user ID is <strong>${userId}</strong>.</p>`),
            sendEmail(BUSINESS_EMAIL, `New customer account: ${userId}`, `<p><strong>${esc(name)}</strong> created a GharSe Snacks customer account.</p><p>Email: ${esc(email)}<br>Customer ID: ${esc(userId)}</p>`)
        ]);
        res.status(201).json({ success: true, user: { id: result.insertId, customerId: userId, name, email, phone, accountType: 'registered' } });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ success: false, error: 'An account with this email already exists. Please log in.' });
        console.error(error);
        res.status(500).json({ success: false, error: 'Could not create account.' });
    }
});

app.post('/api/auth/login', async(req, res) => {
    const identifier = clean(req.body.identifier).toLowerCase(),
        password = String(req.body.password || '');
    if (!identifier || !password) return res.status(400).json({ success: false, error: 'Please provide your email or user ID and password.' });
    try {
        const users = await q('SELECT id,user_id,name,email,phone,password_hash FROM users WHERE LOWER(email)=? OR LOWER(user_id)=? LIMIT 1', [identifier, identifier]);
        if (!users.length || !(await bcrypt.compare(password, users[0].password_hash))) return res.status(401).json({ success: false, error: 'Invalid login credentials.' });
        const user = users[0];
        res.json({ success: true, user: { id: user.id, customerId: user.user_id, name: user.name, email: user.email, phone: user.phone, accountType: 'registered' } });
    } catch (error) { res.status(500).json({ success: false, error: 'Login failed. Please try again.' }); }
});

app.get('/api/reviews', async(_req, res) => { try { res.json({ success: true, reviews: await q('SELECT id,review_id AS review_ref,user_id,product_id,reviewer,review_type,rating,comment,created_at FROM reviews ORDER BY created_at DESC') }); } catch { res.status(500).json({ success: false, error: 'Could not load reviews.' }); } });
app.post('/api/reviews', async(req, res) => {
    const productId = clean(req.body.productId, 40),
        reviewer = clean(req.body.reviewer, 120),
        comment = clean(req.body.comment, 500),
        rating = Number(req.body.rating),
        type = clean(req.body.reviewType, 60);
    if (!productId || !reviewer || !comment || !Number.isInteger(rating) || rating < 1 || rating > 5) return res.status(400).json({ success: false, error: 'Please provide a valid review.' });
    try {
        const exists = await q('SELECT product_id FROM products WHERE product_id=?', [productId]);
        if (!exists.length) return res.status(400).json({ success: false, error: 'Invalid product.' });
        const result = await q('INSERT INTO reviews (user_id,product_id,reviewer,review_type,rating,comment) VALUES (?,?,?,?,?,?)', [Number(req.body.userId) || null, productId, reviewer, type, rating, comment]);
        const reviewId = ref('REV', result.insertId);
        await q('UPDATE reviews SET review_id=? WHERE id=?', [reviewId, result.insertId]);
        res.status(201).json({ success: true, review: { id: result.insertId, reviewRef: reviewId, productId } });
    } catch (error) { res.status(500).json({ success: false, error: 'Could not submit review.' }); }
});

app.post('/api/create-order', async(req, res) => {
    if (!razorpay) return res.status(503).json({ success: false, error: 'Payments are not configured yet. Add Razorpay keys to backend/.env.' });
    const customer = req.body.customer || {},
        items = Array.isArray(req.body.items) ? req.body.items : [];
    const name = clean(customer.name, 120),
        phone = clean(customer.phone, 20),
        address = clean(customer.address, 2000);
    if (!items.length || !name || !phone || !address) return res.status(400).json({ success: false, error: 'Please provide your name, phone number, and delivery address.' });
    try {
        const merged = new Map();
        for (const item of items) {
            const id = clean(item.id || item.product_id, 40),
                quantity = Number(item.quantity);
            if (!id || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) return res.status(400).json({ success: false, error: 'Invalid cart item.' });
            merged.set(id, (merged.get(id) || 0) + quantity);
        }
        const ids = [...merged.keys()],
            marks = ids.map(() => '?').join(',');
        const variantProducts = await q(`SELECT v.variant_id AS cart_id,v.variant_id,v.product_id,p.category_id,CONCAT(p.name, ' — ', v.name) AS name,v.price,v.stock,p.is_coming_soon FROM product_variants v JOIN products p ON p.product_id=v.product_id WHERE v.is_active=1 AND p.is_active=1 AND v.variant_id IN (${marks})`, ids);
        const standaloneProducts = await q(`SELECT p.product_id AS cart_id,NULL AS variant_id,p.product_id,p.category_id,p.name,p.price,p.stock,p.is_coming_soon FROM products p WHERE p.is_active=1 AND p.product_id IN (${marks})`, ids);
        const productMap = new Map([...variantProducts, ...standaloneProducts].map(p => [p.cart_id, p]));
        let total = 0;
        const orderItems = [];
        for (const [id, quantity] of merged) {
            const product = productMap.get(id);
            if (!product || product.is_coming_soon || product.price == null || Number(product.stock) < quantity) return res.status(400).json({ success: false, error: `${product ? product.name : 'A cart item'} is unavailable or out of stock.` });
            const price = Number(product.price);
            total += price * quantity;
            orderItems.push({...product, quantity, price });
        }
        const razorpayOrder = await razorpay.orders.create({ amount: Math.round(total * 100), currency: 'INR', receipt: `gss_${Date.now()}`, notes: { customer_name: name, customer_phone: phone } });
        const userIdentifier = clean(String(customer.userId || ''), 40);
        let userId = null;
        if (userIdentifier) {
            const users = await q('SELECT user_id FROM users WHERE id=? OR user_id=? LIMIT 1', [Number(userIdentifier) || 0, userIdentifier]);
            userId = users[0]?.user_id || null;
        }
        const result = await q('INSERT INTO orders (user_id,customer_name,customer_phone,delivery_address,subtotal,total_amount) VALUES (?,?,?,?,?,?)', [userId, name, phone, address, total, total]);
        const orderId = ref('ORD', result.insertId);
        await q('UPDATE orders SET order_id=? WHERE id=?', [orderId, result.insertId]);
        for (const item of orderItems) await q('INSERT INTO order_items (order_id,product_id,variant_id,category_id,product_name,unit_price,quantity) VALUES (?,?,?,?,?,?,?)', [orderId, item.product_id, item.variant_id, item.category_id, item.name, item.price, item.quantity]);
        const payment = await q('INSERT INTO payments (order_id,razorpay_order_id,amount) VALUES (?,?,?)', [orderId, razorpayOrder.id, total]);
        const paymentId = ref('PAY', payment.insertId);
        await q('UPDATE payments SET payment_id=? WHERE id=?', [paymentId, payment.insertId]);
        res.status(201).json({ success: true, key: process.env.RAZORPAY_KEY_ID, razorpayOrderId: razorpayOrder.id, amount: razorpayOrder.amount, currency: razorpayOrder.currency, orderNumber: orderId, paymentRef: paymentId });
    } catch (error) {
        console.error('Create order:', error);
        const detail = clean(error?.error?.description || error?.description || error?.message, 250);
        res.status(500).json({ success: false, error: detail ? `Could not create your payment order: ${detail}` : 'Could not create your payment order.' });
    }
});

app.post('/api/verify-payment', async(req, res) => {
    const orderId = clean(req.body.razorpay_order_id, 100),
        paymentId = clean(req.body.razorpay_payment_id, 100),
        signature = clean(req.body.razorpay_signature, 255);
    if (!orderId || !paymentId || !signature || !process.env.RAZORPAY_KEY_SECRET) return res.status(400).json({ success: false, error: 'Incomplete payment verification.' });
    const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(`${orderId}|${paymentId}`).digest('hex');
    if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return res.status(400).json({ success: false, error: 'Payment verification failed.' });
    const connection = await db.promise().getConnection();
    try {
        await connection.beginTransaction();
        const [paymentRows] = await connection.query('SELECT * FROM payments WHERE razorpay_order_id=? FOR UPDATE', [orderId]);
        if (!paymentRows.length) throw new Error('Payment order was not found.');
        const payment = paymentRows[0];
        const justPaid = payment.status !== 'paid';
        if (justPaid) {
            const [items] = await connection.query('SELECT * FROM order_items WHERE order_id=?', [payment.order_id]);
            for (const item of items) {
                const [update] = item.variant_id ?
                    await connection.query('UPDATE product_variants SET stock=stock-? WHERE variant_id=? AND stock>=?', [item.quantity, item.variant_id, item.quantity]) :
                    await connection.query('UPDATE products SET stock=stock-? WHERE product_id=? AND stock>=?', [item.quantity, item.product_id, item.quantity]);
                if (!update.affectedRows) throw new Error(`${item.product_name} is no longer available.`);
                if (item.variant_id) await connection.query('UPDATE products SET stock=GREATEST(stock-?, 0) WHERE product_id=?', [item.quantity, item.product_id]);
                await connection.query("INSERT INTO inventory_movements (product_id,change_quantity,reason,order_id) VALUES (?,?,'sale',?)", [item.product_id, -item.quantity, payment.order_id]);
            }
            await connection.query("UPDATE payments SET razorpay_payment_id=?,razorpay_signature=?,status='paid',paid_at=NOW() WHERE id=?", [paymentId, signature, payment.id]);
            await connection.query("UPDATE orders SET status='paid' WHERE order_id=?", [payment.order_id]);
        }
        const [orders] = await connection.query(`SELECT o.*,u.user_id AS customer_id,u.email AS customer_email
            FROM orders o LEFT JOIN users u ON u.user_id=o.user_id WHERE o.order_id=?`, [payment.order_id]);
        const [items] = await connection.query('SELECT product_id,variant_id,product_name,category_id,quantity,unit_price FROM order_items WHERE order_id=?', [payment.order_id]);
        await connection.commit();
        const order = orders[0],
            list = items.map(i => `<li>${esc(i.product_name)} — Product ID: ${esc(i.product_id)}, Variant ID: ${esc(i.variant_id || 'None')}, Category ID: ${esc(i.category_id)} — ${i.quantity} × ₹${Number(i.unit_price).toFixed(2)}</li>`).join('');
        const summary = `<p><strong>Order ID:</strong> ${esc(order.order_id)}<br><strong>Payment reference:</strong> ${esc(payment.payment_id)}<br><strong>Razorpay order ID:</strong> ${esc(orderId)}<br><strong>Razorpay payment ID:</strong> ${esc(paymentId)}<br><strong>Amount paid:</strong> ₹${Number(payment.amount).toFixed(2)}<br><strong>Total:</strong> ₹${Number(order.total_amount).toFixed(2)}</p><ul>${list}</ul>`;
        if (justPaid) await sendEmail(BUSINESS_EMAIL, `New paid order: ${order.order_id}`, `${summary}<p><strong>Customer:</strong> ${esc(order.customer_name)}<br><strong>User ID:</strong> ${esc(order.customer_id || 'Guest checkout')}<br><strong>Email:</strong> ${esc(order.customer_email || 'Not provided')}<br><strong>Phone:</strong> ${esc(order.customer_phone)}<br><strong>Address:</strong> ${esc(order.delivery_address)}</p>`);
        res.json({ success: true, verified: true, orderNumber: order.order_id, paymentRef: payment.payment_id });
    } catch (error) {
        await connection.rollback();
        console.error('Verify payment:', error);
        res.status(409).json({ success: false, error: error.message || 'Payment could not be completed.' });
    } finally { connection.release(); }
});

app.post('/api/product-interest', async(req, res) => {
    const productId = clean(req.body.productId, 40),
        userId = Number(req.body.userId);
    if (!productId || !Number.isInteger(userId)) return res.status(400).json({ success: false, error: 'Please log in to request an availability alert.' });
    try {
        const users = await q('SELECT email FROM users WHERE id=?', [userId]);
        if (!users.length) return res.status(401).json({ success: false, error: 'Please log in again.' });
        const targets = await q('SELECT product_id FROM products WHERE product_id=? UNION SELECT product_id FROM product_variants WHERE variant_id=? LIMIT 1', [productId, productId]);
        if (!targets.length) return res.status(400).json({ success: false, error: 'Invalid product.' });
        await q('INSERT INTO product_interest (product_id,email) VALUES (?,?)', [targets[0].product_id, users[0].email]);
        res.status(201).json({ success: true });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') return res.json({ success: true, alreadyRequested: true });
        res.status(500).json({ success: false, error: 'Could not save your request.' });
    }
});

app.post('/api/admin/restock', async(req, res) => {
    const token = clean(req.get('x-inventory-token'), 255);
    const variantId = clean(req.body.variantId, 40);
    const quantity = Number(req.body.quantity);
    if (!process.env.INVENTORY_ADMIN_TOKEN || token !== process.env.INVENTORY_ADMIN_TOKEN) return res.status(401).json({ success: false, error: 'Unauthorized inventory request.' });
    if (!variantId || !Number.isInteger(quantity) || quantity < 1) return res.status(400).json({ success: false, error: 'Provide a variant ID and a positive quantity.' });
    try {
        const variants = await q('SELECT v.variant_id,v.product_id,v.name,p.name AS product_name FROM product_variants v JOIN products p ON p.product_id=v.product_id WHERE v.variant_id=? LIMIT 1', [variantId]);
        if (!variants.length) return res.status(404).json({ success: false, error: 'Variant not found.' });
        const variant = variants[0];
        await q('UPDATE product_variants SET stock=stock+? WHERE variant_id=?', [quantity, variantId]);
        await q('UPDATE products SET stock=stock+? WHERE product_id=?', [quantity, variant.product_id]);
        const alerts = await q('SELECT email FROM product_interest WHERE product_id=?', [variant.product_id]);
        await Promise.all(alerts.map(alert => sendEmail(alert.email, `${variant.product_name} is back in stock`, `<p>Good news!</p><p>${esc(variant.product_name)} — ${esc(variant.name)} is back in stock. Visit GharSe Snacks to order it.</p>`)));
        await q('DELETE FROM product_interest WHERE product_id=?', [variant.product_id]);
        res.json({ success: true, notified: alerts.length });
    } catch (error) {
        console.error('Restock:', error);
        res.status(500).json({ success: false, error: 'Could not restock this variant.' });
    }
});
app.post('/api/suggestions', async(req, res) => {
    const name = clean(req.body.name, 120),
        email = clean(req.body.email).toLowerCase(),
        suggestion = clean(req.body.suggestion, 5000);
    if (!name || !suggestion || (email && !emailOk(email))) return res.status(400).json({ success: false, error: 'Please enter your name, suggestion and a valid email.' });
    try {
        await q('INSERT INTO suggestions (user_id,name,email,suggestion) VALUES (?,?,?,?)', [Number(req.body.userId) || null, name, email || null, suggestion]);
        res.status(201).json({ success: true });
    } catch { res.status(500).json({ success: false, error: 'Could not save your suggestion.' }); }
});
app.post('/api/auth/password-reset/request', async(req, res) => {
    const email = clean(req.body.email).toLowerCase();
    if (!emailOk(email)) return res.status(400).json({ success: false, error: 'Enter a valid email address.' });
    try {
        const users = await q('SELECT id,name FROM users WHERE email=?', [email]);
        if (users.length) {
            const code = String(crypto.randomInt(100000, 1000000));
            await q('INSERT INTO password_reset_tokens (user_id,token_hash,expires_at) VALUES (?,?,DATE_ADD(NOW(), INTERVAL 15 MINUTE))', [users[0].id, crypto.createHash('sha256').update(code).digest('hex')]);
            await sendEmail(email, 'Your GharSe Snacks reset code', `<p>Hi ${esc(users[0].name)},</p><p>Your password reset code is <strong>${code}</strong>. It expires in 15 minutes.</p>`);
        }
        res.json({ success: true });
    } catch { res.status(500).json({ success: false, error: 'Could not start password reset.' }); }
});
app.post('/api/auth/password-reset/confirm', async(req, res) => {
    const email = clean(req.body.email).toLowerCase(),
        code = clean(req.body.code, 6),
        password = String(req.body.password || '');
    if (!emailOk(email) || !/^\d{6}$/.test(code) || password.length < 8) return res.status(400).json({ success: false, error: 'Enter a valid code and a password of at least 8 characters.' });
    try {
        const rows = await q('SELECT pr.id,pr.user_id FROM password_reset_tokens pr JOIN users u ON u.id=pr.user_id WHERE u.email=? AND pr.token_hash=? AND pr.used_at IS NULL AND pr.expires_at>NOW() ORDER BY pr.id DESC LIMIT 1', [email, crypto.createHash('sha256').update(code).digest('hex')]);
        if (!rows.length) return res.status(400).json({ success: false, error: 'This reset code is invalid or expired.' });
        await q('UPDATE users SET password_hash=? WHERE id=?', [await bcrypt.hash(password, 12), rows[0].user_id]);
        await q('UPDATE password_reset_tokens SET used_at=NOW() WHERE id=?', [rows[0].id]);
        res.json({ success: true });
    } catch { res.status(500).json({ success: false, error: 'Could not update password.' }); }
});

app.get('/', (_req, res) => res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html')));
app.listen(PORT, '0.0.0.0', () => console.log(`GharSe Snacks running on http://localhost:${PORT}`));
