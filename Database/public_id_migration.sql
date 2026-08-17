-- Run once on an existing database. It preserves records while replacing
-- internal numeric references with public GSS_* identifiers.
SET FOREIGN_KEY_CHECKS=0;
ALTER TABLE order_items DROP FOREIGN KEY fk_order_items_order;
ALTER TABLE payments DROP FOREIGN KEY fk_payments_order;
ALTER TABLE inventory_movements DROP FOREIGN KEY fk_inventory_order;
ALTER TABLE orders DROP FOREIGN KEY fk_orders_user;
ALTER TABLE order_items MODIFY order_id VARCHAR(40) NOT NULL;
ALTER TABLE payments MODIFY order_id VARCHAR(40) NOT NULL;
ALTER TABLE inventory_movements MODIFY order_id VARCHAR(40) NULL;
ALTER TABLE orders MODIFY user_id VARCHAR(32) NULL;
UPDATE order_items oi JOIN orders o ON oi.order_id = CONVERT(CAST(o.id AS CHAR) USING utf8mb4) COLLATE utf8mb4_0900_ai_ci SET oi.order_id = o.order_id;
UPDATE payments p JOIN orders o ON p.order_id = CONVERT(CAST(o.id AS CHAR) USING utf8mb4) COLLATE utf8mb4_0900_ai_ci SET p.order_id = o.order_id;
UPDATE inventory_movements im JOIN orders o ON im.order_id = CONVERT(CAST(o.id AS CHAR) USING utf8mb4) COLLATE utf8mb4_0900_ai_ci SET im.order_id = o.order_id;
UPDATE orders o JOIN users u ON o.user_id = CONVERT(CAST(u.id AS CHAR) USING utf8mb4) COLLATE utf8mb4_0900_ai_ci SET o.user_id = u.user_id;
ALTER TABLE orders ADD CONSTRAINT fk_orders_user FOREIGN KEY(user_id) REFERENCES users(user_id) ON DELETE SET NULL;
ALTER TABLE order_items ADD CONSTRAINT fk_order_items_order FOREIGN KEY(order_id) REFERENCES orders(order_id) ON DELETE CASCADE;
ALTER TABLE payments ADD CONSTRAINT fk_payments_order FOREIGN KEY(order_id) REFERENCES orders(order_id) ON DELETE CASCADE;
ALTER TABLE inventory_movements ADD CONSTRAINT fk_inventory_order FOREIGN KEY(order_id) REFERENCES orders(order_id) ON DELETE SET NULL;
SET FOREIGN_KEY_CHECKS=1;
