const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const path = require("path");
const Razorpay = require("razorpay");

require("dotenv").config({
    path: path.join(__dirname, ".env")
});

const db = require("./db");

const app = express();

// =====================================================
// MIDDLEWARE
// =====================================================

app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());

// =====================================================
// RAZORPAY
// =====================================================

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// =====================================================
// DATABASE HELPER
// =====================================================

function query(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.query(sql, params, (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
}

async function sendEmail(to, subject, html) {
    if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM || !to) return false;
    try {
        const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({ from: process.env.EMAIL_FROM, to: [to], subject, html })
        });
        if (!response.ok) throw new Error(await response.text());
        return true;
    } catch (error) {
        console.error("Email notification failed:", error.message);
        return false;
    }
}

// =====================================================
// ID GENERATION
// =====================================================

// Customer ID
// Example: GSS-MUM-000001
function generateCustomerId(place, numericId) {
    const padded = String(numericId).padStart(6, "0");

    const cleanCity = String(place || "INDIA")
        .trim()
        .toUpperCase()
        .replace(/[^A-Z]/g, "")
        .slice(0, 3) || "IND";

    return `GSS-${cleanCity}-${padded}`;
}

// Order ID
// Example: GSS-MUM-ORD-000001
function generateOrderId(place, numericId) {
    const padded = String(numericId).padStart(6, "0");

    const cleanCity = String(place || "INDIA")
        .trim()
        .toUpperCase()
        .replace(/[^A-Z]/g, "")
        .slice(0, 3) || "IND";

    return `GSS-${cleanCity}-ORD-${padded}`;
}

// Generic reference
// Example: GSS-PAY-000001
// Example: GSS-REV-000001
// Example: GSS-SUB-000001
// Example: GSS-ITEM-000001
function generateReferenceId(prefix, numericId) {
    const padded = String(numericId).padStart(6, "0");

    return `GSS-${prefix}-${padded}`;
}

// =====================================================
// SERVE FRONTEND
// =====================================================

const frontendPath = path.join(__dirname, "..", "frontend");

app.use(express.static(frontendPath));

app.get("/", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
});

// =====================================================
// TEST MYSQL CONNECTION
// =====================================================

app.get("/test-db", (req, res) => {
    db.query("SELECT 1 AS test", (err, result) => {
        if (err) {
            console.error("Database query failed:", err.message);

            return res.status(500).json({
                success: false,
                message: "Database connection failed",
                error: err.message
            });
        }

        res.json({
            success: true,
            message: "MySQL connected successfully!",
            result
        });
    });
});

// =====================================================
// PRODUCTS
// =====================================================
// IMPORTANT:
// product_id and category_id are STRING IDs.
// Example:
// product_id = GSS_AHM_BBH_006
// category_id = GSS_AHM_001
// =====================================================

app.get("/api/products", async(req, res) => {
    try {
        const products = await query(`
            SELECT product_id, name, description, price, image_url, category_id, city
            FROM catalog 
            ORDER BY city, name
        `);
        res.json({ success: true, products });
    } catch (err) {
        console.error("Failed to fetch products:", err.message);
        res.status(500).json({ success: false, error: "Could not load products." });
    }
});

// Order/payment history is stored in order_details, items_ordered and payments.
// The client can use this endpoint to show a signed-in customer's past orders.
app.get("/api/orders/:userId", async(req, res) => {
    const userId = Number(req.params.userId);
    if (!Number.isInteger(userId) || userId < 1) return res.status(400).json({ success: false, error: "Invalid user." });
    try {
        const orders = await query(
            `SELECT od.id, od.order_number, od.total_amount, od.status, od.created_at,
                    p.payment_ref, p.status AS payment_status, p.razorpay_payment_id
             FROM order_details od
             LEFT JOIN payments p ON p.order_id = od.id
             WHERE od.user_id = ?
             ORDER BY od.created_at DESC`, [userId]
        );
        const orderIds = orders.map((order) => order.id);
        const items = orderIds.length ? await query(
            `SELECT io.order_id, io.product_id, io.category_id, io.quantity, io.price, c.name
             FROM items_ordered io
             LEFT JOIN catalog c ON c.product_id = io.product_id
             WHERE io.order_id IN (${orderIds.map(() => "?").join(",")})`, orderIds
        ) : [];
        const itemsByOrder = new Map();
        items.forEach((item) => itemsByOrder.set(item.order_id, [...(itemsByOrder.get(item.order_id) || []), item]));
        res.json({ success: true, orders: orders.map((order) => ({...order, items: itemsByOrder.get(order.id) || [] })) });
    } catch (error) {
        console.error("Failed to load order history:", error.message);
        res.status(500).json({ success: false, error: "Could not load order history." });
    }
});

