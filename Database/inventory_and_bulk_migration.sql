-- Apply this to an existing gharse_snacks database (MySQL 8+).
-- It updates live availability and adds product information to bulk enquiries.
USE gharse_snacks;

ALTER TABLE bulk_order_enquiries
  ADD COLUMN product VARCHAR(160) NOT NULL AFTER state;

UPDATE products SET stock = 0 WHERE product_id NOT IN ('GSS_IND_SPM_015', 'GSS_IND_SPC_014', 'GSS_RAT_SEV_019');
UPDATE products
  SET name = 'Spicy Potato Chips — Small', description = 'Spicy potato chips in a snackable small packet.', price = 30, stock = 83, pack_size = '40g packet'
  WHERE product_id = 'GSS_IND_SPC_014';
UPDATE products
  SET stock = 6, image_url = 'Images/Spicy Parmal (Murmure).jpeg'
  WHERE product_id = 'GSS_IND_SPM_015';
UPDATE products SET stock = 32 WHERE product_id = 'GSS_RAT_SEV_019';

INSERT INTO products (product_id, category_id, name, description, price, stock, pack_size, image_url, is_coming_soon, is_active, display_order)
SELECT 'GSS_IND_SPC_020', 'GSS_IND_003', 'Spicy Potato Chips — Big', 'Spicy potato chips in a generous sharing packet.', 75, 25, '120g packet', 'Images/Spicy Potato Chips.jpeg', FALSE, TRUE, 2
WHERE NOT EXISTS (SELECT 1 FROM products WHERE product_id = 'GSS_IND_SPC_020');
