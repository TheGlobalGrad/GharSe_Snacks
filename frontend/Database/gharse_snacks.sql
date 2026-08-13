-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: gharse_snacks
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `catalog`
--

DROP TABLE IF EXISTS `catalog`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `catalog` (
  `product_id` int NOT NULL,
  `category_id` varchar(50) NOT NULL,
  `category_name` varchar(100) NOT NULL,
  `product_code` varchar(50) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `price` decimal(10,2) NOT NULL,
  `stock` int NOT NULL DEFAULT '0',
  `image_url` varchar(500) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`product_id`),
  UNIQUE KEY `product_code` (`product_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `catalog`
--

LOCK TABLES `catalog` WRITE;
/*!40000 ALTER TABLE `catalog` DISABLE KEYS */;
INSERT INTO `catalog` VALUES (1,'AHM-GUJ','Ahmedabad, Gujarat','AHM-THP','Classic Thepla Box','Soft thepla, masala twist, perfect for hostel chai breaks and quick snacking.',180.00,100,'Images/Thepla.jpeg','2026-08-05 14:31:32'),(2,'AHM-GUJ','Ahmedabad, Gujarat','AHM-KHK','Khakhra Crunch Pack','Thin, roasted, and crunchy - the one snack that never feels too much.',160.00,100,'Images/Khakhra.jpeg','2026-08-05 14:31:32'),(3,'AHM-GUJ','Ahmedabad, Gujarat','AHM-BHK','Bhakri Bites','Rustic, hearty, and made for people who want a bold munch without fuss.',195.00,100,'Images/Bhakhri.jpeg','2026-08-05 14:31:32'),(4,'IDR-MP','Indore, Madhya Pradesh','IDR-SEV','Indori Tikhi Sev','A spicy little crunch with the indori flavour profile everyone loves.',170.00,100,'Images/Rtalami Sev.jpeg','2026-08-05 14:31:32'),(8,'KOC-KL','Kochi, Kerala','KOC-BNC','Banana Chips','A hometown favourite, coming to GharSe soon.',0.00,0,'Images/Banana Chips.jpeg','2026-08-06 14:55:40'),(9,'BSR-UP','Varanasi, Uttar Pradesh','BSR-LAD','Besan Ladoo','A hometown favourite, coming to GharSe soon.',0.00,0,'Images/Besan Ladoo.jpeg','2026-08-06 14:55:40'),(10,'AHM-GUJ','Ahmedabad, Gujarat','AHM-GTY','Gathiya','A hometown favourite, coming to GharSe soon.',0.00,0,'Images/Gtahiya.png','2026-08-06 14:55:40'),(11,'AHM-GUJ','Ahmedabad, Gujarat','AHM-BKW','Bhakarwadi','A hometown favourite, coming to GharSe soon.',0.00,0,'Images/Bhakarwadi.jpeg','2026-08-06 14:55:40'),(12,'IDR-MP','Indore, Madhya Pradesh','IDR-CHJ','Chana Jor','A hometown favourite, coming to GharSe soon.',0.00,0,'Images/Chana Jor.jpeg','2026-08-06 14:55:40'),(13,'AHM-GUJ','Ahmedabad, Gujarat','AHM-CHV','Chivda','A hometown favourite, coming to GharSe soon.',0.00,0,'Images/Chivda.jpeg','2026-08-06 14:55:40'),(14,'IDR-MP','Indore, Madhya Pradesh','IDR-POT','Potato Chips','A hometown favourite, coming to GharSe soon.',0.00,0,'Images/Potato Chips.jpeg','2026-08-06 14:55:40'),(15,'CHE-TN','Chennai, Tamil Nadu','CHE-RGC','Ragi Chips','A hometown favourite, coming to GharSe soon.',0.00,0,'Images/Raagi Chips.jpeg','2026-08-06 14:55:40'),(16,'CHE-TN','Chennai, Tamil Nadu','CHE-SYS','Soya Sticks','A hometown favourite, coming to GharSe soon.',0.00,0,'Images/Soya Sticks.jpeg','2026-08-06 14:55:40'),(17,'GSS-GUJ-1','Ahmedabad',NULL,'Moti Gathiya','A regional GharSe favourite. Coming soon to the catalogue.',100.00,0,NULL,'2026-08-06 22:17:04'),(18,'GSS-GUJ-1','Ahmedabad',NULL,'Gathiya Papdi','A regional GharSe favourite. Coming soon to the catalogue.',100.00,0,NULL,'2026-08-06 22:17:04'),(19,'GSS-GUJ-1','Ahmedabad',NULL,'Khakhra Crunch Pack','A regional GharSe favourite. Coming soon to the catalogue.',100.00,100,NULL,'2026-08-06 22:17:04'),(20,'GSS-GUJ-1','Ahmedabad',NULL,'Classic Thepla Box','A regional GharSe favourite. Coming soon to the catalogue.',100.00,100,NULL,'2026-08-06 22:17:04'),(21,'GSS-GUJ-1','Ahmedabad',NULL,'Bhakri Bites','A regional GharSe favourite. Coming soon to the catalogue.',100.00,100,NULL,'2026-08-06 22:17:04'),(22,'GSS-KAR-1','Bengaluru',NULL,'Ragi Chips','A regional GharSe favourite. Coming soon to the catalogue.',100.00,0,NULL,'2026-08-06 22:17:04'),(23,'GSS-KER-1','Kochi',NULL,'Banana Chips','A regional GharSe favourite. Coming soon to the catalogue.',100.00,0,NULL,'2026-08-06 22:17:04'),(24,'GSS-IDR-1','Indore',NULL,'Indori Tikhi Sev','A regional GharSe favourite. Coming soon to the catalogue.',100.00,100,NULL,'2026-08-06 22:17:04'),(25,'GSS-IDR-1','Indore',NULL,'Chatpate Potato Chips','A regional GharSe favourite. Coming soon to the catalogue.',100.00,0,NULL,'2026-08-06 22:17:04'),(26,'GSS-IDR-1','Indore',NULL,'Chatpate Parmal','A regional GharSe favourite. Coming soon to the catalogue.',100.00,0,NULL,'2026-08-06 22:17:04'),(27,'GSS-MAH-1','Mumbai',NULL,'Bhakarwadi','A regional GharSe favourite. Coming soon to the catalogue.',100.00,0,NULL,'2026-08-06 22:17:04'),(28,'GSS-RAJ-1','Jaipur',NULL,'Besan Ladoo','A regional GharSe favourite. Coming soon to the catalogue.',100.00,0,NULL,'2026-08-06 22:17:04'),(29,'GSS-UP-1','Varanasi',NULL,'Chana Jor Garam','A regional GharSe favourite. Coming soon to the catalogue.',100.00,0,NULL,'2026-08-06 22:17:04');
/*!40000 ALTER TABLE `catalog` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `items_ordered`
--

DROP TABLE IF EXISTS `items_ordered`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `items_ordered` (
  `id` int NOT NULL AUTO_INCREMENT,
  `item_ref` varchar(50) DEFAULT NULL,
  `order_id` int NOT NULL,
  `product_id` int NOT NULL,
  `category_id` varchar(50) DEFAULT NULL,
  `quantity` int NOT NULL,
  `price` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `item_ref` (`item_ref`),
  KEY `fk_items_ordered_order` (`order_id`),
  KEY `fk_items_ordered_catalog` (`product_id`),
  CONSTRAINT `fk_items_ordered_catalog` FOREIGN KEY (`product_id`) REFERENCES `catalog` (`product_id`),
  CONSTRAINT `fk_items_ordered_order` FOREIGN KEY (`order_id`) REFERENCES `order_details` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `items_ordered`
--

LOCK TABLES `items_ordered` WRITE;
/*!40000 ALTER TABLE `items_ordered` DISABLE KEYS */;
INSERT INTO `items_ordered` VALUES (1,'GS-ITEM-000001',1,2,'AHM-GUJ',1,160.00),(2,'GS-ITEM-000002',1,4,'IDR-MP',1,170.00),(3,'GSS-ITEM-000003',2,19,'GSS-GUJ-1',3,100.00),(4,'GSS-ITEM-000004',3,19,'GSS-GUJ-1',3,100.00);
/*!40000 ALTER TABLE `items_ordered` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_details`
--

DROP TABLE IF EXISTS `order_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_details` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_number` varchar(50) DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `status` varchar(50) DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_number` (`order_number`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `order_details_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_details`
--

LOCK TABLES `order_details` WRITE;
/*!40000 ALTER TABLE `order_details` DISABLE KEYS */;
INSERT INTO `order_details` VALUES (1,'GS-ORD-000001',NULL,389.00,'pending','2026-08-06 17:46:30'),(2,'GSS-IN-ORD-000002',4,354.00,'pending','2026-08-10 21:32:35'),(3,'GSS-IN-ORD-000003',5,354.00,'pending','2026-08-10 21:50:49');
/*!40000 ALTER TABLE `order_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `partner_applications`
--

DROP TABLE IF EXISTS `partner_applications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `partner_applications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `partner_id` varchar(50) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `contact` varchar(20) NOT NULL,
  `email` varchar(150) NOT NULL,
  `state` varchar(100) NOT NULL,
  `details` text NOT NULL,
  `status` varchar(50) DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `partner_id` (`partner_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `partner_applications`
--

LOCK TABLES `partner_applications` WRITE;
/*!40000 ALTER TABLE `partner_applications` DISABLE KEYS */;
INSERT INTO `partner_applications` VALUES (3,'GS-PARTNER-000003','Test Partner','9876543210','partner@test.com','Gujarat','Test partner details','pending','2026-08-05 17:50:06'),(4,'GS-PARTNER-000004','sdds','scdgmailcom','scd@gmail.com','dwdsdsds','dd','pending','2026-08-06 17:57:52');
/*!40000 ALTER TABLE `partner_applications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `payment_ref` varchar(50) DEFAULT NULL,
  `order_id` int NOT NULL,
  `razorpay_order_id` varchar(255) DEFAULT NULL,
  `razorpay_payment_id` varchar(255) DEFAULT NULL,
  `razorpay_signature` varchar(500) DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `status` varchar(50) DEFAULT 'created',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `payment_ref` (`payment_ref`),
  KEY `fk_payments_order` (`order_id`),
  CONSTRAINT `fk_payments_order` FOREIGN KEY (`order_id`) REFERENCES `order_details` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
INSERT INTO `payments` VALUES (1,'GS-PAY-000001',1,'order_TMZUe1VPaeWxUo',NULL,NULL,389.00,'created','2026-08-06 17:46:30'),(2,'GSS-PAY-000002',2,'order_TODTw0DwJOSJlk',NULL,NULL,354.00,'created','2026-08-10 21:32:35'),(3,'GSS-PAY-000003',3,'order_TODnCQoSVSTy9J',NULL,NULL,354.00,'created','2026-08-10 21:50:49');
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_interest`
--

DROP TABLE IF EXISTS `product_interest`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_interest` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `category_id` varchar(50) DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `requested_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_product_interest_product` (`product_id`),
  KEY `idx_product_interest_user` (`user_id`),
  CONSTRAINT `fk_interest_catalog` FOREIGN KEY (`product_id`) REFERENCES `catalog` (`product_id`),
  CONSTRAINT `fk_product_interest_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_interest`
--

LOCK TABLES `product_interest` WRITE;
/*!40000 ALTER TABLE `product_interest` DISABLE KEYS */;
INSERT INTO `product_interest` VALUES (1,9,'BSR-UP',NULL,1,'2026-08-06 17:02:11'),(2,9,'BSR-UP',NULL,1,'2026-08-06 17:02:14'),(3,9,'BSR-UP',NULL,1,'2026-08-06 17:02:14'),(4,9,'BSR-UP',NULL,1,'2026-08-06 17:02:14'),(5,9,'BSR-UP',NULL,1,'2026-08-06 17:02:14'),(6,9,'BSR-UP',NULL,1,'2026-08-06 17:02:15'),(7,8,'KOC-KL',NULL,1,'2026-08-06 17:02:16'),(8,10,'AHM-GUJ',NULL,1,'2026-08-06 17:35:26'),(9,10,'AHM-GUJ',NULL,1,'2026-08-06 17:37:25'),(10,10,'AHM-GUJ',NULL,1,'2026-08-06 17:37:27'),(11,9,'BSR-UP',NULL,1,'2026-08-06 17:59:06');
/*!40000 ALTER TABLE `product_interest` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `review_ref` varchar(50) DEFAULT NULL,
  `product_id` int NOT NULL,
  `reviewer` varchar(100) NOT NULL,
  `review_type` varchar(50) NOT NULL,
  `rating` int NOT NULL,
  `comment` text NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `review_ref` (`review_ref`),
  KEY `fk_reviews_catalog` (`product_id`),
  CONSTRAINT `fk_reviews_catalog` FOREIGN KEY (`product_id`) REFERENCES `catalog` (`product_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
INSERT INTO `reviews` VALUES (2,NULL,'GS-REV-000002',1,'Test Reviewer','Tried a sample',5,'Great taste!','2026-08-05 17:50:35');
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subscriptions`
--

DROP TABLE IF EXISTS `subscriptions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subscriptions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `subscription_ref` varchar(50) DEFAULT NULL,
  `email` varchar(150) NOT NULL,
  `status` enum('subscribed','unsubscribed') NOT NULL DEFAULT 'subscribed',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `subscribed_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `unsubscribed_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `subscription_ref` (`subscription_ref`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subscriptions`
--

LOCK TABLES `subscriptions` WRITE;
/*!40000 ALTER TABLE `subscriptions` DISABLE KEYS */;
INSERT INTO `subscriptions` VALUES (2,NULL,'GS-SUB-000002','subscriber@test.com','subscribed','2026-08-05 17:50:26','2026-08-06 20:46:46',NULL),(3,NULL,'GS-SUB-000003','bhumi7080206@gmail.com','subscribed','2026-08-06 15:56:42','2026-08-06 20:46:46',NULL),(5,NULL,'GS-SUB-000005','bhoomi7080206@gmail.com','subscribed','2026-08-06 17:57:02','2026-08-06 20:46:46',NULL),(8,NULL,'GSS-SUB-000008','ipm24029@iimj.ac.in','subscribed','2026-08-10 21:03:47','2026-08-10 21:03:47',NULL);
/*!40000 ALTER TABLE `subscriptions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `suggestions`
--

DROP TABLE IF EXISTS `suggestions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `suggestions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `suggestion` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `suggestions`
--

LOCK TABLES `suggestions` WRITE;
/*!40000 ALTER TABLE `suggestions` DISABLE KEYS */;
/*!40000 ALTER TABLE `suggestions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `customer_id` varchar(50) DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `place` varchar(120) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `preferred_snacks` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `account_type` enum('registered','guest') NOT NULL DEFAULT 'registered',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `customer_id` (`customer_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (2,'GS-CUST-000002','Test User','testuser@example.com','test123',NULL,NULL,NULL,NULL,'2026-08-05 17:49:40','registered'),(3,'GS-CUST-000003','Bhumika','dewfewf@gmail.com','xdcewce','def343','vfrvtr','rvervre','fvtbt','2026-08-06 18:07:29','registered'),(4,'GSS-IN-000004','Bhumika',NULL,NULL,'9288322832',NULL,'fewfewgfwr',NULL,'2026-08-10 21:32:35','guest'),(5,'GSS-IN-000005','frgfrgrgrtg',NULL,NULL,'9289247879',NULL,'gvgrfb',NULL,'2026-08-10 21:50:49','guest');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-08-11  4:48:30
