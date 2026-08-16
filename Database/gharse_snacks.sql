CREATE DATABASE IF NOT EXISTS gharse_snacks CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE gharse_snacks;
-- Clean MySQL 8 schema. Importing this file removes existing GharSe Snacks data.
-- Import in MySQL Workbench after selecting that database. This removes old data.
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS password_reset_tokens, reviews, suggestions, product_interest, bulk_order_enquiries, inventory_movements, payments, order_items, items_ordered, order_details, orders, subscriptions, partner_applications, product_variants, products, catalog, categories, users;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE users (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, user_id VARCHAR(32) UNIQUE, name VARCHAR(120) NOT NULL,
 email VARCHAR(255) NOT NULL UNIQUE, password_hash VARCHAR(255) NOT NULL, phone VARCHAR(20), place VARCHAR(100), state VARCHAR(100), address TEXT, preferred_snacks VARCHAR(255), email_verified_at DATETIME,
 created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE categories (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, category_id VARCHAR(32) NOT NULL UNIQUE, city VARCHAR(80) NOT NULL UNIQUE, state VARCHAR(80) NOT NULL, name VARCHAR(120) NOT NULL, display_order SMALLINT UNSIGNED NOT NULL, is_coming_soon BOOLEAN NOT NULL DEFAULT FALSE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE products (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, product_id VARCHAR(40) NOT NULL UNIQUE, category_id VARCHAR(32) NOT NULL,
 name VARCHAR(160) NOT NULL, description TEXT NOT NULL, price DECIMAL(10,2), stock INT UNSIGNED NOT NULL DEFAULT 0, pack_size VARCHAR(80), image_url VARCHAR(500) NOT NULL DEFAULT 'Images/Coming Soon.jpeg',
 is_coming_soon BOOLEAN NOT NULL DEFAULT FALSE, is_active BOOLEAN NOT NULL DEFAULT TRUE, display_order SMALLINT UNSIGNED NOT NULL,
 created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories(category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE product_variants (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, variant_id VARCHAR(40) NOT NULL UNIQUE, product_id VARCHAR(40) NOT NULL,
 parent_variant_id VARCHAR(40) NULL, name VARCHAR(160) NOT NULL, description TEXT NOT NULL, price DECIMAL(10,2), stock INT UNSIGNED NOT NULL DEFAULT 0,
 pack_size VARCHAR(80), image_url VARCHAR(500) NOT NULL DEFAULT 'Images/Logo.jpeg', is_active BOOLEAN NOT NULL DEFAULT TRUE, display_order SMALLINT UNSIGNED NOT NULL,
 CONSTRAINT fk_product_variants_product FOREIGN KEY (product_id) REFERENCES products(product_id),
 CONSTRAINT fk_product_variants_parent FOREIGN KEY (parent_variant_id) REFERENCES product_variants(variant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE partner_applications (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, partner_id VARCHAR(32) UNIQUE, name VARCHAR(120) NOT NULL, contact VARCHAR(20) NOT NULL, email VARCHAR(255) NOT NULL, state VARCHAR(100) NOT NULL, details TEXT NOT NULL,
 status ENUM('new','reviewing','contacted','declined') NOT NULL DEFAULT 'new', created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE bulk_order_enquiries (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, enquiry_id VARCHAR(32) UNIQUE,
 name VARCHAR(120) NOT NULL, email VARCHAR(255) NOT NULL, phone VARCHAR(20) NOT NULL,
 delivery_address TEXT NOT NULL, state VARCHAR(100) NOT NULL, product VARCHAR(160) NOT NULL, quantity VARCHAR(100) NOT NULL,
 requirements TEXT NULL, status ENUM('new','contacted','quoted','closed') NOT NULL DEFAULT 'new',
 created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE subscriptions (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, subscription_id VARCHAR(32) UNIQUE, email VARCHAR(255) NOT NULL UNIQUE, status ENUM('subscribed','unsubscribed') NOT NULL DEFAULT 'subscribed', created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE orders (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, order_id VARCHAR(40) UNIQUE, user_id BIGINT UNSIGNED NULL, customer_name VARCHAR(120) NOT NULL, customer_email VARCHAR(255), customer_phone VARCHAR(20) NOT NULL,
 delivery_address TEXT NOT NULL, delivery_place VARCHAR(100) NOT NULL, delivery_state VARCHAR(100), subtotal DECIMAL(10,2) NOT NULL, total_amount DECIMAL(10,2) NOT NULL,
 status ENUM('payment_pending','paid','processing','shipped','delivered','cancelled','payment_failed') NOT NULL DEFAULT 'payment_pending', created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 KEY ix_orders_user(user_id), CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE order_items (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, order_id BIGINT UNSIGNED NOT NULL, product_id VARCHAR(40) NOT NULL, variant_id VARCHAR(40) NULL, category_id VARCHAR(32) NOT NULL, product_name VARCHAR(160) NOT NULL, unit_price DECIMAL(10,2) NOT NULL, quantity INT UNSIGNED NOT NULL,
 KEY ix_order_items_order(order_id), CONSTRAINT fk_order_items_order FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE, CONSTRAINT fk_order_items_product FOREIGN KEY(product_id) REFERENCES products(product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE payments (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, payment_id VARCHAR(40) UNIQUE, order_id BIGINT UNSIGNED NOT NULL, razorpay_order_id VARCHAR(100) NOT NULL UNIQUE, razorpay_payment_id VARCHAR(100) UNIQUE, razorpay_signature VARCHAR(255), amount DECIMAL(10,2) NOT NULL,
 status ENUM('created','paid','failed','refunded') NOT NULL DEFAULT 'created', paid_at DATETIME, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT fk_payments_order FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE inventory_movements (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, product_id VARCHAR(40) NOT NULL, change_quantity INT NOT NULL, reason ENUM('sale','restock','adjustment','refund') NOT NULL, order_id BIGINT UNSIGNED NULL, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 KEY ix_inventory_product(product_id), CONSTRAINT fk_inventory_product FOREIGN KEY(product_id) REFERENCES products(product_id), CONSTRAINT fk_inventory_order FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE product_interest (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, product_id VARCHAR(40) NOT NULL, email VARCHAR(255) NOT NULL, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 UNIQUE KEY uq_product_interest(product_id,email), CONSTRAINT fk_interest_product FOREIGN KEY(product_id) REFERENCES products(product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE suggestions (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, user_id BIGINT UNSIGNED NULL, name VARCHAR(120) NOT NULL, email VARCHAR(255), suggestion TEXT NOT NULL, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT fk_suggestions_user FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE password_reset_tokens (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, user_id BIGINT UNSIGNED NOT NULL, token_hash CHAR(64) NOT NULL, expires_at DATETIME NOT NULL, used_at DATETIME NULL, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 KEY ix_password_reset_user(user_id), CONSTRAINT fk_password_reset_user FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE reviews (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, review_id VARCHAR(32) UNIQUE, user_id BIGINT UNSIGNED NULL, product_id VARCHAR(40) NOT NULL, reviewer VARCHAR(120) NOT NULL, review_type VARCHAR(60) NOT NULL, rating TINYINT UNSIGNED NOT NULL, comment VARCHAR(500) NOT NULL, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT fk_reviews_user FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL, CONSTRAINT fk_reviews_product FOREIGN KEY(product_id) REFERENCES products(product_id), CONSTRAINT chk_reviews_rating CHECK (rating BETWEEN 1 AND 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO categories (category_id,city,state,name,display_order,is_coming_soon) VALUES
('GSS_AHM_001','Ahmedabad','Gujarat','Gujarati Snacks',1,TRUE),('GSS_BIK_002','Bikaner','Rajasthan','Bikaneri Snacks',2,FALSE),('GSS_IND_003','Indore','Madhya Pradesh','Indori Snacks',3,FALSE),('GSS_JAI_004','Jaipur','Rajasthan','Rajasthani Sweets',4,FALSE),('GSS_KOC_005','Kochi','Kerala','Kerala Snacks',5,FALSE),('GSS_PUN_006','Pune','Maharashtra','Maharashtrian Snacks',6,FALSE),('GSS_RAT_007','Ratlam','Madhya Pradesh','Ratlami Snacks',7,FALSE);

INSERT INTO products (product_id,category_id,name,description,price,stock,pack_size,image_url,is_coming_soon,display_order) VALUES
('GSS_AHM_MKH_001','GSS_AHM_001','Masala Khakhra','Crispy Gujarati khakhra with a delicious masala flavour.',NULL,0,NULL,'Images/Coming Soon.jpeg',TRUE,1),('GSS_AHM_MTH_002','GSS_AHM_001','Methi Khakhra','Classic Gujarati khakhra flavoured with methi.',NULL,0,NULL,'Images/Coming Soon.jpeg',TRUE,2),('GSS_AHM_JKH_003','GSS_AHM_001','Jeera Khakhra','Light and crispy khakhra with the familiar flavour of jeera.',NULL,0,NULL,'Images/Coming Soon.jpeg',TRUE,3),('GSS_AHM_THP_004','GSS_AHM_001','Thepla','Soft, spiced Gujarati thepla made for a comforting snack.',NULL,0,NULL,'Images/Coming Soon.jpeg',TRUE,4),('GSS_AHM_CPP_005','GSS_AHM_001','Coin Khakhra (Peri Peri)','Mini coin-shaped khakhra with a spicy peri peri flavour.',NULL,0,NULL,'Images/Coming Soon.jpeg',TRUE,5),('GSS_AHM_CPN_006','GSS_AHM_001','Coin Khakhra (Pani Puri)','Mini coin-shaped khakhra with a pani puri-inspired flavour.',NULL,0,NULL,'Images/Coming Soon.jpeg',TRUE,6),('GSS_AHM_CJN_007','GSS_AHM_001','Coin Khakhra (Jain)','Mini coin-shaped Jain-friendly khakhra.',NULL,0,NULL,'Images/Coming Soon.jpeg',TRUE,7),('GSS_AHM_CAC_008','GSS_AHM_001','Coin Khakhra (Achari)','Mini coin-shaped khakhra with a tangy achari flavour.',NULL,0,NULL,'Images/Coming Soon.jpeg',TRUE,8),('GSS_AHM_SYC_009','GSS_AHM_001','Soya Chips','Crunchy soya-based chips for a satisfying snack.',NULL,0,NULL,'Images/Coming Soon.jpeg',TRUE,9),('GSS_AHM_RGC_010','GSS_AHM_001','Raagi Chips','Crunchy raagi chips with a wholesome twist.',NULL,0,NULL,'Images/Coming Soon.jpeg',TRUE,10),('GSS_AHM_BTC_011','GSS_AHM_001','Beetroot Chips','Crispy beetroot chips with a distinctive flavour.',NULL,0,NULL,'Images/Coming Soon.jpeg',TRUE,11),('GSS_AHM_BHK_012','GSS_AHM_001','Bhakhri','Traditional Gujarati bhakhri made for everyday snacking.',NULL,0,NULL,'Images/Coming Soon.jpeg',TRUE,12),('GSS_BIK_CHJ_013','GSS_BIK_002','Chana Jor','Crunchy spiced chana jor for an anytime snack.',49,100,'100g / packet','Images/Chana Jor.jpeg',FALSE,1),('GSS_IND_SPC_014','GSS_IND_003','Spicy Potato Chips','Crispy spicy potato chips with a bold, satisfying crunch.',30,100,'50g / packet','Images/Spicy Potato Chips.jpeg',FALSE,1),('GSS_IND_SPM_015','GSS_IND_003','Spicy Parmal / Murmure','A spicy and crunchy Indori-style parmal and murmure snack.',69,100,'100g / packet','Images/Spicy Parmal.jpeg',FALSE,2),('GSS_JAI_BSL_016','GSS_JAI_004','Besan Ladoo','Traditional besan ladoo with a rich, comforting sweetness.',30,100,'~63g / piece','Images/Besan Ladoo.jpeg',FALSE,1),('GSS_KOC_BNC_017','GSS_KOC_005','Banana Chips','Crispy banana chips inspired by Kerala''s classic snack.',30,100,'50g / packet','Images/Banana Chips.jpeg',FALSE,1),('GSS_PUN_BKW_018','GSS_PUN_006','Bhakarwadi','Sweet, spicy and tangy spiral bhakarwadi with a delicious crunch.',89,100,'200g / packet','Images/Bhakarwadi.jpeg',FALSE,1),('GSS_RAT_SEV_019','GSS_RAT_007','Sev','Crispy and flavourful Ratlami sev, perfect for chai-time snacking.',69,100,'100g / packet','Images/Sev.jpeg',FALSE,1);


-- Apply the following inventory update to an existing gharse_snacks database (MySQL 8+).
-- The bulk_order_enquiries table above already contains the product column.
USE gharse_snacks;

-- Current live inventory: every item except these three is out of stock.
UPDATE products SET stock = 0 WHERE product_id NOT IN ('GSS_IND_SPM_015', 'GSS_IND_SPC_014', 'GSS_RAT_SEV_019', 'GSS_IND_SPC_020');
UPDATE products
  SET name = 'Spicy Potato Chips — Small', description = 'Spicy potato chips in a snackable small packet.', price = 30, stock = 83, pack_size = '40g packet'
  WHERE product_id = 'GSS_IND_SPC_014';
UPDATE products
  SET name = 'Spicy Parmal (Murmure)', stock = 6, image_url = 'Images/Spicy Parmal (Murmure).jpeg'
  WHERE product_id = 'GSS_IND_SPM_015';
UPDATE products SET stock = 32 WHERE product_id = 'GSS_RAT_SEV_019';

INSERT INTO products (product_id, category_id, name, description, price, stock, pack_size, image_url, is_coming_soon, is_active, display_order)
SELECT 'GSS_IND_SPC_020', 'GSS_IND_003', 'Potato Chips — 120g', 'Sharing potato chips packet.', 69, 25, '120g / packet', 'Images/Spicy Potato Chips.jpeg', FALSE, TRUE, 2
WHERE NOT EXISTS (SELECT 1 FROM products WHERE product_id = 'GSS_IND_SPC_020');

-- Ahmedabad catalogue: available now, grouped as Khakhra > Coin Khakhra in the storefront.
UPDATE categories SET is_coming_soon = FALSE WHERE category_id = 'GSS_AHM_001';
UPDATE products SET price = 150, stock = 100, image_url = 'Images/Logo.jpeg', is_coming_soon = FALSE WHERE product_id IN ('GSS_AHM_MKH_001', 'GSS_AHM_MTH_002', 'GSS_AHM_JKH_003');
UPDATE products SET price = 60, stock = 100, image_url = 'Images/Thepla.jpeg', is_coming_soon = FALSE WHERE product_id = 'GSS_AHM_THP_004';
UPDATE products SET price = 200, stock = 100, image_url = 'Images/Logo.jpeg', is_coming_soon = FALSE WHERE product_id IN ('GSS_AHM_CPP_005', 'GSS_AHM_CPN_006', 'GSS_AHM_CJN_007', 'GSS_AHM_CAC_008');
UPDATE products SET name = 'Coin Khakhra (Pizza Jain)', description = 'Mini coin-shaped pizza-style Jain khakhra.' WHERE product_id = 'GSS_AHM_CJN_007';
UPDATE products SET name = 'Ragi Chips', description = 'Crunchy ragi chips with a wholesome twist.', price = 190, stock = 100, image_url = 'Images/Ragi Chips.jpeg', is_coming_soon = FALSE WHERE product_id = 'GSS_AHM_RGC_010';
UPDATE products SET price = 190, stock = 100, image_url = 'Images/Beetroot Chips.jpeg', is_coming_soon = FALSE WHERE product_id = 'GSS_AHM_BTC_011';

-- One real Khakhra product. Its selectable flavours live in product_variants.
UPDATE products SET is_active = FALSE WHERE product_id IN ('GSS_AHM_MKH_001','GSS_AHM_MTH_002','GSS_AHM_JKH_003','GSS_AHM_CPP_005','GSS_AHM_CPN_006','GSS_AHM_CJN_007','GSS_AHM_CAC_008');
INSERT INTO products (product_id,category_id,name,description,price,stock,pack_size,image_url,is_coming_soon,is_active,display_order)
SELECT 'GSS_AHM_KHK_001','GSS_AHM_001','Khakhra','Classic and coin khakhra in your favourite flavours.',NULL,800,NULL,'Images/Logo.jpeg',FALSE,TRUE,1
WHERE NOT EXISTS (SELECT 1 FROM products WHERE product_id = 'GSS_AHM_KHK_001');
INSERT INTO product_variants (variant_id,product_id,parent_variant_id,name,description,price,stock,image_url,display_order) VALUES
('GSS_AHM_KHK_001','GSS_AHM_KHK_001',NULL,'Masala Khakhra','Crispy Gujarati masala khakhra.',150,100,'Images/Logo.jpeg',1),
('GSS_AHM_KHK_002','GSS_AHM_KHK_001',NULL,'Methi Khakhra','Classic methi khakhra.',150,100,'Images/Logo.jpeg',2),
('GSS_AHM_KHK_003','GSS_AHM_KHK_001',NULL,'Jeera Khakhra','Light and crispy jeera khakhra.',150,100,'Images/Logo.jpeg',3),
('GSS_AHM_KHK_004','GSS_AHM_KHK_001',NULL,'Coin Khakhra','Bite-sized coin khakhra.',NULL,0,'Images/Logo.jpeg',4),
('GSS_AHM_KHK_005','GSS_AHM_KHK_001','GSS_AHM_KHK_004','Peri Peri','Spicy peri peri coin khakhra.',200,100,'Images/Logo.jpeg',5),
('GSS_AHM_KHK_006','GSS_AHM_KHK_001','GSS_AHM_KHK_004','Pani Puri','Pani puri coin khakhra.',200,100,'Images/Logo.jpeg',6),
('GSS_AHM_KHK_007','GSS_AHM_KHK_001','GSS_AHM_KHK_004','Pizza Jain','Pizza-style Jain coin khakhra.',200,100,'Images/Logo.jpeg',7),
('GSS_AHM_KHK_008','GSS_AHM_KHK_001','GSS_AHM_KHK_004','Achari','Tangy achari coin khakhra.',200,100,'Images/Logo.jpeg',8);

-- One real Spicy Potato Chips product, with 40g and 120g packet variants.
UPDATE products SET is_active = FALSE WHERE product_id IN ('GSS_IND_SPC_014','GSS_IND_SPC_020');
INSERT INTO products (product_id,category_id,name,description,price,stock,pack_size,image_url,is_coming_soon,is_active,display_order)
SELECT 'GSS_IND_PTC_014','GSS_IND_003','Spicy Potato Chips','Crispy spicy potato chips in small and sharing packs.',NULL,108,NULL,'Images/Spicy Potato Chips.jpeg',FALSE,TRUE,1
WHERE NOT EXISTS (SELECT 1 FROM products WHERE product_id = 'GSS_IND_PTC_014');
INSERT INTO product_variants (variant_id,product_id,parent_variant_id,name,description,price,stock,pack_size,image_url,display_order) VALUES
('GSS_IND_PTC_001','GSS_IND_PTC_014',NULL,'Potato Chips — 40g','Snackable potato chips packet.',30,83,'40g / packet','Images/Spicy Potato Chips.jpeg',1),
('GSS_IND_PTC_002','GSS_IND_PTC_014',NULL,'Potato Chips — 120g','Sharing potato chips packet.',69,25,'120g / packet','Images/Spicy Potato Chips.jpeg',2);

-- Discontinued Ahmedabad products are removed from the catalogue entirely.
DELETE FROM products WHERE product_id IN ('GSS_AHM_SYC_009', 'GSS_AHM_BHK_012');
