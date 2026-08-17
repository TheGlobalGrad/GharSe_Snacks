-- Run once on an existing GharSe Snacks database after removing email, city, and state from checkout.
ALTER TABLE orders
    DROP COLUMN customer_email,
    DROP COLUMN delivery_place,
    DROP COLUMN delivery_state;