// =====================================================
// PARTNER APPLICATIONS
// =====================================================

app.post("/api/partner-interest", async(req, res) => {

    const {
        name,
        contact,
        email,
        state,
        details
    } = req.body;

    if (!name ||
        !contact ||
        !email ||
        !state ||
        !details
    ) {
        return res.status(400).json({
            success: false,
            error: "Please complete all partner details."
        });
    }

    try {

        const result = await query(
            `
            INSERT INTO partner_applications
            (name, contact, email, state, details)
            VALUES (?, ?, ?, ?, ?)
            `, [
                name.trim(),
                contact.trim(),
                email.trim().toLowerCase(),
                state.trim(),
                details.trim()
            ]
        );

        const partnerId = generateReferenceId(
            "PARTNER",
            result.insertId
        );

        await query(
            `
            UPDATE partner_applications
            SET partner_id = ?
            WHERE id = ?
            `, [
                partnerId,
                result.insertId
            ]
        );
        await sendEmail(email, "GharSe Snacks Partnership Application Received", "<p>Hi " + name + ",</p><p>Thank you for applying to partner with GharSe Snacks. Our team will get in touch with you within 7 days.</p>");

        res.status(201).json({
            success: true,
            message: "Partner application submitted successfully!",
            id: result.insertId,
            partnerId
        });

    } catch (err) {

        console.error(
            "Failed to save partner application:",
            err.message
        );

        res.status(500).json({
            success: false,
            error: "Failed to save application."
        });
    }
});

app.get("/api/partners", async(req, res) => {

    try {

        const partners = await query(`
            SELECT
                id,
                partner_id,
                name,
                contact,
                email,
                state,
                details,
                status,
                created_at
            FROM partner_applications
            ORDER BY created_at DESC
            LIMIT 50
        `);

        res.json({
            success: true,
            partners
        });

    } catch (err) {

        console.error(
            "Failed to fetch partners:",
            err.message
        );

        res.status(500).json({
            success: false,
            error: "Could not load partners."
        });
    }
});

// =====================================================
// SUBSCRIPTIONS
// =====================================================
// Subscription DOES NOT require an account.
// Email alone is enough.
// =====================================================

app.post("/api/subscriptions", async(req, res) => {

    const { email, userId } = req.body;

    const cleanEmail =
        typeof email === "string" ?
        email.trim().toLowerCase() :
        "";

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {

        return res.status(400).json({
            success: false,
            error: "Please enter a valid email address."
        });
    }

    try {

        let validUserId = null;
        if (Number.isInteger(Number(userId)) && Number(userId) > 0) {
            const users = await query("SELECT id FROM users WHERE id = ? LIMIT 1", [Number(userId)]);
            validUserId = users.length ? users[0].id : null;
        }

        const result = await query(
            `
            INSERT INTO subscriptions
            (user_id, email)
            VALUES (?, ?)
            `, [validUserId, cleanEmail]
        );

        const subscriptionRef =
            generateReferenceId(
                "SUB",
                result.insertId
            );

        await query(
            `
            UPDATE subscriptions
            SET subscription_ref = ?
            WHERE id = ?
            `, [
                subscriptionRef,
                result.insertId
            ]
        );

        await sendEmail(
            cleanEmail,
            "Welcome to GharSe Snacks updates",
            "<p>Thank you for subscribing to GharSe Snacks!</p><p>Stay updated on new products, special discounts, and delicious deals from across India.</p>"
        );

        res.status(201).json({
            success: true,
            message: "Subscribed successfully!",
            id: result.insertId,
            subscriptionRef
        });

    } catch (err) {

        if (err.code === "ER_DUP_ENTRY") {

            return res.status(200).json({
                success: true,
                message: "You are already subscribed!",
                alreadySubscribed: true
            });
        }

        console.error(
            "Failed to save subscription:",
            err.message
        );

        res.status(500).json({
            success: false,
            error: "Could not subscribe you."
        });
    }
});

