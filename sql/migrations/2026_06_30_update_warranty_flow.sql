USE `tech_db`;

CREATE TABLE IF NOT EXISTS `warranty_issue_categories` (
  `issue_category_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `issue_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `is_warranty_eligible` tinyint(1) NOT NULL DEFAULT '1',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`issue_category_id`),
  UNIQUE KEY `uq_warranty_issue_name` (`issue_name`),
  KEY `idx_warranty_issue_active` (`is_active`),
  KEY `idx_warranty_issue_eligible` (`is_warranty_eligible`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `warranty_policies` (
  `policy_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `policy_name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `category_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `brand_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `product_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `from_day` int NOT NULL DEFAULT '0',
  `to_day` int DEFAULT NULL,
  `policy_type` enum('REPLACE_NEW','CONDITIONAL_REPLACE','REPAIR','SEND_TO_BRAND','PAID_REPAIR','REFUSE') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'REPAIR',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`policy_id`),
  KEY `idx_warranty_policy_category` (`category_id`),
  KEY `idx_warranty_policy_brand` (`brand_id`),
  KEY `idx_warranty_policy_product` (`product_id`),
  KEY `idx_warranty_policy_type` (`policy_type`),
  KEY `idx_warranty_policy_active` (`is_active`),
  CONSTRAINT `fk_warranty_policy_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_warranty_policy_brand` FOREIGN KEY (`brand_id`) REFERENCES `brands` (`brand_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_warranty_policy_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE `warranties`
  ADD COLUMN `warranty_code` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL AFTER `warranty_id`,
  ADD COLUMN `order_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL AFTER `customer_id`,
  ADD COLUMN `issue_category_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL AFTER `order_id`,
  ADD COLUMN `policy_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL AFTER `issue_category_id`,
  ADD COLUMN `request_channel` enum('ONLINE','STORE','HOTLINE') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ONLINE' AFTER `assigned_employee_id`,
  ADD COLUMN `service_method` enum('DROP_OFF','PICKUP','SHIPPING') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PICKUP' AFTER `request_channel`,
  MODIFY COLUMN `received_date` date DEFAULT NULL,
  ADD COLUMN `inspection_note` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci AFTER `issue_description`,
  ADD COLUMN `inspection_result` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci AFTER `inspection_note`,
  ADD COLUMN `is_warranty_eligible` tinyint(1) DEFAULT NULL AFTER `inspection_result`,
  ADD COLUMN `estimated_cost` decimal(12,2) DEFAULT NULL AFTER `is_warranty_eligible`,
  ADD COLUMN `customer_confirmed_paid_repair` tinyint(1) NOT NULL DEFAULT '0' AFTER `estimated_cost`,
  MODIFY COLUMN `status` enum('REQUESTED','APPROVED','REJECTED','CUSTOMER_DROP_OFF','PICKUP_SCHEDULED','PICKED_UP','RECEIVED','INSPECTING','WAITING_CUSTOMER_CONFIRMATION','IN_PROGRESS','SENT_TO_BRAND','BRAND_RETURNED','COMPLETED','RETURN_SCHEDULED','RETURNED','CANCELLED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'REQUESTED',
  ADD COLUMN `pickup_receiver_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL AFTER `status`,
  ADD COLUMN `pickup_phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL AFTER `pickup_receiver_name`,
  ADD COLUMN `pickup_address` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL AFTER `pickup_phone`,
  ADD COLUMN `pickup_scheduled_at` datetime DEFAULT NULL AFTER `pickup_address`,
  ADD COLUMN `picked_up_at` datetime DEFAULT NULL AFTER `pickup_scheduled_at`,
  ADD COLUMN `sent_to_brand_at` datetime DEFAULT NULL AFTER `picked_up_at`,
  ADD COLUMN `brand_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL AFTER `sent_to_brand_at`,
  ADD COLUMN `brand_ticket_code` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL AFTER `brand_name`,
  ADD COLUMN `brand_returned_at` datetime DEFAULT NULL AFTER `brand_ticket_code`,
  ADD COLUMN `completed_at` datetime DEFAULT NULL AFTER `brand_returned_at`,
  ADD COLUMN `return_method` enum('DROP_OFF','PICKUP','SHIPPING') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL AFTER `completed_at`,
  ADD COLUMN `return_receiver_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL AFTER `return_method`,
  ADD COLUMN `return_phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL AFTER `return_receiver_name`,
  ADD COLUMN `return_address` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL AFTER `return_phone`,
  ADD COLUMN `return_scheduled_at` datetime DEFAULT NULL AFTER `return_address`,
  ADD COLUMN `returned_at` datetime DEFAULT NULL AFTER `return_scheduled_at`;

UPDATE `warranties`
SET `warranty_code` = CONCAT(
  'BH',
  DATE_FORMAT(COALESCE(`created_at`, NOW()), '%Y%m%d'),
  UPPER(SUBSTRING(REPLACE(`warranty_id`, '-', ''), 1, 6))
)
WHERE `warranty_code` IS NULL OR `warranty_code` = '';

UPDATE `warranties` w
JOIN `devices` d ON d.`device_id` = w.`device_id`
JOIN `orders_details` od ON od.`order_detail_id` = d.`order_detail_id`
SET w.`order_id` = od.`order_id`
WHERE w.`order_id` IS NULL;

ALTER TABLE `warranties`
  MODIFY COLUMN `warranty_code` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  ADD UNIQUE KEY `uq_warranty_code` (`warranty_code`),
  ADD KEY `idx_warranty_order` (`order_id`),
  ADD KEY `idx_warranty_issue_category` (`issue_category_id`),
  ADD KEY `idx_warranty_policy` (`policy_id`),
  ADD KEY `idx_warranty_request_channel` (`request_channel`),
  ADD KEY `idx_warranty_service_method` (`service_method`),
  ADD CONSTRAINT `fk_warranty_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_warranty_issue_category` FOREIGN KEY (`issue_category_id`) REFERENCES `warranty_issue_categories` (`issue_category_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_warranty_policy` FOREIGN KEY (`policy_id`) REFERENCES `warranty_policies` (`policy_id`) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS `warranty_attachments` (
  `attachment_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `warranty_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `uploaded_by_user_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `uploaded_by_employee_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_type` enum('IMAGE','VIDEO') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'IMAGE',
  `purpose` enum('CUSTOMER_EVIDENCE','RECEIVING_PHOTO','INSPECTION_PHOTO','RETURN_PHOTO') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'CUSTOMER_EVIDENCE',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`attachment_id`),
  KEY `idx_warranty_attachment_warranty` (`warranty_id`),
  KEY `idx_warranty_attachment_user` (`uploaded_by_user_id`),
  KEY `idx_warranty_attachment_employee` (`uploaded_by_employee_id`),
  KEY `idx_warranty_attachment_purpose` (`purpose`),
  CONSTRAINT `fk_warranty_attachment_warranty` FOREIGN KEY (`warranty_id`) REFERENCES `warranties` (`warranty_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_warranty_attachment_user` FOREIGN KEY (`uploaded_by_user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_warranty_attachment_employee` FOREIGN KEY (`uploaded_by_employee_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE `warranty_processes`
  DROP FOREIGN KEY `fk_process_employee`,
  DROP FOREIGN KEY `fk_process_warranty`;

ALTER TABLE `warranty_processes`
  MODIFY COLUMN `warranty_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  MODIFY COLUMN `employee_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  MODIFY COLUMN `action` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  ADD COLUMN `old_status` enum('REQUESTED','APPROVED','REJECTED','CUSTOMER_DROP_OFF','PICKUP_SCHEDULED','PICKED_UP','RECEIVED','INSPECTING','WAITING_CUSTOMER_CONFIRMATION','IN_PROGRESS','SENT_TO_BRAND','BRAND_RETURNED','COMPLETED','RETURN_SCHEDULED','RETURNED','CANCELLED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL AFTER `action`,
  ADD COLUMN `new_status` enum('REQUESTED','APPROVED','REJECTED','CUSTOMER_DROP_OFF','PICKUP_SCHEDULED','PICKED_UP','RECEIVED','INSPECTING','WAITING_CUSTOMER_CONFIRMATION','IN_PROGRESS','SENT_TO_BRAND','BRAND_RETURNED','COMPLETED','RETURN_SCHEDULED','RETURNED','CANCELLED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL AFTER `old_status`;

ALTER TABLE `warranty_processes`
  ADD CONSTRAINT `fk_process_employee` FOREIGN KEY (`employee_id`) REFERENCES `users` (`user_id`),
  ADD CONSTRAINT `fk_process_warranty` FOREIGN KEY (`warranty_id`) REFERENCES `warranties` (`warranty_id`) ON DELETE CASCADE;
