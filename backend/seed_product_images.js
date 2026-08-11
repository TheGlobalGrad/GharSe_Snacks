const db = require('./db');

const products = [
    ['Classic Thepla Box', 'Images/Thepla.jpeg', 100],
    ['Khakhra Crunch Pack', 'Images/Khakhra.jpeg', 100],
    ['Bhakri Bites', 'Images/Bhakhri.jpeg', 100],
    ['Indori Tikhi Sev', 'Images/Rtalami Sev.jpeg', 100],
    ['Banana Chips', 'Images/Banana Chips.jpeg', 0],
    ['Besan Ladoo', 'Images/Besan Ladoo.jpeg', 0],
    ['Bhakarwadi', 'Images/Bhakarwadi.jpeg', 0],
    ['Chana Jor', 'Images/Chana Jor.jpeg', 0],
    ['Chivda', 'Images/Chivda.jpeg', 0],
    ['Gathiya', 'Images/Gtahiya.png', 0],
    ['Potato Chips', 'Images/Potato Chips.jpeg', 0],
    ['Ragi Chips', 'Images/Raagi Chips.jpeg', 0],
    ['Soya Sticks', 'Images/Soya Sticks.jpeg', 0]
];

let pending = products.length;
products.forEach(([name, imageUrl, stock]) => {
    db.query('SELECT id FROM products WHERE name = ?', [name], (findError, rows) => {
        if (findError) throw findError;
        const done = (error) => {
            if (error) throw error;
            pending -= 1;
            if (!pending) { console.log('Product photos and coming-soon products are ready.'); process.exit(0); }
        };
        if (rows.length) return db.query('UPDATE products SET image_url = ? WHERE id = ?', [imageUrl, rows[0].id], done);
        db.query('INSERT INTO products (name, description, price, stock, image_url) VALUES (?, ?, ?, ?, ?)', [name, 'A hometown favourite, coming to GharSe soon.', 0, stock, imageUrl], done);
    });
});
