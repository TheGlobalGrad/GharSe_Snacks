const db = require("./db");
const run = (sql) => new Promise((resolve, reject) => db.query(sql, (error, result) => error ? reject(error) : resolve(result)));

async function migrate() {
    await run(`CREATE TABLE catalog (
        product_id INT NOT NULL PRIMARY KEY,
        category_id VARCHAR(50) NOT NULL,
        category_name VARCHAR(100) NOT NULL,
        product_code VARCHAR(50) NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        description TEXT NULL,
        price DECIMAL(10,2) NOT NULL,
        stock INT NOT NULL DEFAULT 0,
        image_url VARCHAR(500) NULL,
        created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP
    )`);
    await run(`INSERT INTO catalog (product_id, category_id, category_name, product_code, name, description, price, stock, image_url, created_at)
        SELECT p.id, COALESCE(c.category_code, CONCAT('GSS-CAT-', p.category_id)), COALESCE(c.name, 'GharSe Snacks'), p.product_code, p.name, p.description, p.price, p.stock, p.image_url, p.created_at
        FROM products p LEFT JOIN categories c ON c.id = p.category_id`);

    await run("ALTER TABLE order_items DROP FOREIGN KEY order_items_ibfk_1");
    await run("ALTER TABLE order_items DROP FOREIGN KEY order_items_ibfk_2");
    await run("ALTER TABLE payments DROP FOREIGN KEY payments_ibfk_1");
    await run("ALTER TABLE product_interest DROP FOREIGN KEY fk_product_interest_product");
    await run("ALTER TABLE reviews DROP FOREIGN KEY reviews_ibfk_1");
    await run("ALTER TABLE orders DROP FOREIGN KEY orders_ibfk_2");
    await run("ALTER TABLE orders DROP COLUMN address_id");
    await run("DROP TABLE addresses");

    await run("RENAME TABLE orders TO order_details, order_items TO items_ordered");
    await run("ALTER TABLE order_details ADD COLUMN product_id INT NULL, ADD COLUMN category_id VARCHAR(50) NULL");
    await run("ALTER TABLE items_ordered ADD COLUMN category_id VARCHAR(50) NULL AFTER product_id");
    await run("UPDATE items_ordered i JOIN catalog c ON c.product_id = i.product_id SET i.category_id = c.category_id");
    await run("ALTER TABLE product_interest MODIFY category_id VARCHAR(50) NULL");
    await run("UPDATE product_interest pi JOIN catalog c ON c.product_id = pi.product_id SET pi.category_id = c.category_id");
    await run("ALTER TABLE reviews MODIFY category_id VARCHAR(50) NULL");
    await run("UPDATE reviews r JOIN catalog c ON c.product_id = r.product_id SET r.category_id = c.category_id");

    await run("DROP TABLE products");
    await run("DROP TABLE categories");
    await run("ALTER TABLE items_ordered ADD CONSTRAINT fk_items_ordered_order FOREIGN KEY (order_id) REFERENCES order_details(id), ADD CONSTRAINT fk_items_ordered_catalog FOREIGN KEY (product_id) REFERENCES catalog(product_id)");
    await run("ALTER TABLE payments ADD CONSTRAINT fk_payments_order FOREIGN KEY (order_id) REFERENCES order_details(id)");
    await run("ALTER TABLE product_interest ADD CONSTRAINT fk_interest_catalog FOREIGN KEY (product_id) REFERENCES catalog(product_id)");
    await run("ALTER TABLE reviews ADD CONSTRAINT fk_reviews_catalog FOREIGN KEY (product_id) REFERENCES catalog(product_id)");
    await run("DROP TABLE IF EXISTS cart");
    console.log("Catalog and order schema migration completed.");
}
migrate().then(() => process.exit(0)).catch((error) => { console.error("Migration failed:", error.message); process.exit(1); });
