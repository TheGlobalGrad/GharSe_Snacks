-- Run this file ONCE on the existing gharse_snacks database.
-- It is the authoritative active catalogue and uses the requested product IDs.
USE gharse_snacks;

CREATE TABLE IF NOT EXISTS product_variants (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 variant_id VARCHAR(40) NOT NULL UNIQUE,
 product_id VARCHAR(40) NOT NULL,
 parent_variant_id VARCHAR(40) NULL,
 name VARCHAR(160) NOT NULL,
 description TEXT NOT NULL,
 price DECIMAL(10,2),
 stock INT UNSIGNED NOT NULL DEFAULT 0,
 pack_size VARCHAR(80),
 image_url VARCHAR(500) NOT NULL DEFAULT 'Images/Logo.jpeg',
 is_active BOOLEAN NOT NULL DEFAULT TRUE,
 display_order SMALLINT UNSIGNED NOT NULL,
 CONSTRAINT fk_product_variants_product FOREIGN KEY (product_id) REFERENCES products(product_id),
 CONSTRAINT fk_product_variants_parent FOREIGN KEY (parent_variant_id) REFERENCES product_variants(variant_id)
);

UPDATE products SET is_active = FALSE WHERE product_id IN (
 'GSS_AHM_KHK_001','GSS_AHM_THP_004','GSS_AHM_RGC_010','GSS_AHM_BTC_011',
 'GSS_BIK_CHJ_013','GSS_IND_SPC_014','GSS_IND_SPC_020','GSS_IND_SPM_015',
 'GSS_JAI_BSL_016','GSS_KOC_BNC_017','GSS_PUN_BKW_018','GSS_RAT_SEV_019'
);

UPDATE product_variants SET parent_variant_id = NULL
WHERE product_id IN ('GSS_AHM_KHK_001', 'GSS_IND_PTC_014', 'GSS_AHM_KHK_000', 'GSS_IND_PTC_000');
DELETE FROM product_variants
WHERE product_id IN ('GSS_AHM_KHK_001', 'GSS_IND_PTC_014', 'GSS_AHM_KHK_000', 'GSS_IND_PTC_000');

INSERT INTO products (product_id,category_id,name,description,price,stock,pack_size,image_url,is_coming_soon,is_active,display_order) VALUES
('GSS_AHM_KHK_000','GSS_AHM_001','Khakhra','Classic and coin khakhra in your favourite flavours.',NULL,800,NULL,'Images/Khakhra.jpeg',FALSE,TRUE,1),
('GSS_AHM_THP_008','GSS_AHM_001','Thepla','Soft, spiced Gujarati thepla made for a comforting snack.',60,100,NULL,'Images/Thepla.jpeg',FALSE,TRUE,2),
('GSS_AHM_RGC_009','GSS_AHM_001','Ragi Chips','Crunchy ragi chips with a wholesome twist.',190,100,NULL,'Images/Ragi Chips.jpeg',FALSE,TRUE,3),
('GSS_AHM_BTC_010','GSS_AHM_001','Beetroot Chips','Crispy beetroot chips with a distinctive flavour.',190,100,NULL,'Images/Beetroot Chips.jpeg',FALSE,TRUE,4),
('GSS_BIK_CHJ_011','GSS_BIK_002','Chana Jor','Crunchy spiced chana jor for an anytime snack.',49,0,'100g / packet','Images/Chana Jor.jpeg',FALSE,TRUE,1),
('GSS_IND_PTC_000','GSS_IND_003','Spicy Potato Chips','Crispy spicy potato chips in small and sharing packs.',NULL,108,NULL,'Images/Spicy Potato Chips.jpeg',FALSE,TRUE,1),
('GSS_IND_SPM_014','GSS_IND_003','Spicy Parmal (Murmure)','A spicy and crunchy Indori-style parmal and murmure snack.',69,6,'100g / packet','Images/Spicy Parmal (Murmure).jpeg',FALSE,TRUE,2),
('GSS_JAI_BSL_015','GSS_JAI_004','Besan Ladoo','Traditional besan ladoo with a rich, comforting sweetness.',30,0,'~63g / piece','Images/Besan Ladoo.jpeg',FALSE,TRUE,1),
('GSS_KOC_BNC_016','GSS_KOC_005','Banana Chips','Crispy banana chips inspired by Kerala''s classic snack.',30,0,'50g / packet','Images/Banana Chips.jpeg',FALSE,TRUE,1),
('GSS_PUN_BKW_017','GSS_PUN_006','Bhakarwadi','Sweet, spicy and tangy spiral bhakarwadi with a delicious crunch.',89,0,'200g / packet','Images/Bhakarwadi.jpeg',FALSE,TRUE,1),
('GSS_RAT_SEV_018','GSS_RAT_007','Sev','Crispy and flavourful Ratlami sev, perfect for chai-time snacking.',69,32,'100g / packet','Images/Sev.jpeg',FALSE,TRUE,1)
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id),name=VALUES(name),description=VALUES(description),price=VALUES(price),stock=VALUES(stock),pack_size=VALUES(pack_size),image_url=VALUES(image_url),is_coming_soon=VALUES(is_coming_soon),is_active=VALUES(is_active),display_order=VALUES(display_order);

INSERT INTO product_variants (variant_id,product_id,parent_variant_id,name,description,price,stock,pack_size,image_url,display_order) VALUES
('GSS_AHM_001','GSS_AHM_KHK_000',NULL,'Masala Khakhra','Crispy Gujarati masala khakhra.',150,100,NULL,'Images/Khakhra.jpeg',1),
('GSS_AHM_KHK_002','GSS_AHM_KHK_000',NULL,'Methi Khakhra','Classic methi khakhra.',150,100,NULL,'Images/Khakhra.jpeg',2),
('GSS_AHM_KHK_003','GSS_AHM_KHK_000',NULL,'Jeera Khakhra','Light and crispy jeera khakhra.',150,100,NULL,'Images/Khakhra.jpeg',3),
('GSS_AHM_KHK_004','GSS_AHM_KHK_000',NULL,'Coin Khakhra — Peri Peri','Spicy peri peri coin khakhra.',200,100,NULL,'Images/Khakhra.jpeg',4),
('GSS_AHM_KHK_005','GSS_AHM_KHK_000',NULL,'Coin Khakhra — Pani Puri','Pani puri coin khakhra.',200,100,NULL,'Images/Khakhra.jpeg',5),
('GSS_AHM_KHK_006','GSS_AHM_KHK_000',NULL,'Coin Khakhra — Pizza Jain','Pizza-style Jain coin khakhra.',200,100,NULL,'Images/Khakhra.jpeg',6),
('GSS_AHM_KHK_007','GSS_AHM_KHK_000',NULL,'Coin Khakhra — Achari','Tangy achari coin khakhra.',200,100,NULL,'Images/Khakhra.jpeg',7),
('GSS_IND_PTC_012','GSS_IND_PTC_000',NULL,'Potato Chips — 40g','Snackable potato chips packet.',30,83,'40g / packet','Images/Spicy Potato Chips.jpeg',1),
('GSS_IND_PTC_013','GSS_IND_PTC_000',NULL,'Potato Chips — 120g','Sharing potato chips packet.',69,25,'120g / packet','Images/Spicy Potato Chips.jpeg',2)
ON DUPLICATE KEY UPDATE product_id=VALUES(product_id),parent_variant_id=VALUES(parent_variant_id),name=VALUES(name),description=VALUES(description),price=VALUES(price),stock=VALUES(stock),pack_size=VALUES(pack_size),image_url=VALUES(image_url),is_active=TRUE,display_order=VALUES(display_order);
