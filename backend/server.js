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

app.use(cors());
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

// =====================================================
// ID GENERATION
// =====================================================

// Customer ID
// Example: GSS-MH-000001
function generateCustomerId(stateCode, numericId) {
    const padded = String(numericId).padStart(6, "0");

    const cleanState = String(stateCode || "IN")
        .trim()
        .toUpperCase()
        .replace(/[^A-Z]/g, "")
        .slice(0, 2) || "IN";

    return `GSS-${cleanState}-${padded}`;
}

// Order ID
// Example: GSS-MH-ORD-000001
function generateOrderId(stateCode, numericId) {
    const padded = String(numericId).padStart(6, "0");

    const cleanState = String(stateCode || "IN")
        .trim()
        .toUpperCase()
        .replace(/[^A-Z]/g, "")
        .slice(0, 2) || "IN";

    return `GSS-${cleanState}-ORD-${padded}`;
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
// STATE CODE HELPER
// =====================================================

function getStateCode(state, place) {
    const value = state || place || "IN";

    const clean = String(value)
        .trim()
        .toUpperCase()
        .replace(/[^A-Z]/g, "");

    return clean.slice(0, 2) || "IN";
}

// =====================================================
// HOME
// =====================================================

// =====================================================
// SERVE FRONTEND
// =====================================================

const frontendPath = path.join(__dirname, "..");

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

app.get("/api/products", async(req, res) => {
    try {
        const products = await query(`
            SELECT
                product_id AS id,
                product_code,
                name,
                description,
                price,
                stock,
                image_url,
                category_id,
                category_name AS category
            FROM catalog
            ORDER BY product_id
        `);

        res.json({
            success: true,
            products
        });

    } catch (err) {
        console.error(
            "Failed to fetch products:",
            err.message
        );

        res.status(500).json({
            success: false,
            error: "Could not load products."
        });
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

    const { email } = req.body;

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

        const result = await query(
            `
            INSERT INTO subscriptions
            (email)
            VALUES (?)
            `, [cleanEmail]
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
    const cleanProductId = Number(productId);

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

        // If userId is provided, make sure it exists.
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
                reviewRef
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
// Signup is optional, but still available.
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

        const stateCode =
            getStateCode(state, place);

        const customerId =
            generateCustomerId(
                stateCode,
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

        return res.status(500).json({
            success: false,
            error: err.sqlMessage || err.message || "Could not create account."
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

        // Guest accounts do not have passwords.
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
// If userId exists -> registered user.
// If userId does not exist -> create guest user.
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

        if (!userId) {

            if (!customer.name ||
                !customer.phone ||
                !customer.address
            ) {

                return res.status(400).json({
                    success: false,
                    error: "Please provide your name, phone number and delivery address."
                });
            }

            const guestEmail =
                customer.email &&
                typeof customer.email === "string" ?
                customer.email.trim().toLowerCase() :
                null;

            // If email already belongs to a registered account,
            // don't silently create another account with same email.
            if (guestEmail) {

                const existingUsers = await query(
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
                    WHERE LOWER(email) = ?
                    LIMIT 1
                    `, [guestEmail]
                );

                if (existingUsers.length) {

                    const existingUser =
                        existingUsers[0];

                    // Use existing account as the order owner.
                    userId = existingUser.id;
                    dbCustomer = existingUser;

                    // If existing account is registered,
                    // use its saved information where available.
                    if (
                        dbCustomer.account_type === "registered" &&
                        (!dbCustomer.phone ||
                            !dbCustomer.address
                        )
                    ) {

                        await query(
                            `
                            UPDATE users
                            SET
                                phone = ?,
                                address = ?,
                                place = COALESCE(?, place)
                            WHERE id = ?
                            `, [
                                customer.phone.trim(),
                                customer.address.trim(),
                                customer.place ?
                                customer.place.trim() :
                                null,
                                userId
                            ]
                        );

                        const refreshed =
                            await query(
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

                        dbCustomer =
                            refreshed[0];
                    }

                } else {

                    // Create guest user.
                    const guestResult =
                        await query(
                            `
                            INSERT INTO users
                            (
                                name,
                                email,
                                password,
                                phone,
                                place,
                                address,
                                account_type
                            )
                            VALUES (?, ?, ?, ?, ?, ?, 'guest')
                            `, [
                                customer.name.trim(),
                                guestEmail,
                                null,
                                customer.phone.trim(),
                                customer.place ?
                                customer.place.trim() :
                                null,
                                customer.address.trim()
                            ]
                        );

                    userId =
                        guestResult.insertId;

                    const stateCode =
                        getStateCode(
                            customer.state,
                            customer.place
                        );

                    const customerId =
                        generateCustomerId(
                            stateCode,
                            userId
                        );

                    await query(
                        `
                        UPDATE users
                        SET customer_id = ?
                        WHERE id = ?
                        `, [
                            customerId,
                            userId
                        ]
                    );

                    const guestUsers =
                        await query(
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

                    dbCustomer =
                        guestUsers[0];
                }

            } else {

                // No email supplied.
                // Create a guest account anyway.
                const guestResult =
                    await query(
                        `
                        INSERT INTO users
                        (
                            name,
                            email,
                            password,
                            phone,
                            place,
                            address,
                            account_type
                        )
                        VALUES (?, ?, ?, ?, ?, ?, 'guest')
                        `, [
                            customer.name.trim(),
                            null,
                            null,
                            customer.phone.trim(),
                            customer.place ?
                            customer.place.trim() :
                            null,
                            customer.address.trim()
                        ]
                    );

                userId =
                    guestResult.insertId;

                const stateCode =
                    getStateCode(
                        customer.state,
                        customer.place
                    );

                const customerId =
                    generateCustomerId(
                        stateCode,
                        userId
                    );

                await query(
                    `
                    UPDATE users
                    SET customer_id = ?
                    WHERE id = ?
                    `, [
                        customerId,
                        userId
                    ]
                );

                const guestUsers =
                    await query(
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

                dbCustomer =
                    guestUsers[0];
            }
        }

        // =================================================
        // GET PRODUCTS FROM CATALOG
        // =================================================

        const productIds =
            items.map(item =>
                Number(item.id)
            );

        if (
            productIds.some(
                id =>
                !Number.isInteger(id) ||
                id <= 0
            )
        ) {

            return res.status(400).json({
                success: false,
                error: "Invalid product."
            });
        }

        const placeholders =
            productIds
            .map(() => "?")
            .join(",");

        const products =
            await query(
                `
                SELECT
                    product_id AS id,
                    name,
                    price,
                    stock,
                    category_id
                FROM catalog
                WHERE product_id IN (${placeholders})
                `,
                productIds
            );

        const productMap =
            new Map(
                products.map(
                    product => [
                        product.id,
                        product
                    ]
                )
            );

        // =================================================
        // CALCULATE ORDER
        // =================================================

        let subtotal = 0;

        const orderItems = [];

        for (const item of items) {

            const product =
                productMap.get(
                    Number(item.id)
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

            // Stock check
            if (
                Number(product.stock) <
                quantity
            ) {

                return res.status(400).json({
                    success: false,
                    error: `${product.name} does not have enough stock.`
                });
            }

            subtotal +=
                Number(product.price) *
                quantity;

            orderItems.push({
                productId: product.id,
                name: product.name,
                price: Number(product.price),
                quantity,
                categoryId: product.category_id
            });
        }

        const gst =
            Math.round(
                subtotal * 0.18
            );

        const totalAmount =
            subtotal + gst;

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
                INSERT INTO order_details
                (
                    user_id,
                    total_amount,
                    status
                )
                VALUES (?, ?, ?)
                `, [
                    userId,
                    totalAmount,
                    "pending"
                ]
            );

        const dbOrderId =
            orderResult.insertId;

        // =================================================
        // ORDER NUMBER
        // =================================================

        const stateCode =
            getStateCode(
                customer.state,
                customer.place ||
                dbCustomer.place
            );

        const orderNumber =
            generateOrderId(
                stateCode,
                dbOrderId
            );

        await query(
            `
            UPDATE order_details
            SET order_number = ?
            WHERE id = ?
            `, [
                orderNumber,
                dbOrderId
            ]
        );

        // =================================================
        // SAVE ORDER ITEMS
        // =================================================

        for (const item of orderItems) {

            const itemResult =
                await query(
                    `
                    INSERT INTO items_ordered
                    (
                        order_id,
                        product_id,
                        category_id,
                        quantity,
                        price
                    )
                    VALUES (?, ?, ?, ?, ?)
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
                UPDATE items_ordered
                SET item_ref = ?
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
                INSERT INTO payments
                (
                    order_id,
                    razorpay_order_id,
                    amount,
                    status
                )
                VALUES (?, ?, ?, ?)
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
            UPDATE payments
            SET payment_ref = ?
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
            }
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
                `${orderId}|${paymentId}`
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
            UPDATE payments
            SET
                razorpay_payment_id = ?,
                razorpay_signature = ?,
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
                SELECT
                    order_id,
                    payment_ref
                FROM payments
                WHERE razorpay_order_id = ?
                `, [orderId]
            );

        // =================================================
        // UPDATE ORDER STATUS
        // =================================================

        if (payments.length) {

            await query(
                `
                UPDATE order_details
                SET status = 'paid'
                WHERE id = ?
                `, [
                    payments[0].order_id
                ]
            );
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