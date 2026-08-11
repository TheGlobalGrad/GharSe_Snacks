const db = require('./db');

db.query(`
    CREATE TABLE IF NOT EXISTS product_interest (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        user_id INT NULL,
        requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_product_interest_product (product_id),
        INDEX idx_product_interest_user (user_id),
        CONSTRAINT fk_product_interest_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        CONSTRAINT fk_product_interest_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    )
`, (error) => {
    if (error) { console.error(error.message); process.exit(1); }
    console.log('product_interest table is ready.');
    process.exit(0);
});
