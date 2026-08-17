-- Complete clean MySQL 8 import. This deletes current GharSe Snacks data.
CREATE DATABASE IF NOT EXISTS gharse_snacks CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE gharse_snacks;
SET FOREIGN_KEY_CHECKS=0;
DROP TABLE IF EXISTS password_reset_tokens,reviews,suggestions,product_interest,bulk_order_enquiries,inventory_movements,payments,order_items,orders,subscriptions,partner_applications,product_variants,products,categories,users;
SET FOREIGN_KEY_CHECKS=1;

CREATE TABLE users (id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,user_id VARCHAR(32) UNIQUE,name VARCHAR(120) NOT NULL,email VARCHAR(255) NOT NULL UNIQUE,password_hash VARCHAR(255) NOT NULL,phone VARCHAR(20),place VARCHAR(100),state VARCHAR(100),address TEXT,preferred_snacks VARCHAR(255),email_verified_at DATETIME,created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE categories (id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,category_id VARCHAR(32) NOT NULL UNIQUE,city VARCHAR(80) NOT NULL UNIQUE,state VARCHAR(80) NOT NULL,name VARCHAR(120) NOT NULL,display_order SMALLINT UNSIGNED NOT NULL,is_coming_soon BOOLEAN NOT NULL DEFAULT FALSE) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE products (id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,product_id VARCHAR(40) NOT NULL UNIQUE,category_id VARCHAR(32) NOT NULL,name VARCHAR(160) NOT NULL,description TEXT NOT NULL,price DECIMAL(10,2),stock INT UNSIGNED NOT NULL DEFAULT 0,pack_size VARCHAR(80),image_url VARCHAR(500) NOT NULL DEFAULT 'Images/Coming Soon.jpeg',is_coming_soon BOOLEAN NOT NULL DEFAULT FALSE,is_active BOOLEAN NOT NULL DEFAULT TRUE,display_order SMALLINT UNSIGNED NOT NULL,created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,CONSTRAINT fk_products_category FOREIGN KEY(category_id) REFERENCES categories(category_id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE product_variants (id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,variant_id VARCHAR(40) NOT NULL UNIQUE,product_id VARCHAR(40) NOT NULL,parent_variant_id VARCHAR(40) NULL,name VARCHAR(160) NOT NULL,description TEXT NOT NULL,price DECIMAL(10,2),stock INT UNSIGNED NOT NULL DEFAULT 0,pack_size VARCHAR(80),image_url VARCHAR(500) NOT NULL DEFAULT 'Images/Logo.jpeg',is_active BOOLEAN NOT NULL DEFAULT TRUE,display_order SMALLINT UNSIGNED NOT NULL,CONSTRAINT fk_product_variants_product FOREIGN KEY(product_id) REFERENCES products(product_id),CONSTRAINT fk_product_variants_parent FOREIGN KEY(parent_variant_id) REFERENCES product_variants(variant_id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE partner_applications (id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,partner_id VARCHAR(32) UNIQUE,name VARCHAR(120) NOT NULL,contact VARCHAR(20) NOT NULL,email VARCHAR(255) NOT NULL,state VARCHAR(100) NOT NULL,details TEXT NOT NULL,status ENUM('new','reviewing','contacted','declined') NOT NULL DEFAULT 'new',created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE bulk_order_enquiries (id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,enquiry_id VARCHAR(32) UNIQUE,name VARCHAR(120) NOT NULL,email VARCHAR(255) NOT NULL,phone VARCHAR(20) NOT NULL,delivery_address TEXT NOT NULL,state VARCHAR(100) NOT NULL,product VARCHAR(160) NOT NULL,quantity VARCHAR(100) NOT NULL,requirements TEXT,status ENUM('new','contacted','quoted','closed') NOT NULL DEFAULT 'new',created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE subscriptions (id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,subscription_id VARCHAR(32) UNIQUE,email VARCHAR(255) NOT NULL UNIQUE,status ENUM('subscribed','unsubscribed') NOT NULL DEFAULT 'subscribed',created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE orders (id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,order_id VARCHAR(40) UNIQUE,user_id BIGINT UNSIGNED NULL,customer_name VARCHAR(120) NOT NULL,customer_phone VARCHAR(20) NOT NULL,delivery_address TEXT NOT NULL,subtotal DECIMAL(10,2) NOT NULL,total_amount DECIMAL(10,2) NOT NULL,status ENUM('payment_pending','paid','processing','shipped','delivered','cancelled','payment_failed') NOT NULL DEFAULT 'payment_pending',created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,CONSTRAINT fk_orders_user FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE order_items (id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,order_id BIGINT UNSIGNED NOT NULL,product_id VARCHAR(40) NOT NULL,variant_id VARCHAR(40),category_id VARCHAR(32) NOT NULL,product_name VARCHAR(160) NOT NULL,unit_price DECIMAL(10,2) NOT NULL,quantity INT UNSIGNED NOT NULL,CONSTRAINT fk_order_items_order FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE,CONSTRAINT fk_order_items_product FOREIGN KEY(product_id) REFERENCES products(product_id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE payments (id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,payment_id VARCHAR(40) UNIQUE,order_id BIGINT UNSIGNED NOT NULL,razorpay_order_id VARCHAR(100) NOT NULL UNIQUE,razorpay_payment_id VARCHAR(100) UNIQUE,razorpay_signature VARCHAR(255),amount DECIMAL(10,2) NOT NULL,status ENUM('created','paid','failed','refunded') NOT NULL DEFAULT 'created',paid_at DATETIME,created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,CONSTRAINT fk_payments_order FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE inventory_movements (id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,product_id VARCHAR(40) NOT NULL,change_quantity INT NOT NULL,reason ENUM('sale','restock','adjustment','refund') NOT NULL,order_id BIGINT UNSIGNED NULL,created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,CONSTRAINT fk_inventory_product FOREIGN KEY(product_id) REFERENCES products(product_id),CONSTRAINT fk_inventory_order FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE SET NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE product_interest (id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,product_id VARCHAR(40) NOT NULL,email VARCHAR(255) NOT NULL,created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,UNIQUE KEY uq_product_interest(product_id,email),CONSTRAINT fk_interest_product FOREIGN KEY(product_id) REFERENCES products(product_id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE suggestions (id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,user_id BIGINT UNSIGNED NULL,name VARCHAR(120) NOT NULL,email VARCHAR(255),suggestion TEXT NOT NULL,created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,CONSTRAINT fk_suggestions_user FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE password_reset_tokens (id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,user_id BIGINT UNSIGNED NOT NULL,token_hash CHAR(64) NOT NULL,expires_at DATETIME NOT NULL,used_at DATETIME,created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,CONSTRAINT fk_password_reset_user FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE reviews (id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,review_id VARCHAR(32) UNIQUE,user_id BIGINT UNSIGNED NULL,product_id VARCHAR(40) NOT NULL,reviewer VARCHAR(120) NOT NULL,review_type VARCHAR(60) NOT NULL,rating TINYINT UNSIGNED NOT NULL,comment VARCHAR(500) NOT NULL,created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,CONSTRAINT fk_reviews_user FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL,CONSTRAINT fk_reviews_product FOREIGN KEY(product_id) REFERENCES products(product_id),CONSTRAINT chk_reviews_rating CHECK(rating BETWEEN 1 AND 5)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO categories(category_id,city,state,name,display_order,is_coming_soon) VALUES
('GSS_AHM_001','Ahmedabad','Gujarat','Gujarati Snacks',1,FALSE),('GSS_BIK_002','Bikaner','Rajasthan','Bikaneri Snacks',2,FALSE),('GSS_IND_003','Indore','Madhya Pradesh','Indori Snacks',3,FALSE),('GSS_JAI_004','Jaipur','Rajasthan','Rajasthani Sweets',4,FALSE),('GSS_KOC_005','Kochi','Kerala','Kerala Snacks',5,FALSE),('GSS_PUN_006','Pune','Maharashtra','Maharashtrian Snacks',6,FALSE),('GSS_RAT_007','Ratlam','Madhya Pradesh','Ratlami Snacks',7,FALSE);

-- Parent IDs are internal. Every visible variety ID below exactly follows the supplied sequence.
INSERT INTO products(product_id,category_id,name,description,price,stock,pack_size,image_url,is_coming_soon,is_active,display_order) VALUES
('GSS_AHM_KHK_PARENT','GSS_AHM_001','Khakhra','Classic and coin khakhra in your favourite flavours.',NULL,800,NULL,'Images/Khakhra.jpeg',FALSE,TRUE,1),('GSS_AHM_THP_008','GSS_AHM_001','Thepla','Soft, spiced Gujarati thepla made for a comforting snack.',60,100,NULL,'Images/Thepla.jpeg',FALSE,TRUE,2),('GSS_AHM_RGC_009','GSS_AHM_001','Ragi Chips','Crunchy ragi chips with a wholesome twist.',190,100,NULL,'Images/Ragi Chips.jpeg',FALSE,TRUE,3),('GSS_AHM_BTC_010','GSS_AHM_001','Beetroot Chips','Crispy beetroot chips with a distinctive flavour.',190,100,NULL,'Images/Beetroot Chips.jpeg',FALSE,TRUE,4),('GSS_BIK_CHJ_011','GSS_BIK_002','Chana Jor','Crunchy spiced chana jor for an anytime snack.',49,0,'100g / packet','Images/Chana Jor.jpeg',FALSE,TRUE,1),('GSS_IND_PTC_PARENT','GSS_IND_003','Spicy Potato Chips','Crispy spicy potato chips in small and sharing packs.',NULL,108,NULL,'Images/Spicy Potato Chips.jpeg',FALSE,TRUE,1),('GSS_IND_SPM_014','GSS_IND_003','Spicy Parmal (Murmure)','A spicy and crunchy Indori-style parmal and murmure snack.',69,6,'100g / packet','Images/Spicy Parmal (Murmure).jpeg',FALSE,TRUE,2),('GSS_JAI_BSL_015','GSS_JAI_004','Besan Ladoo','Traditional besan ladoo with a rich, comforting sweetness.',30,0,'~63g / piece','Images/Besan Ladoo.jpeg',FALSE,TRUE,1),('GSS_KOC_BNC_016','GSS_KOC_005','Banana Chips','Crispy banana chips inspired by Kerala''s classic snack.',30,0,'50g / packet','Images/Banana Chips.jpeg',FALSE,TRUE,1),('GSS_PUN_BKW_017','GSS_PUN_006','Bhakarwadi','Sweet, spicy and tangy spiral bhakarwadi with a delicious crunch.',89,0,'200g / packet','Images/Bhakarwadi.jpeg',FALSE,TRUE,1),('GSS_RAT_SEV_018','GSS_RAT_007','Sev','Crispy and flavourful Ratlami sev, perfect for chai-time snacking.',69,32,'100g / packet','Images/Sev.jpeg',FALSE,TRUE,1);

INSERT INTO product_variants(variant_id,product_id,parent_variant_id,name,description,price,stock,pack_size,image_url,is_active,display_order) VALUES
('GSS_AHM_001','GSS_AHM_KHK_PARENT',NULL,'Masala Khakhra','Crispy Gujarati masala khakhra.',150,100,NULL,'Images/Khakhra.jpeg',TRUE,1),('GSS_AHM_KHK_002','GSS_AHM_KHK_PARENT',NULL,'Methi Khakhra','Classic methi khakhra.',150,100,NULL,'Images/Khakhra.jpeg',TRUE,2),('GSS_AHM_KHK_003','GSS_AHM_KHK_PARENT',NULL,'Jeera Khakhra','Light and crispy jeera khakhra.',150,100,NULL,'Images/Khakhra.jpeg',TRUE,3),('GSS_AHM_KHK_004','GSS_AHM_KHK_PARENT',NULL,'Coin Khakhra — Peri Peri','Spicy peri peri coin khakhra.',200,100,NULL,'Images/Khakhra.jpeg',TRUE,4),('GSS_AHM_KHK_005','GSS_AHM_KHK_PARENT',NULL,'Coin Khakhra — Pani Puri','Pani puri coin khakhra.',200,100,NULL,'Images/Khakhra.jpeg',TRUE,5),('GSS_AHM_KHK_006','GSS_AHM_KHK_PARENT',NULL,'Coin Khakhra — Pizza Jain','Pizza-style Jain coin khakhra.',200,100,NULL,'Images/Khakhra.jpeg',TRUE,6),('GSS_AHM_KHK_007','GSS_AHM_KHK_PARENT',NULL,'Coin Khakhra — Achari','Tangy achari coin khakhra.',200,100,NULL,'Images/Khakhra.jpeg',TRUE,7),('GSS_IND_PTC_012','GSS_IND_PTC_PARENT',NULL,'Potato Chips — 40g','Snackable potato chips packet.',30,83,'40g / packet','Images/Spicy Potato Chips.jpeg',TRUE,1),('GSS_IND_PTC_013','GSS_IND_PTC_PARENT',NULL,'Potato Chips — 120g','Sharing potato chips packet.',69,25,'120g / packet','Images/Spicy Potato Chips.jpeg',TRUE,2);


-- Run once on an existing GharSe Snacks database after removing email, city, and state from checkout.
ALTER TABLE orders
    DROP COLUMN customer_email,
    DROP COLUMN delivery_place,
    DROP COLUMN delivery_state;
    
-- Run once on an existing GharSe Snacks database.
-- Existing Coin Khakhra variety IDs and category ID are retained.
INSERT INTO products(product_id,category_id,name,description,price,stock,pack_size,image_url,is_coming_soon,is_active,display_order)
VALUES ('GSS_AHM_CKH_PARENT','GSS_AHM_001','Coin Khakhra','Crunchy coin-shaped khakhra in four bold flavours.',NULL,400,NULL,'Images/Coin Khakhra.jpeg',FALSE,TRUE,2);

UPDATE products
SET description='Classic Gujarati khakhra in your favourite flavours.', stock=300, display_order=1
WHERE product_id='GSS_AHM_KHK_PARENT';

UPDATE products
SET display_order=display_order+1
WHERE category_id='GSS_AHM_001' AND product_id NOT IN ('GSS_AHM_KHK_PARENT','GSS_AHM_CKH_PARENT');

UPDATE product_variants
SET product_id='GSS_AHM_CKH_PARENT', image_url='Images/Coin Khakhra.jpeg', display_order=CASE variant_id
    WHEN 'GSS_AHM_KHK_004' THEN 1
    WHEN 'GSS_AHM_KHK_005' THEN 2
    WHEN 'GSS_AHM_KHK_006' THEN 3
    WHEN 'GSS_AHM_KHK_007' THEN 4
END,
name=CASE variant_id
    WHEN 'GSS_AHM_KHK_004' THEN 'Peri Peri Coin Khakhra'
    WHEN 'GSS_AHM_KHK_005' THEN 'Pani Puri Coin Khakhra'
    WHEN 'GSS_AHM_KHK_006' THEN 'Pizza Jain Coin Khakhra'
    WHEN 'GSS_AHM_KHK_007' THEN 'Achari Coin Khakhra'
END
WHERE variant_id IN ('GSS_AHM_KHK_004','GSS_AHM_KHK_005','GSS_AHM_KHK_006','GSS_AHM_KHK_007');


-- Run once on an existing GharSe Snacks database.
-- Existing Coin Khakhra variety IDs and category ID are retained.
INSERT INTO products(product_id,category_id,name,description,price,stock,pack_size,image_url,is_coming_soon,is_active,display_order)
VALUES ('GSS_AHM_CKH_PARENT','GSS_AHM_001','Coin Khakhra','Crunchy coin-shaped khakhra in four bold flavours.',NULL,400,NULL,'Images/Coin Khakhra.jpeg',FALSE,TRUE,2);

UPDATE products
SET description='Classic Gujarati khakhra in your favourite flavours.', stock=300, display_order=1
WHERE product_id='GSS_AHM_KHK_PARENT';

UPDATE products
SET display_order=display_order+1
WHERE category_id='GSS_AHM_001' AND product_id NOT IN ('GSS_AHM_KHK_PARENT','GSS_AHM_CKH_PARENT');

UPDATE product_variants
SET product_id='GSS_AHM_CKH_PARENT', image_url='Images/Coin Khakhra.jpeg', display_order=CASE variant_id
    WHEN 'GSS_AHM_KHK_004' THEN 1
    WHEN 'GSS_AHM_KHK_005' THEN 2
    WHEN 'GSS_AHM_KHK_006' THEN 3
    WHEN 'GSS_AHM_KHK_007' THEN 4
END,
name=CASE variant_id
    WHEN 'GSS_AHM_KHK_004' THEN 'Peri Peri Coin Khakhra'
    WHEN 'GSS_AHM_KHK_005' THEN 'Pani Puri Coin Khakhra'
    WHEN 'GSS_AHM_KHK_006' THEN 'Pizza Jain Coin Khakhra'
    WHEN 'GSS_AHM_KHK_007' THEN 'Achari Coin Khakhra'
END
WHERE variant_id IN ('GSS_AHM_KHK_004','GSS_AHM_KHK_005','GSS_AHM_KHK_006','GSS_AHM_KHK_007');

