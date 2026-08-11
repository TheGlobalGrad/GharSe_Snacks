const db = require("./db");

const statements = [
    "ALTER TABLE product_interest ADD COLUMN category_id INT NULL AFTER product_id",
    "ALTER TABLE product_interest ADD COLUMN quantity INT NOT NULL DEFAULT 1 AFTER user_id",
    "ALTER TABLE subscriptions ADD COLUMN user_id INT NULL AFTER id",
    "ALTER TABLE subscriptions ADD COLUMN status ENUM('subscribed','unsubscribed') NOT NULL DEFAULT 'subscribed' AFTER email",
    "ALTER TABLE subscriptions ADD COLUMN subscribed_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP",
    "ALTER TABLE subscriptions ADD COLUMN unsubscribed_at TIMESTAMP NULL DEFAULT NULL",
    "DROP TABLE IF EXISTS cart",
    "DROP TABLE IF EXISTS addresses"
];

function run(sql) { return new Promise((resolve, reject) => db.query(sql, (error, result) => error ? reject(error) : resolve(result))); }
async function migrate() {
    for (const sql of statements) { try { await run(sql); } catch (error) { if (error.code !== "ER_DUP_FIELDNAME") throw error; } }
    console.log("Product-interest and subscription tracking columns are ready; unused server cart table removed.");
}
migrate().then(() => process.exit(0)).catch((error) => { console.error(error.message); process.exit(1); });