// =====================================================
// REVIEWS - GET
// =====================================================

app.get("/api/reviews", async(req, res) => {

    try {

        const reviews = await query(`
            SELECT
                id,
                review_ref,
                user_id,
                product_id,
                reviewer,
                review_type,
                rating,
                comment,
                created_at
            FROM reviews
            ORDER BY created_at DESC
        `);

        res.json({
            success: true,
            reviews
        });

    } catch (err) {

        console.error(
            "Failed to fetch reviews:",
            err.message
        );

        res.status(500).json({
            success: false,
            error: "Could not load reviews."
        });
    }
});

// =====================================================
// REVIEWS - POST
// =====================================================
// Login is NOT required.
// userId can be null for guests.
// productId is a STRING.
// =====================================================

app.post("/api/reviews", async(req, res) => {

    const {
        userId,
        productId,
        reviewer,
        reviewType,
        rating,
        comment
    } = req.body;

    const cleanName =
        typeof reviewer === "string" ?
        reviewer.trim().slice(0, 100) :
        "";

    const cleanComment =
        typeof comment === "string" ?
        comment.trim().slice(0, 500) :
        "";

    const cleanRating = Number(rating);

    // IMPORTANT:
    // Product IDs are STRING IDs.
    // Example: GSS_AHM_BBH_006
    const cleanProductId =
        typeof productId === "string" ?
        productId.trim() :
        String(productId || "").trim();

    if (!cleanProductId ||
        !cleanName ||
        !cleanComment ||
        !Number.isInteger(cleanRating) ||
        cleanRating < 1 ||
        cleanRating > 5 ||
        ![
            "Bought from GharSe Snacks",
            "Tried a sample"
        ].includes(reviewType)
    ) {

        return res.status(400).json({
            success: false,
            error: "Please provide a valid review."
        });
    }

    try {

        // =================================================
        // CHECK THAT PRODUCT EXISTS
        // =================================================

        const productCheck = await query(
            `
            SELECT product_id
            FROM catalog
            WHERE product_id = ?
            LIMIT 1
            `, [cleanProductId]
        );

        if (!productCheck.length) {

            return res.status(400).json({
                success: false,
                error: "Invalid product."
            });
        }

        // =================================================
        // USER CHECK
        // =================================================

        let validUserId = null;

        if (userId) {

            const users = await query(
                `
                SELECT id
                FROM users
                WHERE id = ?
                `, [Number(userId)]
            );

            if (users.length) {
                validUserId = Number(userId);
            }
        }

        // =================================================
        // INSERT REVIEW
        // =================================================

        const result = await query(
            `
            INSERT INTO reviews
            (
                user_id,
                product_id,
                reviewer,
                review_type,
                rating,
                comment
            )
            VALUES (?, ?, ?, ?, ?, ?)
            `, [
                validUserId,
                cleanProductId,
                cleanName,
                reviewType,
                cleanRating,
                cleanComment
            ]
        );

        const reviewRef =
            generateReferenceId(
                "REV",
                result.insertId
            );

        await query(
            `
            UPDATE reviews
            SET review_ref = ?
            WHERE id = ?
            `, [
                reviewRef,
                result.insertId
            ]
        );

        res.status(201).json({
            success: true,
            message: "Review submitted successfully!",
            review: {
                id: result.insertId,
                reviewRef,
                productId: cleanProductId
            }
        });

    } catch (err) {

        console.error(
            "Failed to save review:",
            err.message
        );

        res.status(500).json({
            success: false,
            error: "Could not submit review."
        });
    }
});

// =====================================================
// USERS - SIGNUP
// =====================================================

