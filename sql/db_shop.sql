CREATE DATABASE IF NOT EXISTS `tech_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `tech_db`;
-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: techsmart_db
-- ------------------------------------------------------
-- Server version	8.0.36

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `addresses`
--

DROP TABLE IF EXISTS `addresses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `addresses` (
  `address_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `province` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `street` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `ward` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `receiver_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone_number` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`address_id`),
  KEY `fk_address_user` (`user_id`),
  CONSTRAINT `fk_address_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- Table structure for table `brands`
--

DROP TABLE IF EXISTS `brands`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `brands` (
  `brand_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `brand_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `normalize_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`brand_id`),
  UNIQUE KEY `brand_name` (`brand_name`),
  UNIQUE KEY `normalize_name` (`normalize_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `brands`
-- Data for table `brands` (removed for brevity, as it's not part of schema changes)
--

--
-- Table structure for table `carts`
--

DROP TABLE IF EXISTS `carts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `carts` (
  `cart_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`cart_id`),
  KEY `fk_cart_user` (`user_id`),
  CONSTRAINT `fk_cart_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Data for table `carts` (removed for brevity, as it's not part of schema changes)
--

--
-- Table structure for table `carts_items`
--

DROP TABLE IF EXISTS `carts_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `carts_items` (
  `cart_item_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `cart_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `variant_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` int NOT NULL,
  `price_at_add` decimal(15,2) NOT NULL,
  PRIMARY KEY (`cart_item_id`),
  KEY `fk_cartitem_cart` (`cart_id`),
  CONSTRAINT `fk_cartitem_cart` FOREIGN KEY (`cart_id`) REFERENCES `carts` (`cart_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cartitem_variant` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`variant_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `category_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `category_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `normalize_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`category_id`),
  UNIQUE KEY `category_name` (`category_name`),
  UNIQUE KEY `normalize_name` (`normalize_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Data for table `categories` (removed for brevity, as it's not part of schema changes)
--

--
-- Table structure for table `devices`
--

DROP TABLE IF EXISTS `devices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `devices` (
  `device_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `variant_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `serial_number` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('AVAILABLE','RESERVED','SOLD','RETURNED','REPAIRING') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'AVAILABLE',
  `order_detail_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `warranty_end_date` date DEFAULT NULL,
  `sold_date` date DEFAULT NULL,
  PRIMARY KEY (`device_id`),
  UNIQUE KEY `serial_number` (`serial_number`),
  KEY `fk_device_orderdetail` (`order_detail_id`),
  CONSTRAINT `fk_device_orderdetail` FOREIGN KEY (`order_detail_id`) REFERENCES `orders_details` (`order_detail_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_device_variant` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`variant_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data for table `devices` (removed for brevity)
--

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `order_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `employee_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `order_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `total_price` decimal(12,2) NOT NULL,
  `address_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('PENDING','PAID','PAYMENT_FAILED','CONFIRMED','SHIPPED','DELIVERY_FAILED','COMPLETED','CANCELLED', 'RETURNED', 'REFUNDED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `payment_method` enum('COD','CREDIT_CARD','BANK_TRANSFER','CASH','VNPAY') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `receiver_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `receiver_phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`order_id`),
  KEY `fk_orders_user` (`user_id`),
  KEY `fk_orders_employee` (`employee_id`),
  KEY `fk_orders_address` (`address_id`),
  CONSTRAINT `fk_orders_address` FOREIGN KEY (`address_id`) REFERENCES `addresses` (`address_id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_orders_employee` FOREIGN KEY (`employee_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Data for table `orders` (removed for brevity, as it's not part of schema changes)
--

--
-- Table structure for table `orders_details`
--

DROP TABLE IF EXISTS `orders_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders_details` (
  `order_detail_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `order_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `variant_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` int NOT NULL,
  `price` decimal(10,2) NOT NULL,
  PRIMARY KEY (`order_detail_id`),
  KEY `fk_odetail_order` (`order_id`),
  CONSTRAINT `fk_odetail_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_odetail_variant` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`variant_id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Data for table `orders_details` (removed for brevity, as it's not part of schema changes)
--

--
-- Table structure for table `product_images`
--

DROP TABLE IF EXISTS `product_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_images` (
  `image_id` bigint NOT NULL AUTO_INCREMENT,
  `product_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `variant_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `image_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `public_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_default` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`image_id`),
  KEY `fk_product_images_product` (`product_id`),
  KEY `fk_product_images_variant` (`variant_id`),
  CONSTRAINT `fk_product_images_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_product_images_variant` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`variant_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=222 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;


--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `product_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `product_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `brand_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `category_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `warranty_period` int NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`product_id`),
  UNIQUE KEY `product_name` (`product_name`),
  KEY `fk_product_brand` (`brand_id`),
  KEY `fk_product_category` (`category_id`),
  CONSTRAINT `fk_product_brand` FOREIGN KEY (`brand_id`) REFERENCES `brands` (`brand_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_product_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;


--
-- Table structure for table `product_attributes`
--

DROP TABLE IF EXISTS `product_attributes`;
CREATE TABLE `product_attributes` (
  `attribute_id` varchar(50) NOT NULL,
  `attribute_name` varchar(50) NOT NULL,
  `display_order` int DEFAULT '0',
  PRIMARY KEY (`attribute_id`),
  UNIQUE KEY `attribute_name` (`attribute_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Table structure for table `attribute_values`
--

DROP TABLE IF EXISTS `attribute_values`;
CREATE TABLE `attribute_values` (
  `attribute_value_id` varchar(50) NOT NULL,
  `attribute_id` varchar(50) NOT NULL,
  `value` varchar(100) NOT NULL,
  `display_order` int DEFAULT '0',
  PRIMARY KEY (`attribute_value_id`),
  KEY `fk_attr_val_attr` (`attribute_id`),
  CONSTRAINT `fk_attr_val_attr` FOREIGN KEY (`attribute_id`) REFERENCES `product_attributes` (`attribute_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Table structure for table `product_variants`
--

DROP TABLE IF EXISTS `product_variants`;
CREATE TABLE `product_variants` (
  `variant_id` varchar(50) NOT NULL,
  `product_id` varchar(50) NOT NULL,
  `sku` varchar(100) DEFAULT NULL,
  `price` decimal(15,2) NOT NULL,
  `quantity_in_stock` int NOT NULL DEFAULT '0',
  `reserved_quantity` int NOT NULL DEFAULT '0',
  `sold_quantity` int NOT NULL DEFAULT '0',
  `image_url` varchar(255) DEFAULT NULL,
  `public_id` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`variant_id`),
  UNIQUE KEY `sku` (`sku`),
  KEY `fk_variant_product` (`product_id`),
  CONSTRAINT `fk_variant_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Table structure for table `variant_attribute_values`
--

DROP TABLE IF EXISTS `variant_attribute_values`;
CREATE TABLE `variant_attribute_values` (
  `variant_id` varchar(50) NOT NULL,
  `attribute_value_id` varchar(50) NOT NULL,
  PRIMARY KEY (`variant_id`,`attribute_value_id`),
  KEY `fk_vav_value` (`attribute_value_id`),
  CONSTRAINT `fk_vav_variant` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`variant_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_vav_value` FOREIGN KEY (`attribute_value_id`) REFERENCES `attribute_values` (`attribute_value_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Table structure for table `product_variant_specs`
--

DROP TABLE IF EXISTS `product_variant_specs`;
CREATE TABLE `product_variant_specs` (
  `spec_id` bigint NOT NULL AUTO_INCREMENT,
  `variant_id` varchar(50) NOT NULL,
  `spec_key` varchar(100) NOT NULL,
  `spec_value` varchar(255) NOT NULL,
  `display_order` int DEFAULT '0',
  PRIMARY KEY (`spec_id`),
  KEY `fk_specs_variant` (`variant_id`),
  CONSTRAINT `fk_specs_variant` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`variant_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Table structure for table `blog_categories`
--

DROP TABLE IF EXISTS `blog_categories`;
CREATE TABLE `blog_categories` (
  `category_id` varchar(50) NOT NULL,
  `category_name` varchar(100) NOT NULL,
  `description` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`category_id`),
  UNIQUE KEY `category_name` (`category_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Table structure for table `blog_posts`
--

DROP TABLE IF EXISTS `blog_posts`;
CREATE TABLE `blog_posts` (
  `post_id` varchar(50) NOT NULL,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `content` longtext NOT NULL,
  `author_id` varchar(50) NOT NULL,
  `category_id` varchar(50) DEFAULT NULL,
  `status` enum('DRAFT','PUBLISHED','ARCHIVED') DEFAULT 'DRAFT',
  `published_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `thumbnail_url` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`post_id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `fk_post_author` (`author_id`),
  KEY `fk_post_category` (`category_id`),
  CONSTRAINT `fk_post_author` FOREIGN KEY (`author_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `fk_post_category` FOREIGN KEY (`category_id`) REFERENCES `blog_categories` (`category_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Table structure for table `products_promotions`
--

DROP TABLE IF EXISTS `products_promotions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products_promotions` (
  `product_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `promotion_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`product_id`,`promotion_id`),
  KEY `fk_pp_promotion` (`promotion_id`),
  CONSTRAINT `fk_pp_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_pp_promotion` FOREIGN KEY (`promotion_id`) REFERENCES `promotions` (`promotion_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `promotions`
--

DROP TABLE IF EXISTS `promotions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `promotions` (
  `promotion_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `promotion_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `discount_type` enum('PERCENT','FIXED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PERCENT',
  `discount_value` decimal(10,2) NOT NULL,
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`promotion_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;


--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `review_id` bigint NOT NULL AUTO_INCREMENT,
  `product_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `rating` int NOT NULL,
  `comment` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `order_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`review_id`),
  UNIQUE KEY `uk_review_order_product` (`order_id`,`product_id`),
  KEY `fk_review_product` (`product_id`),
  KEY `fk_review_user` (`user_id`),
  CONSTRAINT `fk_review_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_review_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_reviews_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE RESTRICT,
  CONSTRAINT `reviews_chk_1` CHECK ((`rating` between 1 and 5))
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;


--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `role_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`role_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;


--
-- Table structure for table `statistics`
--

DROP TABLE IF EXISTS `statistics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `statistics` (
  `stat_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `stat_date` date NOT NULL,
  `total_orders` int DEFAULT '0',
  `total_revenue` decimal(15,2) DEFAULT '0.00',
  `total_profit` decimal(15,2) DEFAULT '0.00',
  `total_products_sold` int DEFAULT '0',
  `total_inventory` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`stat_id`),
  UNIQUE KEY `unique_stat_date` (`stat_date`),
  KEY `idx_statistics_stat_date` (`stat_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;


--
-- Table structure for table `statistics_products`
--

DROP TABLE IF EXISTS `statistics_products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `statistics_products` (
  `stat_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `product_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity_sold` int DEFAULT '0',
  `revenue` decimal(15,2) DEFAULT '0.00',
  `profit` decimal(15,2) DEFAULT '0.00',
  PRIMARY KEY (`stat_id`,`product_id`),
  KEY `idx_statistics_products_product` (`product_id`),
  KEY `idx_statistics_products_stat` (`stat_id`),
  CONSTRAINT `fk_statistics_products_products` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_statistics_products_statistics` FOREIGN KEY (`stat_id`) REFERENCES `statistics` (`stat_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `pass_word` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `verified` tinyint(1) DEFAULT '0',
  `status` enum('ACTIVE', 'LOCKED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `locked_reason` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `locked_at` datetime DEFAULT NULL,
  `refreshToken` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `verify_token` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `verify_token_expire` datetime DEFAULT NULL,
  `reset_token` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reset_token_expire` datetime DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `user_email_unique` (`email`),
  KEY `idx_user_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;


--
-- Table structure for table `users_roles`
--

DROP TABLE IF EXISTS `users_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users_roles` (
  `user_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `role_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`user_id`,`role_name`),
  KEY `fk_userroles_role` (`role_name`),
  CONSTRAINT `fk_userroles_role` FOREIGN KEY (`role_name`) REFERENCES `roles` (`role_name`) ON DELETE CASCADE,
  CONSTRAINT `fk_userroles_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;


--
-- Table structure for table `warranties`
--

DROP TABLE IF EXISTS `warranties`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `warranties` (
  `warranty_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `device_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `received_date` date NOT NULL,
  `expected_return_date` date DEFAULT NULL,
  `return_date` date DEFAULT NULL,
  `issue_description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `repair_actions` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `accessory_changed` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('RECEIVED','IN_PROGRESS','COMPLETED','RETURNED','CANCELLED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'RECEIVED',
  `note` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`warranty_id`),
  KEY `fk_warranty_device` (`device_id`),
  KEY `idx_warranty_status` (`status`),
  KEY `idx_warranty_customer` (`customer_id`),
  CONSTRAINT `fk_warranty_customer` FOREIGN KEY (`customer_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_warranty_device` FOREIGN KEY (`device_id`) REFERENCES `devices` (`device_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;


DROP TABLE IF EXISTS `warranty_processes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `warranty_processes` (
  `process_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `warranty_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `employee_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `action` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `note` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`process_id`),
  KEY `idx_process_warranty` (`warranty_id`),
  KEY `idx_process_employee` (`employee_id`),
  CONSTRAINT `fk_process_employee` FOREIGN KEY (`employee_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `fk_process_warranty` FOREIGN KEY (`warranty_id`) REFERENCES `warranties` (`warranty_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `inventory_transactions`;
CREATE TABLE `inventory_transactions` (
  `transaction_id`  varchar(50)   NOT NULL,
  `variant_id`      varchar(50)   NOT NULL,
  `order_id`        varchar(50)   DEFAULT NULL,
  `type`            enum('IMPORT','RESERVE','RELEASE','SOLD','ADJUST') NOT NULL,
  `quantity`        int           NOT NULL,
  `before_quantity` int           DEFAULT NULL,
  `after_quantity`  int           DEFAULT NULL,
  `note`            varchar(255)  DEFAULT NULL,
  `created_by`      varchar(50)   DEFAULT NULL,
  `created_at`      datetime      DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`transaction_id`),

  KEY `fk_inventory_variant` (`variant_id`),
  KEY `fk_inventory_order`   (`order_id`),
  KEY `fk_inventory_creator` (`created_by`),
  KEY `idx_inv_created_at`   (`created_at`),
  KEY `idx_inv_type`         (`type`),

  CONSTRAINT `fk_inventory_variant` FOREIGN KEY (`variant_id`)
    REFERENCES `product_variants`(`variant_id`) ON DELETE CASCADE,

  CONSTRAINT `fk_inventory_order` FOREIGN KEY (`order_id`)
    REFERENCES `orders`(`order_id`) ON DELETE SET NULL,

  CONSTRAINT `fk_inventory_creator` FOREIGN KEY (`created_by`)
    REFERENCES `users`(`user_id`) ON DELETE SET NULL

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;


/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

--
-- Triggers for Data Integrity and Inventory Management
--

DELIMITER //

-- 1. Đảm bảo giá và số lượng trong product_variants không bao giờ âm
CREATE TRIGGER trg_product_variants_before_insert
BEFORE INSERT ON product_variants
FOR EACH ROW
BEGIN
    IF NEW.price < 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Lỗi: Giá sản phẩm không được nhỏ hơn 0';
    END IF;
    IF NEW.quantity_in_stock < 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Lỗi: Số lượng tồn kho không được nhỏ hơn 0';
    END IF;
END //

CREATE TRIGGER trg_product_variants_before_update
BEFORE UPDATE ON product_variants
FOR EACH ROW
BEGIN
    IF NEW.price < 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Lỗi: Giá sản phẩm không được nhỏ hơn 0';
    END IF;
    IF NEW.quantity_in_stock < 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Lỗi: Số lượng tồn kho không được nhỏ hơn 0 (Vượt quá số lượng hiện có)';
    END IF;
END //

-- 2. Kiểm soát số lượng đơn hàng và tự động trừ kho khi bán
CREATE TRIGGER trg_orders_details_before_insert
BEFORE INSERT ON orders_details
FOR EACH ROW
BEGIN
    IF NEW.quantity <= 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Lỗi: Số lượng đặt hàng phải lớn hơn 0';
    END IF;
END //

CREATE TRIGGER trg_orders_details_before_update
BEFORE UPDATE ON orders_details
FOR EACH ROW
BEGIN
    IF NEW.quantity <= 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Lỗi: Số lượng đặt hàng phải lớn hơn 0';
    END IF;
END //

CREATE TRIGGER trg_orders_details_after_update
AFTER UPDATE ON orders_details
FOR EACH ROW
BEGIN
    DECLARE ord_status VARCHAR(50);
    SELECT status INTO ord_status FROM orders WHERE order_id = NEW.order_id;

    -- Chỉ bù trừ kho nếu đơn hàng đang ở trạng thái giữ hàng
    IF ord_status NOT IN ('CANCELLED', 'RETURNED', 'REFUNDED', 'DELIVERY_FAILED', 'PAYMENT_FAILED') THEN
        IF OLD.variant_id = NEW.variant_id THEN
            -- Cùng sản phẩm, cập nhật chênh lệch số lượng
            UPDATE product_variants 
            SET quantity_in_stock = quantity_in_stock - (NEW.quantity - OLD.quantity),
                sold_quantity = sold_quantity + (NEW.quantity - OLD.quantity)
            WHERE variant_id = NEW.variant_id;
        ELSE
            -- Thay đổi sản phẩm: Hoàn kho sản phẩm cũ, trừ kho sản phẩm mới
            UPDATE product_variants 
            SET quantity_in_stock = quantity_in_stock + OLD.quantity,
                sold_quantity = sold_quantity - OLD.quantity
            WHERE variant_id = OLD.variant_id;
            
            UPDATE product_variants 
            SET quantity_in_stock = quantity_in_stock - NEW.quantity,
                sold_quantity = sold_quantity + NEW.quantity
            WHERE variant_id = NEW.variant_id;
        END IF;
    END IF;
END //

CREATE TRIGGER trg_orders_details_after_insert
AFTER INSERT ON orders_details
FOR EACH ROW
BEGIN
    DECLARE before_qty INT;

    SELECT quantity_in_stock
    INTO before_qty
    FROM product_variants
    WHERE variant_id = NEW.variant_id;

    -- Trừ kho và tăng số lượng đã bán
    -- Nếu việc trừ kho làm quantity_in_stock < 0, trigger của bảng product_variants sẽ chặn lại
    UPDATE product_variants 
    SET quantity_in_stock = quantity_in_stock - NEW.quantity,
        sold_quantity = sold_quantity + NEW.quantity
    WHERE variant_id = NEW.variant_id;

    INSERT INTO inventory_transactions (
        transaction_id,
        variant_id,
        order_id,
        type,
        quantity,
        before_quantity,
        after_quantity,
        note,
        created_by
    )
    VALUES (
        UUID(),
        NEW.variant_id,
        NEW.order_id,
        'SOLD',
        NEW.quantity,
        before_qty,
        before_qty - NEW.quantity,
        CONCAT('Auto stock deduction for order detail ', NEW.order_detail_id),
        NULL
    );
END //

CREATE TRIGGER trg_orders_details_after_delete
AFTER DELETE ON orders_details
FOR EACH ROW
BEGIN
    DECLARE ord_status VARCHAR(50);
    SELECT status INTO ord_status FROM orders WHERE order_id = OLD.order_id;
    
    -- Hoàn kho khi xóa dòng sản phẩm, trừ khi đơn hàng đã thuộc nhóm hoàn kho
    IF ord_status NOT IN ('CANCELLED', 'RETURNED', 'REFUNDED', 'DELIVERY_FAILED', 'PAYMENT_FAILED') THEN
        UPDATE product_variants 
        SET quantity_in_stock = quantity_in_stock + OLD.quantity,
            sold_quantity = sold_quantity - OLD.quantity
        WHERE variant_id = OLD.variant_id;
    END IF;
END //

-- 3. Hoàn kho khi trạng thái đơn hàng thay đổi
CREATE TRIGGER trg_orders_after_update
AFTER UPDATE ON orders
FOR EACH ROW
BEGIN
    -- Chuyển sang các trạng thái hoàn kho
    IF OLD.status NOT IN ('CANCELLED', 'RETURNED', 'REFUNDED', 'DELIVERY_FAILED', 'PAYMENT_FAILED') 
       AND NEW.status IN ('CANCELLED', 'RETURNED', 'REFUNDED', 'DELIVERY_FAILED', 'PAYMENT_FAILED') THEN
        UPDATE product_variants pv
        JOIN orders_details od ON pv.variant_id = od.variant_id
        SET pv.quantity_in_stock = pv.quantity_in_stock + od.quantity,
            pv.sold_quantity = pv.sold_quantity - od.quantity
        WHERE od.order_id = NEW.order_id;

        INSERT INTO inventory_transactions (
            transaction_id,
            variant_id,
            order_id,
            type,
            quantity,
            before_quantity,
            after_quantity,
            note,
            created_by
        )
        SELECT
            UUID(),
            od.variant_id,
            NEW.order_id,
            'RELEASE',
            od.quantity,
            pv.quantity_in_stock - od.quantity,
            pv.quantity_in_stock,
            CONCAT('Auto stock release when order status changed from ', OLD.status, ' to ', NEW.status),
            NEW.employee_id
        FROM orders_details od
        JOIN product_variants pv ON pv.variant_id = od.variant_id
        WHERE od.order_id = NEW.order_id;

        -- Giải phóng số Serial của thiết bị
        UPDATE devices 
        SET status = 'AVAILABLE', 
            order_detail_id = NULL,
            sold_date = NULL,
            warranty_end_date = NULL
        WHERE order_detail_id IN (SELECT order_detail_id FROM orders_details WHERE order_id = NEW.order_id);

    -- Chuyển ngược lại trạng thái đang xử lý (Trừ lại kho)
    ELSEIF OLD.status IN ('CANCELLED', 'RETURNED', 'REFUNDED', 'DELIVERY_FAILED', 'PAYMENT_FAILED') 
           AND NEW.status NOT IN ('CANCELLED', 'RETURNED', 'REFUNDED', 'DELIVERY_FAILED', 'PAYMENT_FAILED') THEN
        UPDATE product_variants pv
        JOIN orders_details od ON pv.variant_id = od.variant_id
        SET pv.quantity_in_stock = pv.quantity_in_stock - od.quantity,
            pv.sold_quantity = pv.sold_quantity + od.quantity
        WHERE od.order_id = NEW.order_id;

        INSERT INTO inventory_transactions (
            transaction_id,
            variant_id,
            order_id,
            type,
            quantity,
            before_quantity,
            after_quantity,
            note,
            created_by
        )
        SELECT
            UUID(),
            od.variant_id,
            NEW.order_id,
            'SOLD',
            od.quantity,
            pv.quantity_in_stock + od.quantity,
            pv.quantity_in_stock,
            CONCAT('Auto stock deduction when order status changed from ', OLD.status, ' to ', NEW.status),
            NEW.employee_id
        FROM orders_details od
        JOIN product_variants pv ON pv.variant_id = od.variant_id
        WHERE od.order_id = NEW.order_id;
    END IF;
END //

-- 4. Đảm bảo số lượng trong giỏ hàng luôn hợp lệ
CREATE TRIGGER trg_carts_items_before_insert
BEFORE INSERT ON carts_items
FOR EACH ROW
BEGIN
    IF NEW.quantity <= 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Lỗi: Số lượng trong giỏ hàng phải lớn hơn 0';
    END IF;
END //

CREATE TRIGGER trg_carts_items_before_update
BEFORE UPDATE ON carts_items
FOR EACH ROW
BEGIN
    IF NEW.quantity <= 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Lỗi: Số lượng trong giỏ hàng phải lớn hơn 0';
    END IF;
END //

-- 5. Đảm bảo giá trị khuyến mãi không âm
CREATE TRIGGER trg_promotions_before_insert
BEFORE INSERT ON promotions
FOR EACH ROW
BEGIN
    IF NEW.discount_value < 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Lỗi: Giá trị giảm giá không được âm';
    END IF;
END //

CREATE TRIGGER trg_promotions_before_update
BEFORE UPDATE ON promotions
FOR EACH ROW
BEGIN
    IF NEW.discount_value < 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Lỗi: Giá trị giảm giá không được âm';
    END IF;
END //

-- Thủ tục và Event tự động hủy đơn hàng
DROP PROCEDURE IF EXISTS sp_cancel_expired_orders //
CREATE PROCEDURE sp_cancel_expired_orders()
BEGIN
    UPDATE orders
    SET status = 'CANCELLED'
    WHERE status = 'PENDING'
      AND order_date < NOW() - INTERVAL 24 HOUR;
END //

DROP EVENT IF EXISTS evt_auto_cancel_pending_orders //
CREATE EVENT evt_auto_cancel_pending_orders
ON SCHEDULE EVERY 1 HOUR
STARTS CURRENT_TIMESTAMP
DO CALL sp_cancel_expired_orders() //

DELIMITER ;

-- Dump completed on 2026-05-11 16:34:11
