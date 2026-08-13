uconst db = require("./db");
db.query("SHOW TABLES", (e, r) => {
    if (e) { console.error(e);
        process.exit(1); }
    const names = r.map(x => Object.values(x)[0]);
    console.log("TABLES:", names.join(", "));
    let pending = names.length;
    names.forEach(n => {
        db.query("DESCRIBE `" + n + "`", (err, cols) => {
            if (err) console.error(n, err.message);
            else {
                console.log("=== " + n + " ===");
                cols.forEach(c => console.log(c.Field + " | " + c.Type + " | " + c.Null + " | " + c.Key + " | " + c.Default));
            }
            pending--;
            if (pending === 0) process.exit(0);
        });
    });
});