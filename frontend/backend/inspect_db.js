const mysql = require("mysql2");
const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "Bhumika@123456789",
    database: "GharSe_Snacks",
    port: 3306
});

db.query("SHOW TABLES", (e, tables) => {
    if (e) {
        console.error("Error:", e.message);
        process.exit(1);
    }
    console.log("TABLES:", JSON.stringify(tables));

    const tableNames = tables.map(t => Object.values(t)[0]);
    let pending = tableNames.length;

    tableNames.forEach(name => {
        db.query(`DESCRIBE \`${name}\``, (err, cols) => {
            if (err) { console.error(`Error describing ${name}:`, err.message); } else {
                console.log(`\n=== ${name} ===`);
                cols.forEach(c => console.log(`  ${c.Field} | ${c.Type} | ${c.Null} | ${c.Key} | ${c.Default}`));
            }
            pending--;
            if (pending === 0) process.exit(0);
        });
    });
});