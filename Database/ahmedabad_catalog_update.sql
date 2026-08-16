-- Run this non-destructive migration on an existing gharse_snacks database.
USE gharse_snacks;

CREATE TABLE IF NOT EXISTS product_variants (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, variant_id VARCHAR(40) NOT NULL UNIQUE, product_id VARCHAR(40) NOT NULL,
 parent_variant_id VARCHAR(40) NULL, name VARCHAR(160) NOT NULL, description TEXT NOT NULL, price DECIMAL(10,2), stock INT UNSIGNED NOT NULL DEFAULT 0,
 pack_size VARCHAR(80), image_url VARCHAR(500) NOT NULL DEFAULT 'Images/Logo.jpeg', is_active BOOLEAN NOT NULL DEFAULT TRUE, display_order SMALLINT UNSIGNED NOT NULL,
 CONSTRAINT fk_product_variants_product FOREIGN KEY (product_id) REFERENCES products(product_id),
 CONSTRAINT fk_product_variants_parent FOREIGN KEY (parent_variant_id) REFERENCES product_variants(variant_id)
);
UPDATE categories SET is_coming_soon = FALSE WHERE category_id = 'GSS_AHM_001';
UPDATE products SET image_url = 'Images/Khakhra.jpeg' WHERE product_id = 'GSS_AHM_KHK_001';
UPDATE product_variants SET image_url = 'Images/Khakhra.jpeg' WHERE product_id = 'GSS_AHM_KHK_001';
UPDATE products SET is_active = FALSE WHERE product_id IN ('GSS_AHM_MKH_001','GSS_AHM_MTH_002','GSS_AHM_JKH_003','GSS_AHM_CPP_005','GSS_AHM_CPN_006','GSS_AHM_CJN_007','GSS_AHM_CAC_008');
INSERT INTO products (product_id,category_id,name,description,price,stock,pack_size,image_url,is_coming_soon,is_active,display_order)
SELECT 'GSS_AHM_KHK_001','GSS_AHM_001','Khakhra','Classic and coin khakhra in your favourite flavours.',NULL,800,NULL,'Images/Logo.jpeg',FALSE,TRUE,1
WHERE NOT EXISTS (SELECT 1 FROM products WHERE product_id = 'GSS_AHM_KHK_001');
UPDATE products SET price = 60, stock = 100, image_url = 'Images/Thepla.jpeg', is_coming_soon = FALSE WHERE product_id = 'GSS_AHM_THP_004';
UPDATE products SET name = 'Ragi Chips', description = 'Crunchy ragi chips with a wholesome twist.', price = 190, stock = 100, image_url = 'Images/Ragi Chips.jpeg', is_coming_soon = FALSE WHERE product_id = 'GSS_AHM_RGC_010';
UPDATE products SET price = 190, stock = 100, image_url = 'Images/Beetroot Chips.jpeg', is_coming_soon = FALSE WHERE product_id = 'GSS_AHM_BTC_011';
INSERT IGNORE INTO product_variants (variant_id,product_id,parent_variant_id,name,description,price,stock,image_url,display_order) VALUES
('GSS_AHM_KHK_MASALA','GSS_AHM_KHK_001',NULL,'Masala Khakhra','Crispy Gujarati masala khakhra.',150,100,'Images/Logo.jpeg',1),('GSS_AHM_KHK_METHI','GSS_AHM_KHK_001',NULL,'Methi Khakhra','Classic methi khakhra.',150,100,'Images/Logo.jpeg',2),('GSS_AHM_KHK_JEERA','GSS_AHM_KHK_001',NULL,'Jeera Khakhra','Light and crispy jeera khakhra.',150,100,'Images/Logo.jpeg',3),('GSS_AHM_KHK_COIN','GSS_AHM_KHK_001',NULL,'Coin Khakhra','Bite-sized coin khakhra.',NULL,0,'Images/Logo.jpeg',4),('GSS_AHM_KHK_PERI','GSS_AHM_KHK_001','GSS_AHM_KHK_COIN','Peri Peri','Spicy peri peri coin khakhra.',200,100,'Images/Logo.jpeg',5),('GSS_AHM_KHK_PANI','GSS_AHM_KHK_001','GSS_AHM_KHK_COIN','Pani Puri','Pani puri coin khakhra.',200,100,'Images/Logo.jpeg',6),('GSS_AHM_KHK_PIZZA','GSS_AHM_KHK_001','GSS_AHM_KHK_COIN','Pizza Jain','Pizza-style Jain coin khakhra.',200,100,'Images/Logo.jpeg',7),('GSS_AHM_KHK_ACHARI','GSS_AHM_KHK_001','GSS_AHM_KHK_COIN','Achari','Tangy achari coin khakhra.',200,100,'Images/Logo.jpeg',8);

UPDATE products SET is_active = FALSE WHERE product_id IN ('GSS_IND_SPC_014','GSS_IND_SPC_020');
INSERT INTO products (product_id,category_id,name,description,price,stock,pack_size,image_url,is_coming_soon,is_active,display_order)
SELECT 'GSS_IND_PTC_014','GSS_IND_003','Spicy Potato Chips','Crispy spicy potato chips in small and sharing packs.',NULL,108,NULL,'Images/Spicy Potato Chips.jpeg',FALSE,TRUE,1
WHERE NOT EXISTS (SELECT 1 FROM products WHERE product_id = 'GSS_IND_PTC_014');
INSERT IGNORE INTO product_variants (variant_id,product_id,parent_variant_id,name,description,price,stock,pack_size,image_url,display_order) VALUES
('GSS_IND_PTC_001','GSS_IND_PTC_014',NULL,'Small Pack','40g snackable packet.',30,83,'40g packet','Images/Spicy Potato Chips.jpeg',1),('GSS_IND_PTC_002','GSS_IND_PTC_014',NULL,'Big Pack','120g sharing packet.',75,25,'120g packet','Images/Spicy Potato Chips.jpeg',2);
