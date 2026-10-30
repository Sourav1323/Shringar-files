SET FOREIGN_KEY_CHECKS = 0;

-- Drop helper procedure if it already exists
DROP PROCEDURE IF EXISTS truncate_if_exists;

DELIMITER //
CREATE PROCEDURE truncate_if_exists(IN tbl_name VARCHAR(128))
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = DATABASE() AND table_name = tbl_name
    ) THEN
        SET @sql = CONCAT('TRUNCATE TABLE `', tbl_name, '`');
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END //
DELIMITER ;

-- 1. Bookings, Payments, Orders & Customer Concerns
CALL truncate_if_exists('booking_items');
CALL truncate_if_exists('payments');
CALL truncate_if_exists('bookings');
CALL truncate_if_exists('custom_requests');
CALL truncate_if_exists('designer_orders');
CALL truncate_if_exists('customer_concerns');

-- 2. User Carts, OTP Verifications & User Accounts
CALL truncate_if_exists('cart_items');
CALL truncate_if_exists('carts');
CALL truncate_if_exists('otp_verifications');
CALL truncate_if_exists('users');

-- 3. Artists & Applications
CALL truncate_if_exists('artist_portfolio_images');
CALL truncate_if_exists('artist_areas');
CALL truncate_if_exists('artist_applications');
CALL truncate_if_exists('design_artist_ids');
CALL truncate_if_exists('artists');

-- 4. Locations (Cities & Areas)
CALL truncate_if_exists('areas');
CALL truncate_if_exists('cities');
CALL truncate_if_exists('design_cities');

DROP PROCEDURE IF EXISTS truncate_if_exists;

SET FOREIGN_KEY_CHECKS = 1;
