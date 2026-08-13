const db = require("./db");

const categories = [
    ["GSS-GUJ-1", "Gujarat"],
    ["GSS-IDR-1", "Indore"],
    ["GSS-BAN-1", "Banaras"]
];

const products = [
    ["Classic Thepla Box", "GSS-GUJ-1", "GSS-THP-GUJ-1"],
    ["Indori Tikhi Sev", "GSS-IDR-1", "GSS-SEV-IDR-1"]
];

function run(sql, values = []) {
    return new Promise((resolve, reject) => db.query(sql, values, (error, result) => error ? reject(error) : resolve(result)));
}

async function migrate() {
    for (const [code, name] of categories) {
        await run("INSERT INTO categories (category_code, name) VALUES (?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name)", [code, name]);
    }
    const rows = await run("SELECT id, category_code FROM categories");
    const categoryId = new Map(rows.map((row) => [row.category_code, row.id]));
    for (const [name, categoryCode, productCode] of products) {
        await run("UPDATE products SET category_id = ?, product_code = ? WHERE name = ?", [categoryId.get(categoryCode), productCode, name]);
    }
    console.log("Requested GSS category and product IDs have been applied.");
}

migrate().then(() => process.exit(0)).catch((error) => { console.error(error.message); process.exit(1); });
