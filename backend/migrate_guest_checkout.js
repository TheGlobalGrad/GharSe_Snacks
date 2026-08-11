const db = require("./db");

db.query("ALTER TABLE orders MODIFY user_id INT NULL", (error) => {
    if (error) {
        console.error("Could not enable guest checkout:", error.message);
        process.exit(1);
    }
    console.log("Guest checkout enabled: orders.user_id now accepts NULL.");
    process.exit(0);
});