app.post("/api/auth/signup", async(req, res) => {

    const {
        name,
        email,
        password,
        contact,
        place,
        address,
        preferredSnacks,
        state
    } = req.body;

    if (!name || !email || !password) {

        return res.status(400).json({
            success: false,
            error: "Please provide name, email, and password."
        });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())) {
        return res.status(400).json({ success: false, error: "Please enter a valid email address." });
    }
    if (String(password).length < 8) {
        return res.status(400).json({ success: false, error: "Password must be at least 8 characters." });
    }

    try {

        const cleanEmail =
            email.trim().toLowerCase();

        const passwordHash =
            await bcrypt.hash(password, 10);

        const result = await query(
            `
            INSERT INTO users
            (
                name,
                email,
                password,
                phone,
                place,
                address,
                preferred_snacks,
                account_type
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, 'registered')
            `, [
                name.trim(),
                cleanEmail,
                passwordHash,
                contact ?
                contact.trim() :
                null,
                place ?
                place.trim() :
                null,
                address ?
                address.trim() :
                null,
                preferredSnacks ?
                preferredSnacks.trim() :
                null
            ]
        );

        const customerId =
            generateCustomerId(
                place,
                result.insertId
            );

        await query(
            `
            UPDATE users
            SET customer_id = ?
            WHERE id = ?
            `, [
                customerId,
                result.insertId
            ]
        );

        await sendEmail(
            cleanEmail,
            "Welcome to GharSe Snacks",
            `<p>Hi ${name.trim()},</p><p>Your GharSe Snacks account has been created successfully.</p><p>Your customer ID is <strong>${customerId}</strong>. We're excited to bring regional snacks, new launches, and offers to you.</p>`
        );

        res.status(201).json({
            success: true,
            message: "Account created successfully!",
            user: {
                id: result.insertId,
                customerId,
                name: name.trim(),
                email: cleanEmail,
                accountType: "registered"
            }
        });

    } catch (err) {

        console.error("========== SIGNUP ERROR ==========");
        console.error("Code:", err.code);
        console.error("Message:", err.message);
        console.error("SQL Message:", err.sqlMessage);
        console.error("===================================");

        if (err.code === "ER_DUP_ENTRY") {
            return res.status(409).json({ success: false, error: "An account with this email already exists. Please log in." });
        }

        return res.status(500).json({
            success: false,
            error: err.sqlMessage ||
                err.message ||
                "Could not create account."
        });
    }
});

// =====================================================
// USERS - LOGIN
// =====================================================

app.post("/api/auth/login", async(req, res) => {

    const {
        identifier,
        password
    } = req.body;

    if (!identifier || !password) {

        return res.status(400).json({
            success: false,
            error: "Please provide credentials and password."
        });
    }

    try {

        const cleanId =
            identifier.trim().toLowerCase();

        const users = await query(
            `
            SELECT
                id,
                customer_id,
                name,
                email,
                phone,
                password,
                account_type
            FROM users
            WHERE LOWER(email) = ?
               OR LOWER(customer_id) = ?
               OR LOWER(name) = ?
            `, [
                cleanId,
                cleanId,
                cleanId
            ]
        );

        if (!users.length) {

            return res.status(401).json({
                success: false,
                error: "Invalid login credentials."
            });
        }

        const dbUser = users[0];

        if (!dbUser.password ||
            dbUser.account_type === "guest"
        ) {

            return res.status(401).json({
                success: false,
                error: "This is a guest account. Please create a registered account to log in."
            });
        }

        const passwordMatches =
            await bcrypt.compare(
                password,
                dbUser.password
            );

        if (!passwordMatches) {

            return res.status(401).json({
                success: false,
                error: "Invalid login credentials."
            });
        }

        res.json({
            success: true,
            user: {
                id: dbUser.id,
                customerId: dbUser.customer_id,
                name: dbUser.name,
                email: dbUser.email,
                phone: dbUser.phone,
                accountType: dbUser.account_type
            }
        });

    } catch (err) {

        console.error(
            "Login failed:",
            err.message
        );

        res.status(500).json({
            success: false,
            error: "Login failed. Please try again."
        });
    }
});

// =====================================================
// CREATE ORDER
// =====================================================
// IMPORTANT:
// Login is NOT required.
// Product IDs are STRING IDs.
// Category IDs are STRING IDs.
// =====================================================

