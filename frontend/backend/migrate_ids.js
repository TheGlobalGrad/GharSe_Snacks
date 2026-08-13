const mysql = require("mysql2");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

const migrations = [
    `ALTER TABLE users ADD COLUMN place VARCHAR(120) NULL AFTER phone`,
    `ALTER TABLE users ADD COLUMN address VARCHAR(255) NULL AFTER place`,
    `ALTER TABLE users ADD COLUMN preferred_snacks VARCHAR(100) NULL AFTER address`
];

function runMigration(index) {
    if (index >= migrations.length) {
        console.log("All signup-field migrations completed successfully!");
        process.exit(0);
    }

    db.query(migrations[index], (err) => {
        if (err) {
            if (err.code === "ER_DUP_FIELDNAME") {
                console.log(`Column already exists for migration ${index + 1}, skipping...`);
            } else {
                console.error(`Migration ${index + 1} failed:`, err.message);
                process.exit(1);
            }
        } else {
            console.log(`Migration ${index + 1} completed.`);
        }
        runMigration(index + 1);
    });
}

runMigration(0);