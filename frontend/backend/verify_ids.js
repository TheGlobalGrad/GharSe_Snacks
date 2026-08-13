const mysql = require("mysql2");
const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "Bhumika@123456789",
    database: "GharSe_Snacks",
    port: 3306
});

// Verify all custom ID columns exist and have data
const checks = [
    { table: "users", column: "customer_id" },
    { table: "partner_applications", column: "partner_id" },
    { table: "orders", column: "order_number" },
    { table: "payments", column: "payment_ref" },
    { table: "products", column: "product_code" },
    { table: "categories", column: "category_code" },
    { table: "addresses", column: "address_ref" },
    { table: "cart", column: "cart_ref" },
    { table: "order_items", column: "item_ref" },
    { table: "reviews", column: "review_ref" },
    { table: "subscriptions", column: "subscription_ref" }
];

let pending = checks.length;

checks.forEach(({ table, column }) => {
    db.query(`SELECT COUNT(*) as total, SUM(CASE WHEN \`${column}\` IS NOT NULL THEN 1 ELSE 0 END) as with_id FROM \`${table}\``, (err, rows) => {
        if (err) {
            console.error(`Error checking ${table}.${column}:`, err.message);
        } else {
            const row = rows[0];
            console.log(`${table}.${column}: ${row.with_id}/${row.total} rows have IDs`);
        }
        pending--;
        if (pending === 0) process.exit(0);
    });
});