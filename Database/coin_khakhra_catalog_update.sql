-- Run once on an existing GharSe Snacks database.
-- Existing Coin Khakhra variety IDs and category ID are retained.
INSERT INTO products(product_id,category_id,name,description,price,stock,pack_size,image_url,is_coming_soon,is_active,display_order)
VALUES ('GSS_AHM_CKH_PARENT','GSS_AHM_001','Coin Khakhra','Crunchy coin-shaped khakhra in four bold flavours.',NULL,400,NULL,'Images/Coin Khakhra.jpeg',FALSE,TRUE,2)
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id),name=VALUES(name),description=VALUES(description),price=VALUES(price),stock=VALUES(stock),pack_size=VALUES(pack_size),image_url=VALUES(image_url),is_coming_soon=VALUES(is_coming_soon),is_active=VALUES(is_active),display_order=VALUES(display_order);

UPDATE products
SET description='Classic Gujarati khakhra in your favourite flavours.', stock=300, display_order=1
WHERE product_id='GSS_AHM_KHK_PARENT';

UPDATE products
SET display_order=CASE product_id
    WHEN 'GSS_AHM_THP_008' THEN 3 WHEN 'GSS_AHM_RGC_009' THEN 4 WHEN 'GSS_AHM_BTC_010' THEN 5
    ELSE display_order END
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
