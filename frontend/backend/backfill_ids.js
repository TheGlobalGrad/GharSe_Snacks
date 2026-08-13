const mysql = require("mysql2");
const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "Bhumika@123456789",
    database: "GharSe_Snacks",
    port: 3306
});

function generateId(prefix, numericId) {
    const padded = String(numericId).padStart(6, "0");
    return `GS-${prefix}-${padded}`;
}

const tables = [
    { table: "users", column: "customer_id", prefix: "CUST" },
    { table: "partner_applications", column: "partner_id", prefix: "PARTNER" },
    { table: "orders", column: "order_number", prefix: "ORD" },
    { table: "payments", column: "payment_ref", prefix: "PAY" },
    { table: "products", column: "product_code", prefix: "PROD" },
    { table: "categories", column: "category_code", prefix: "CAT" },
    { table: "addresses", column: "address_ref", prefix: "ADDR" },
    { table: "cart", column: "cart_ref", prefix: "CART" },
    { table: "order_items", column: "item_ref", prefix: "ITEM" },
    { table: "reviews", column: "review_ref", prefix: "REV" },
    { table: "subscriptions", column: "subscription_ref", prefix: "SUB" }
];

function backfillTable(index) {
    if (index >= tables.length) {
        console.log("All backfills completed successfully!");
        process.exit(0);
    }

    const { table, column, prefix } = tables[index];

    db.query(`SELECT id FROM \`${table}\` WHERE \`${column}\` IS NULL`, (err, rows) => {
        if (err) {
            console.error(`Failed to query ${table}:`, err.message);
            process.exit(1);
        }

        if (!rows.length) {
            console.log(`${table}: no rows to backfill`);
            backfillTable(index + 1);
            return;
        }

        let pending = rows.length;
        rows.forEach((row) => {
            const id = generateId(prefix, row.id);
            db.query(`UPDATE \`${table}\` SET \`${column}\` = ? WHERE id = ?`, [id, row.id], (updateErr) => {
                if (updateErr) {
                    console.error(`Failed to update ${table} id=${row.id}:`, updateErr.message);
                    process.exit(1);
                }
                pending--;
                if (pending === 0) {
                    console.log(`${table}: backfilled ${rows.length} rows`);
                    backfillTable(index + 1);
                }
            });
        });
    });
}

backfillTable(0);