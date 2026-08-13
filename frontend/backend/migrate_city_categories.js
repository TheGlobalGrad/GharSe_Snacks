const db = require("./db");

const categories = [
    ["AHM-GUJ", "Ahmedabad, Gujarat"],
    ["IDR-MP", "Indore, Madhya Pradesh"],
    ["BSR-UP", "Varanasi, Uttar Pradesh"],
    ["KOC-KL", "Kochi, Kerala"],
    ["CHE-TN", "Chennai, Tamil Nadu"]
];

const products = [
    ["Classic Thepla Box", "AHM-GUJ", "AHM-THP"],
    ["Khakhra Crunch Pack", "AHM-GUJ", "AHM-KHK"],
    ["Bhakri Bites", "AHM-GUJ", "AHM-BHK"],
    ["Gathiya", "AHM-GUJ", "AHM-GTY"],
    ["Bhakarwadi", "AHM-GUJ", "AHM-BKW"],
    ["Chivda", "AHM-GUJ", "AHM-CHV"],
    ["Indori Tikhi Sev", "IDR-MP", "IDR-SEV"],
    ["Chana Jor", "IDR-MP", "IDR-CHJ"],
    ["Potato Chips", "IDR-MP", "IDR-POT"],
    ["Besan Ladoo", "BSR-UP", "BSR-LAD"],
    ["Banana Chips", "KOC-KL", "KOC-BNC"],
    ["Ragi Chips", "CHE-TN", "CHE-RGC"],
    ["Soya Sticks", "CHE-TN", "CHE-SYS"]
];

async function run(sql, values = []) {
    return new Promise((resolve, reject) => db.query(sql, values, (error, result) => error ? reject(error) : resolve(result)));
}

async function migrate() {
    for (const [code, name] of categories) {
        await run("INSERT INTO categories (category_code, name) VALUES (?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name)", [code, name]);
    }
    const rows = await run("SELECT id, category_code FROM categories");
    const categoryIds = new Map(rows.map((row) => [row.category_code, row.id]));
    for (const [name, categoryCode, productCode] of products) {
        await run("UPDATE products SET category_id = ?, product_code = ? WHERE name = ?", [categoryIds.get(categoryCode), productCode, name]);
    }
    console.log("City categories and readable product codes are ready.");
}

migrate().then(() => process.exit(0)).catch((error) => { console.error(error.message); process.exit(1); });