app.post("/api/create-order", async(req, res) => {

    const {
        customer = {},
            items
    } = req.body;

    if (!Array.isArray(items) ||
        !items.length
    ) {

        return res.status(400).json({
            success: false,
            error: "Your cart is empty."
        });
    }

    try {

        let userId =
            customer.userId ?
            Number(customer.userId) :
            null;

        let dbCustomer = null;

        // =================================================
        // REGISTERED USER CHECK
        // =================================================

        if (userId) {

            const users = await query(
                `
                SELECT
                    id,
                    customer_id,
                    name,
                    email,
                    phone,
                    address,
                    place,
                    account_type
                FROM users
                WHERE id = ?
                `, [userId]
            );

            if (!users.length) {

                return res.status(400).json({
                    success: false,
                    error: "Customer account not found."
                });
            }

            dbCustomer = users[0];

            if (!dbCustomer.phone ||
                !dbCustomer.address
            ) {

                return res.status(400).json({
                    success: false,
                    error: "Please provide your phone number and delivery address before checkout."
                });
            }
        }

        // =================================================
        // GUEST CHECKOUT
        // =================================================
        // Guests never get a users row: their order keeps a NULL user_id and
        // stores its delivery/contact snapshot on order_details instead.
        if (!userId) {
            if (!customer.name || !customer.phone || !customer.address || !customer.place) {
                return res.status(400).json({ success: false, error: "Please provide your name, phone number, delivery address and city." });
            }
            dbCustomer = {
                customer_id: null,
                name: customer.name.trim(),
                email: typeof customer.email === "string" && customer.email.trim() ? customer.email.trim().toLowerCase() : null,
                phone: customer.phone.trim(),
                address: customer.address.trim(),
                place: customer.place.trim(),
                account_type: "guest"
            };
            dbCustomer.guest_ref = `gss_userid_${crypto.randomBytes(4).toString('hex')}`;
        }

        // =================================================
        // GET PRODUCTS FROM CATALOG
        // =================================================
        // IMPORTANT:
        // DO NOT use Number() here.
        // Product IDs are strings.
        // =================================================

        const productIds = items.map(item => {
            return typeof item.id === "string" ?
                item.id.trim() :
                String(item.id || "").trim();
        });

        // Remove empty IDs
        if (
            productIds.some(
                id => !id
            )
        ) {

            return res.status(400).json({
                success: false,
                error: "Invalid product."
            });
        }

        // =================================================
        // SQL PLACEHOLDERS
        // =================================================

        const placeholders =
            productIds
            .map(() => "?")
            .join(",");

        const products =
            await query(
                `
                SELECT
                    product_id,
                    name,
                    price,
                    stock,
                    category_id,
                    category_name
                FROM catalog
                WHERE product_id IN (${placeholders})
                `,
                productIds
            );

        // =================================================
        // PRODUCT MAP
        // =================================================
        // Keys remain STRING IDs.
        // =================================================

        const productMap =
            new Map(
                products.map(product => [
                    String(product.product_id).trim(),
                    product
                ])
            );

        // =================================================
        // CALCULATE ORDER
        // =================================================

        let subtotal = 0;

        const orderItems = [];

        for (const item of items) {

            const itemProductId =
                typeof item.id === "string" ?
                item.id.trim() :
                String(item.id || "").trim();

            const product =
                productMap.get(
                    itemProductId
                );

            const quantity =
                Number(item.quantity);

            if (!product ||
                !Number.isInteger(quantity) ||
                quantity < 1 ||
                quantity > 20
            ) {

                return res.status(400).json({
                    success: false,
                    error: "Invalid cart item."
                });
            }

            // =================================================
            // STOCK CHECK
            // =================================================

            if (
                Number(product.stock) <
                quantity
            ) {

                return res.status(400).json({
                    success: false,
                    error: `${product.name} does not have enough stock.`
                });
            }

            // =====================================================
            // GHARSE SNACKS SELLING PRICES
            // These are the prices charged to customers.
            // SQL catalog.price is NOT used for checkout.
            // =====================================================

            const LOCAL_PRICES = {
                "sev": 69,
                "spicy parmal / murmure": 69,
                "spicy potato chips": 35,
                "banana chips": 35,
                "bhakarwadi": 89,
                "chana jor": 45,
                "besan ladoo": 35
            };

            const productName =
                String(product.name || "")
                .trim()
                .toLowerCase();

            const sellingPrice =
                LOCAL_PRICES[productName];

            if (sellingPrice == null) {

                return res.status(400).json({
                    success: false,
                    error: `${product.name} is currently unavailable for online purchase.`
                });
            }

            subtotal +=
                sellingPrice * quantity;

            orderItems.push({
                productId: String(product.product_id).trim(),

                name: product.name,

                price: sellingPrice,

                quantity,

                categoryId: String(product.category_id).trim(),

                categoryName: product.category_name
            });
        }

        const totalAmount =
            subtotal;

        const amountInPaise =
            Math.round(
                totalAmount * 100
            );

        // =================================================
        // CREATE RAZORPAY ORDER
        // =================================================

        const receipt =
            `GS-${Date.now()}`;

        const razorpayOrder =
            await razorpay.orders.create({
                amount: amountInPaise,
                currency: "INR",
                receipt,
                notes: {
                    customer_id: dbCustomer.customer_id,

                    customer_name: dbCustomer.name,

                    customer_phone: dbCustomer.phone,

                    delivery_address: dbCustomer.address
                }
            });

        // =================================================
        // CREATE DATABASE ORDER
        // =================================================

        const orderResult =
            await query(
                `
                const orderResult = await query(`
                INSERT INTO order_details(user_id, guest_ref, customer_name, customer_email, customer_phone, delivery_address, delivery_place, total_amount, status) VALUES( ? , ? , ? )
                `, [userId, dbCustomer.guest_ref, dbCustomer.name, dbCustomer.email, dbCustomer.phone, dbCustomer.address, dbCustomer.place, totalAmount, "pending"]);

        const dbOrderId =
            orderResult.insertId;

        // =================================================
        // ORDER NUMBER
        // =================================================

        const orderNumber =
            generateOrderId(
                customer.place ||
                dbCustomer.place,
                dbOrderId
            );

        await query(
            `
                UPDATE order_details SET order_number = ?
                WHERE id = ?
                `, [
                orderNumber,
                dbOrderId
            ]
        );

        // =================================================
        // SAVE ORDER ITEMS
        // =================================================
        // product_id and category_id are STRING values.
        // =================================================

        for (const item of orderItems) {

            const itemResult =
                await query(
                    `
                INSERT INTO items_ordered(
                    order_id,
                    product_id,
                    category_id,
                    quantity,
                    price
                ) VALUES( ? , ? , ? , ? , ? )
                `, [
                        dbOrderId,
                        item.productId,
                        item.categoryId,
                        item.quantity,
                        item.price
                    ]
                );

            const itemRef =
                generateReferenceId(
                    "ITEM",
                    itemResult.insertId
                );

            await query(
                `
                UPDATE items_ordered SET item_ref = ?
                WHERE id = ?
                `, [
                    itemRef,
                    itemResult.insertId
                ]
            );
        }

        // =================================================
        // CREATE PAYMENT RECORD
        // =================================================

        const paymentResult =
            await query(
                `
                INSERT INTO payments(
                    order_id,
                    razorpay_order_id,
                    amount,
                    status
                ) VALUES( ? , ? , ? , ? )
                `, [
                    dbOrderId,
                    razorpayOrder.id,
                    totalAmount,
                    "created"
                ]
            );

        const paymentRef =
            generateReferenceId(
                "PAY",
                paymentResult.insertId
            );

        await query(
            `
                UPDATE payments SET payment_ref = ?
                WHERE id = ?
                `, [
                paymentRef,
                paymentResult.insertId
            ]
        );

        // =================================================
        // RESPONSE TO FRONTEND
        // =================================================

        res.status(201).json({
            success: true,

            // Razorpay frontend information
            key: process.env.RAZORPAY_KEY_ID,

            razorpayOrderId: razorpayOrder.id,

            amount: razorpayOrder.amount,

            currency: razorpayOrder.currency,

            // Database information
            dbOrderId,

            orderNumber,

            paymentRef,

            // Customer information
            customer: {
                userId,
                customerId: dbCustomer.customer_id,
                name: dbCustomer.name,
                email: dbCustomer.email,
                phone: dbCustomer.phone,
                accountType: dbCustomer.account_type
            },

            // Product information
            items: orderItems.map(item => ({
                productId: item.productId,

                categoryId: item.categoryId,

                categoryName: item.categoryName,

                name: item.name,

                price: item.price,

                quantity: item.quantity
            }))
        });

    } catch (err) {

        console.error(
            "Failed to create order:",
            err.message
        );

        console.error(err);

        res.status(500).json({
            success: false,
            error: "Could not create payment order."
        });
    }
});

// =====================================================
// VERIFY PAYMENT
// =====================================================

app.post("/api/verify-payment", async(req, res) => {

    const {
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: signature
    } = req.body;

    if (!orderId ||
        !paymentId ||
        !signature
    ) {

        return res.status(400).json({
            success: false,
            error: "Incomplete payment."
        });
    }

    try {

        const expected =
            crypto
            .createHmac(
                "sha256",
                process.env.RAZORPAY_KEY_SECRET
            )
            .update(
                `
                $ { orderId } | $ { paymentId }
                `
            )
            .digest("hex");

        const valid =
            signature.length ===
            expected.length &&
            crypto.timingSafeEqual(
                Buffer.from(signature),
                Buffer.from(expected)
            );

        if (!valid) {

            return res.status(400).json({
                success: false,
                error: "Payment verification failed."
            });
        }

        // =================================================
        // UPDATE PAYMENT
        // =================================================

        await query(
            `
                UPDATE payments SET razorpay_payment_id = ? ,
                razorpay_signature = ? ,
                status = 'paid'
                WHERE razorpay_order_id = ?
                `, [
                paymentId,
                signature,
                orderId
            ]
        );

        // =================================================
        // FIND DATABASE ORDER
        // =================================================

        const payments =
            await query(
                `
                SELECT order_id,
                payment_ref FROM payments WHERE razorpay_order_id = ?
                `, [orderId]
            );

        // =================================================
        // UPDATE ORDER STATUS
        // =================================================

        if (payments.length) {

            await query(
                `
                UPDATE order_details SET status = 'paid'
                WHERE id = ?
                `, [
                    payments[0].order_id
                ]
            );

            const orderRows = await query(
                `
                SELECT od.order_number, od.total_amount, u.name, u.email, u.phone, u.address FROM order_details od LEFT JOIN users u ON u.id = od.user_id WHERE od.id = ? `, [payments[0].order_id]
            );
            const orderedItems = await query(
                `
                SELECT io.quantity, io.price, c.name FROM items_ordered io JOIN catalog c ON c.product_id = io.product_id WHERE io.order_id = ? `, [payments[0].order_id]
            );
            const order = orderRows[0];
            const itemList = orderedItems.map((item) =>
                ` < li > $ { item.name }($ { item.category_name })— $ { item.quantity }×₹
                $ { Number(item.price).toFixed(2) } < /li>`
            ).join("");

        if (order) {
            const summary = `<p><strong>Order:</strong> ${order.order_number}</p><ul>${itemList}</ul><p><strong>Total:</strong> ₹${Number(order.total_amount).toFixed(2)}</p>`;
            await sendEmail(order.email, "Your GharSe Snacks order is confirmed", `<p>Hi ${order.name || "there"},</p><p>Your payment was successful. Thank you for ordering with GharSe Snacks.</p>${summary}<p>We will share delivery updates soon.</p>`);
            await sendEmail(process.env.ORDER_NOTIFICATION_EMAIL || "gharse.team@gmail.com", `New paid order: ${order.order_number}`, `<p>A customer has completed payment.</p>${summary}<p><strong>Customer:</strong> ${order.name || "Guest"}<br><strong>Phone:</strong> ${order.phone || "Not provided"}<br><strong>Address:</strong> ${order.address || "Not provided"}</p>`);
        }
    }

    res.json({
        success: true,
        verified: true,
        paymentRef: payments.length ?
            payments[0].payment_ref : null
    });

} catch (err) {

    console.error(
        "Payment verification failed:",
        err.message
    );

    res.status(500).json({
        success: false,
        error: "Payment verification failed."
    });
}
});

// =====================================================
// START SERVER
// =====================================================

const PORT =
    process.env.PORT || 3001;

const HOST =
    "0.0.0.0";

app.listen(
    PORT,
    HOST,
    () => {

        console.log(
            `Server running on ${HOST}:${PORT}`
        );
    }
);