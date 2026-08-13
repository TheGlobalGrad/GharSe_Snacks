const db = require("./db");

const statements = [
    "ALTER TABLE reviews ADD COLUMN user_id INT NULL AFTER id",
    "ALTER TABLE reviews ADD COLUMN category_id INT NULL AFTER user_id",
    `CREATE TABLE IF NOT EXISTS suggestions (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        user_id INT NULL,
        name VARCHAR(100) NULL,
        email VARCHAR(150) NULL,
        suggestion TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`
];

function run(sql) { return new Promise((resolve, reject) => db.query(sql, (error, result) => error ? reject(error) : resolve(result))); }

async function migrate() {
    for (const statement of statements) {
        try { await run(statement); } catch (error) { if (error.code !== "ER_DUP_FIELDNAME") throw error; }
    }
    console.log("Reviews now support user/category/product IDs; suggestions table is ready.");
}

migrate().then(() => process.exit(0)).catch((error) => { console.error(error.message); process.exit(1); });
