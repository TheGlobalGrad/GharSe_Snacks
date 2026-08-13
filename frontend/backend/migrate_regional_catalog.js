const db = require("./db");

const catalog = [
    ["Ahmedabad", "GSS-GUJ-1", ["Moti Gathiya", "Gathiya Papdi", "Khakhra Crunch Pack", "Classic Thepla Box", "Bhakri Bites"]],
    ["Bengaluru", "GSS-KAR-1", ["Ragi Chips"]],
    ["Kochi", "GSS-KER-1", ["Banana Chips"]],
    ["Indore", "GSS-IDR-1", ["Indori Tikhi Sev", "Chatpate Potato Chips", "Chatpate Parmal"]],
    ["Mumbai", "GSS-MAH-1", ["Bhakarwadi"]],
    ["Jaipur", "GSS-RAJ-1", ["Besan Ladoo"]],
    ["Varanasi", "GSS-UP-1", ["Chana Jor Garam"]]
];
const available = new Set(["Khakhra Crunch Pack", "Classic Thepla Box", "Bhakri Bites", "Indori Tikhi Sev"]);
const run = (sql, values = []) => new Promise((resolve, reject) => db.query(sql, values, (error, result) => error ? reject(error) : resolve(result)));

async function migrate() {
    for (const [city, code, products] of catalog) {
        await run("INSERT INTO categories (category_code, name) VALUES (?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name)", [code, city]);
        const rows = await run("SELECT id FROM categories WHERE category_code = ?", [code]);
        for (const name of products) {
            const stock = available.has(name) ? 100 : 0;
            await run(`INSERT INTO products (category_id, name, description, price, stock)
                VALUES (?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE category_id = VALUES(category_id), stock = VALUES(stock)`, [rows[0].id, name, "A regional GharSe favourite. Coming soon to the catalogue.", 100, stock]);
        }
    }
    console.log("Regional city catalogue is ready.");
}
migrate().then(() => process.exit(0)).catch((error) => { console.error(error.message); process.exit(1); });
