/*
SQLyog Community v13.1.6 (64 bit)
MySQL - 5.7.9 : Database - costcomp
*********************************************************************
*/

/*!40101 SET NAMES utf8 */;

/*!40101 SET SQL_MODE=''*/;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
CREATE DATABASE /*!32312 IF NOT EXISTS*/`costcomp` /*!40100 DEFAULT CHARACTER SET latin1 */;

USE `costcomp`;

/*Table structure for table `cloud_providers` */

DROP TABLE IF EXISTS `cloud_providers`;

CREATE TABLE `cloud_providers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `code` varchar(10) NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4;

/*Data for the table `cloud_providers` */

insert  into `cloud_providers`(`id`,`name`,`code`,`is_active`,`created_at`) values 
(1,'Amazon Web Services','aws',1,'2025-08-27 13:09:34'),
(2,'Oracle Cloud Infrastructure','oci',1,'2025-08-27 13:09:34'),
(3,'Microsoft Azure','azure',1,'2025-08-27 13:09:34'),
(4,'Google Cloud Platform','gcp',1,'2025-08-27 13:09:34');

/*Table structure for table `pricing` */

DROP TABLE IF EXISTS `pricing`;

CREATE TABLE `pricing` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `provider_id` int(11) DEFAULT NULL,
  `service_mapping_id` int(11) DEFAULT NULL,
  `region` varchar(50) DEFAULT NULL,
  `instance_type` varchar(100) DEFAULT NULL,
  `price_per_hour` decimal(10,6) DEFAULT NULL,
  `price_per_gb` decimal(10,6) DEFAULT NULL,
  `price_per_request` decimal(10,6) DEFAULT NULL,
  `currency` varchar(3) DEFAULT 'USD',
  `effective_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `provider_id` (`provider_id`),
  KEY `service_mapping_id` (`service_mapping_id`),
  CONSTRAINT `pricing_ibfk_1` FOREIGN KEY (`provider_id`) REFERENCES `cloud_providers` (`id`),
  CONSTRAINT `pricing_ibfk_2` FOREIGN KEY (`service_mapping_id`) REFERENCES `service_mappings` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=199 DEFAULT CHARSET=utf8mb4;

/*Data for the table `pricing` */

insert  into `pricing`(`id`,`provider_id`,`service_mapping_id`,`region`,`instance_type`,`price_per_hour`,`price_per_gb`,`price_per_request`,`currency`,`effective_date`,`created_at`) values 
(1,1,1,'us-east-1','t3.medium',0.041600,0.000000,0.000000,'USD','2025-01-01','2025-08-27 13:27:43'),
(2,1,1,'us-west-2','t3.medium',0.043000,0.000000,0.000000,'USD','2025-01-01','2025-08-27 13:27:43'),
(3,1,1,'eu-west-1','t3.medium',0.045000,0.000000,0.000000,'USD','2025-01-01','2025-08-27 13:27:43'),
(4,1,1,'ap-south-1','t3.medium',0.048000,0.000000,0.000000,'USD','2025-01-01','2025-08-27 13:27:43'),
(5,1,1,'ap-northeast-1','t3.medium',0.049000,0.000000,0.000000,'USD','2025-01-01','2025-08-27 13:27:43'),
(6,1,1,'me-south-1','t3.medium',0.050000,0.000000,0.000000,'USD','2025-01-01','2025-08-27 13:27:43'),
(7,1,2,'us-east-1',NULL,0.000000,0.023000,0.000000,'USD','2025-01-01','2025-08-27 13:27:57'),
(8,1,2,'us-west-2',NULL,0.000000,0.023000,0.000000,'USD','2025-01-01','2025-08-27 13:27:57'),
(9,1,2,'eu-west-1',NULL,0.000000,0.024000,0.000000,'USD','2025-01-01','2025-08-27 13:27:57'),
(10,1,2,'ap-south-1',NULL,0.000000,0.025000,0.000000,'USD','2025-01-01','2025-08-27 13:27:57'),
(11,1,2,'ap-northeast-1',NULL,0.000000,0.025000,0.000000,'USD','2025-01-01','2025-08-27 13:27:57'),
(12,1,2,'me-south-1',NULL,0.000000,0.026000,0.000000,'USD','2025-01-01','2025-08-27 13:27:57'),
(13,1,3,'us-east-1','db.t3.micro',0.017000,0.000000,0.000000,'USD','2025-01-01','2025-08-27 13:28:11'),
(14,1,3,'us-west-2','db.t3.micro',0.018000,0.000000,0.000000,'USD','2025-01-01','2025-08-27 13:28:11'),
(15,1,3,'eu-west-1','db.t3.micro',0.020000,0.000000,0.000000,'USD','2025-01-01','2025-08-27 13:28:11'),
(16,1,3,'ap-south-1','db.t3.micro',0.021000,0.000000,0.000000,'USD','2025-01-01','2025-08-27 13:28:11'),
(17,1,3,'ap-northeast-1','db.t3.micro',0.022000,0.000000,0.000000,'USD','2025-01-01','2025-08-27 13:28:11'),
(18,1,3,'me-south-1','db.t3.micro',0.023000,0.000000,0.000000,'USD','2025-01-01','2025-08-27 13:28:11'),
(19,1,4,'us-east-1',NULL,0.000000,0.000000,0.000002,'USD','2025-01-01','2025-08-27 13:28:23'),
(20,1,4,'us-west-2',NULL,0.000000,0.000000,0.000002,'USD','2025-01-01','2025-08-27 13:28:23'),
(21,1,4,'eu-west-1',NULL,0.000000,0.000000,0.000002,'USD','2025-01-01','2025-08-27 13:28:23'),
(22,1,4,'ap-south-1',NULL,0.000000,0.000000,0.000002,'USD','2025-01-01','2025-08-27 13:28:23'),
(23,1,4,'ap-northeast-1',NULL,0.000000,0.000000,0.000002,'USD','2025-01-01','2025-08-27 13:28:23'),
(24,1,4,'me-south-1',NULL,0.000000,0.000000,0.000002,'USD','2025-01-01','2025-08-27 13:28:23'),
(25,1,5,'us-east-1',NULL,0.000000,0.090000,0.000000,'USD','2025-01-01','2025-08-27 13:28:38'),
(26,1,5,'us-west-2',NULL,0.000000,0.090000,0.000000,'USD','2025-01-01','2025-08-27 13:28:38'),
(27,1,5,'eu-west-1',NULL,0.000000,0.100000,0.000000,'USD','2025-01-01','2025-08-27 13:28:38'),
(28,1,5,'ap-south-1',NULL,0.000000,0.110000,0.000000,'USD','2025-01-01','2025-08-27 13:28:38'),
(29,1,5,'ap-northeast-1',NULL,0.000000,0.120000,0.000000,'USD','2025-01-01','2025-08-27 13:28:38'),
(30,1,5,'me-south-1',NULL,0.000000,0.130000,0.000000,'USD','2025-01-01','2025-08-27 13:28:38'),
(31,2,1,'us-ashburn-1','VM.Standard.E4.Flex',0.033000,0.000000,0.000000,'USD','2025-01-01','2025-08-27 13:31:17'),
(32,2,1,'us-phoenix-1','VM.Standard.E4.Flex',0.034000,0.000000,0.000000,'USD','2025-01-01','2025-08-27 13:31:17'),
(33,2,1,'eu-frankfurt-1','VM.Standard.E4.Flex',0.036000,0.000000,0.000000,'USD','2025-01-01','2025-08-27 13:31:17'),
(34,2,1,'ap-hyderabad-1','VM.Standard.E4.Flex',0.038000,0.000000,0.000000,'USD','2025-01-01','2025-08-27 13:31:17'),
(35,2,1,'ap-tokyo-1','VM.Standard.E4.Flex',0.039000,0.000000,0.000000,'USD','2025-01-01','2025-08-27 13:31:17'),
(36,2,1,'me-dubai-1','VM.Standard.E4.Flex',0.040000,0.000000,0.000000,'USD','2025-01-01','2025-08-27 13:31:17'),
(37,2,2,'us-ashburn-1',NULL,0.000000,0.021000,0.000000,'USD','2025-01-01','2025-08-27 13:31:17'),
(38,2,2,'us-phoenix-1',NULL,0.000000,0.021000,0.000000,'USD','2025-01-01','2025-08-27 13:31:17'),
(39,2,2,'eu-frankfurt-1',NULL,0.000000,0.022000,0.000000,'USD','2025-01-01','2025-08-27 13:31:17'),
(40,2,2,'ap-hyderabad-1',NULL,0.000000,0.022000,0.000000,'USD','2025-01-01','2025-08-27 13:31:17'),
(41,2,2,'ap-tokyo-1',NULL,0.000000,0.023000,0.000000,'USD','2025-01-01','2025-08-27 13:31:17'),
(42,2,2,'me-dubai-1',NULL,0.000000,0.024000,0.000000,'USD','2025-01-01','2025-08-27 13:31:17'),
(43,2,3,'us-ashburn-1','Autonomous-OLTP',0.016500,0.000000,0.000000,'USD','2025-01-01','2025-08-27 13:31:17'),
(44,2,3,'us-phoenix-1','Autonomous-OLTP',0.017000,0.000000,0.000000,'USD','2025-01-01','2025-08-27 13:31:17'),
(45,2,3,'eu-frankfurt-1','Autonomous-OLTP',0.018000,0.000000,0.000000,'USD','2025-01-01','2025-08-27 13:31:17'),
(46,2,3,'ap-hyderabad-1','Autonomous-OLTP',0.019000,0.000000,0.000000,'USD','2025-01-01','2025-08-27 13:31:17'),
(47,2,3,'ap-tokyo-1','Autonomous-OLTP',0.020000,0.000000,0.000000,'USD','2025-01-01','2025-08-27 13:31:17'),
(48,2,3,'me-dubai-1','Autonomous-OLTP',0.021000,0.000000,0.000000,'USD','2025-01-01','2025-08-27 13:31:17'),
(49,2,4,'us-ashburn-1',NULL,0.000000,0.000000,0.000002,'USD','2025-01-01','2025-08-27 13:31:17'),
(50,2,4,'us-phoenix-1',NULL,0.000000,0.000000,0.000002,'USD','2025-01-01','2025-08-27 13:31:17'),
(51,2,4,'eu-frankfurt-1',NULL,0.000000,0.000000,0.000002,'USD','2025-01-01','2025-08-27 13:31:17'),
(52,2,4,'ap-hyderabad-1',NULL,0.000000,0.000000,0.000002,'USD','2025-01-01','2025-08-27 13:31:17'),
(53,2,4,'ap-tokyo-1',NULL,0.000000,0.000000,0.000002,'USD','2025-01-01','2025-08-27 13:31:17'),
(54,2,4,'me-dubai-1',NULL,0.000000,0.000000,0.000002,'USD','2025-01-01','2025-08-27 13:31:17'),
(55,2,5,'us-ashburn-1',NULL,0.000000,0.080000,0.000000,'USD','2025-01-01','2025-08-27 13:31:17'),
(56,2,5,'us-phoenix-1',NULL,0.000000,0.080000,0.000000,'USD','2025-01-01','2025-08-27 13:31:17'),
(57,2,5,'eu-frankfurt-1',NULL,0.000000,0.085000,0.000000,'USD','2025-01-01','2025-08-27 13:31:17'),
(58,2,5,'ap-hyderabad-1',NULL,0.000000,0.090000,0.000000,'USD','2025-01-01','2025-08-27 13:31:17'),
(59,2,5,'ap-tokyo-1',NULL,0.000000,0.095000,0.000000,'USD','2025-01-01','2025-08-27 13:31:17'),
(60,2,5,'me-dubai-1',NULL,0.000000,0.100000,0.000000,'USD','2025-01-01','2025-08-27 13:31:17'),
(61,3,1,'eastus','B2s',0.041000,0.000000,0.000000,'USD','2025-01-01','2025-08-27 13:33:47'),
(62,3,1,'westus2','B2s',0.042000,0.000000,0.000000,'USD','2025-01-01','2025-08-27 13:33:47'),
(63,3,1,'northeurope','B2s',0.043000,0.000000,0.000000,'USD','2025-01-01','2025-08-27 13:33:47'),
(64,3,1,'westeurope','B2s',0.044000,0.000000,0.000000,'USD','2025-01-01','2025-08-27 13:33:47'),
(65,3,1,'southeastasia','B2s',0.046000,0.000000,0.000000,'USD','2025-01-01','2025-08-27 13:33:47'),
(66,3,1,'australiaeast','B2s',0.047000,0.000000,0.000000,'USD','2025-01-01','2025-08-27 13:33:47'),
(67,3,2,'eastus',NULL,0.000000,0.020000,0.000000,'USD','2025-01-01','2025-08-27 13:33:47'),
(68,3,2,'westus2',NULL,0.000000,0.020000,0.000000,'USD','2025-01-01','2025-08-27 13:33:47'),
(69,3,2,'northeurope',NULL,0.000000,0.021000,0.000000,'USD','2025-01-01','2025-08-27 13:33:47'),
(70,3,2,'westeurope',NULL,0.000000,0.021000,0.000000,'USD','2025-01-01','2025-08-27 13:33:47'),
(71,3,2,'southeastasia',NULL,0.000000,0.022000,0.000000,'USD','2025-01-01','2025-08-27 13:33:47'),
(72,3,2,'australiaeast',NULL,0.000000,0.023000,0.000000,'USD','2025-01-01','2025-08-27 13:33:47'),
(73,3,3,'eastus','SQL-DB-GeneralPurpose-2vCore',0.070000,0.000000,0.000000,'USD','2025-01-01','2025-08-27 13:33:47'),
(74,3,3,'westus2','SQL-DB-GeneralPurpose-2vCore',0.072000,0.000000,0.000000,'USD','2025-01-01','2025-08-27 13:33:47'),
(75,3,3,'northeurope','SQL-DB-GeneralPurpose-2vCore',0.074000,0.000000,0.000000,'USD','2025-01-01','2025-08-27 13:33:47'),
(76,3,3,'westeurope','SQL-DB-GeneralPurpose-2vCore',0.076000,0.000000,0.000000,'USD','2025-01-01','2025-08-27 13:33:47'),
(77,3,3,'southeastasia','SQL-DB-GeneralPurpose-2vCore',0.078000,0.000000,0.000000,'USD','2025-01-01','2025-08-27 13:33:47'),
(78,3,3,'australiaeast','SQL-DB-GeneralPurpose-2vCore',0.080000,0.000000,0.000000,'USD','2025-01-01','2025-08-27 13:33:47'),
(79,3,4,'eastus',NULL,0.000000,0.000000,0.000002,'USD','2025-01-01','2025-08-27 13:33:47'),
(80,3,4,'westus2',NULL,0.000000,0.000000,0.000002,'USD','2025-01-01','2025-08-27 13:33:47'),
(81,3,4,'northeurope',NULL,0.000000,0.000000,0.000002,'USD','2025-01-01','2025-08-27 13:33:47'),
(82,3,4,'westeurope',NULL,0.000000,0.000000,0.000002,'USD','2025-01-01','2025-08-27 13:33:47'),
(83,3,4,'southeastasia',NULL,0.000000,0.000000,0.000002,'USD','2025-01-01','2025-08-27 13:33:47'),
(84,3,4,'australiaeast',NULL,0.000000,0.000000,0.000002,'USD','2025-01-01','2025-08-27 13:33:47'),
(85,3,5,'eastus',NULL,0.000000,0.087000,0.000000,'USD','2025-01-01','2025-08-27 13:33:47'),
(86,3,5,'westus2',NULL,0.000000,0.088000,0.000000,'USD','2025-01-01','2025-08-27 13:33:47'),
(87,3,5,'northeurope',NULL,0.000000,0.089000,0.000000,'USD','2025-01-01','2025-08-27 13:33:47'),
(88,3,5,'westeurope',NULL,0.000000,0.090000,0.000000,'USD','2025-01-01','2025-08-27 13:33:47'),
(89,3,5,'southeastasia',NULL,0.000000,0.091000,0.000000,'USD','2025-01-01','2025-08-27 13:33:47'),
(90,3,5,'australiaeast',NULL,0.000000,0.092000,0.000000,'USD','2025-01-01','2025-08-27 13:33:47'),
(91,4,1,'us-central1','e2-medium',0.033000,0.000000,0.000000,'USD','2025-01-01','2025-08-27 13:36:02'),
(92,4,1,'us-east1','e2-medium',0.034000,0.000000,0.000000,'USD','2025-01-01','2025-08-27 13:36:02'),
(93,4,1,'us-west1','e2-medium',0.034000,0.000000,0.000000,'USD','2025-01-01','2025-08-27 13:36:02'),
(94,4,1,'europe-west1','e2-medium',0.036000,0.000000,0.000000,'USD','2025-01-01','2025-08-27 13:36:02'),
(95,4,1,'asia-south1','e2-medium',0.038000,0.000000,0.000000,'USD','2025-01-01','2025-08-27 13:36:02'),
(96,4,1,'australia-southeast1','e2-medium',0.040000,0.000000,0.000000,'USD','2025-01-01','2025-08-27 13:36:02'),
(97,4,2,'us-central1',NULL,0.000000,0.020000,0.000000,'USD','2025-01-01','2025-08-27 13:36:02'),
(98,4,2,'us-east1',NULL,0.000000,0.020000,0.000000,'USD','2025-01-01','2025-08-27 13:36:02'),
(99,4,2,'us-west1',NULL,0.000000,0.021000,0.000000,'USD','2025-01-01','2025-08-27 13:36:02'),
(100,4,2,'europe-west1',NULL,0.000000,0.021000,0.000000,'USD','2025-01-01','2025-08-27 13:36:02'),
(101,4,2,'asia-south1',NULL,0.000000,0.022000,0.000000,'USD','2025-01-01','2025-08-27 13:36:02'),
(102,4,2,'australia-southeast1',NULL,0.000000,0.023000,0.000000,'USD','2025-01-01','2025-08-27 13:36:02'),
(103,4,3,'us-central1','db-f1-micro',0.018000,0.000000,0.000000,'USD','2025-01-01','2025-08-27 13:36:02'),
(104,4,3,'us-east1','db-f1-micro',0.019000,0.000000,0.000000,'USD','2025-01-01','2025-08-27 13:36:02'),
(105,4,3,'us-west1','db-f1-micro',0.019000,0.000000,0.000000,'USD','2025-01-01','2025-08-27 13:36:02'),
(106,4,3,'europe-west1','db-f1-micro',0.020000,0.000000,0.000000,'USD','2025-01-01','2025-08-27 13:36:02'),
(107,4,3,'asia-south1','db-f1-micro',0.021000,0.000000,0.000000,'USD','2025-01-01','2025-08-27 13:36:02'),
(108,4,3,'australia-southeast1','db-f1-micro',0.022000,0.000000,0.000000,'USD','2025-01-01','2025-08-27 13:36:02'),
(109,4,4,'us-central1',NULL,0.000000,0.000000,0.000002,'USD','2025-01-01','2025-08-27 13:36:02'),
(110,4,4,'us-east1',NULL,0.000000,0.000000,0.000002,'USD','2025-01-01','2025-08-27 13:36:02'),
(111,4,4,'us-west1',NULL,0.000000,0.000000,0.000002,'USD','2025-01-01','2025-08-27 13:36:02'),
(112,4,4,'europe-west1',NULL,0.000000,0.000000,0.000002,'USD','2025-01-01','2025-08-27 13:36:02'),
(113,4,4,'asia-south1',NULL,0.000000,0.000000,0.000002,'USD','2025-01-01','2025-08-27 13:36:02'),
(114,4,4,'australia-southeast1',NULL,0.000000,0.000000,0.000002,'USD','2025-01-01','2025-08-27 13:36:02'),
(115,4,5,'us-central1',NULL,0.000000,0.085000,0.000000,'USD','2025-01-01','2025-08-27 13:36:02'),
(116,4,5,'us-east1',NULL,0.000000,0.086000,0.000000,'USD','2025-01-01','2025-08-27 13:36:02'),
(117,4,5,'us-west1',NULL,0.000000,0.087000,0.000000,'USD','2025-01-01','2025-08-27 13:36:02'),
(118,4,5,'europe-west1',NULL,0.000000,0.088000,0.000000,'USD','2025-01-01','2025-08-27 13:36:02'),
(119,4,5,'asia-south1',NULL,0.000000,0.090000,0.000000,'USD','2025-01-01','2025-08-27 13:36:02'),
(120,4,5,'australia-southeast1',NULL,0.000000,0.092000,0.000000,'USD','2025-01-01','2025-08-27 13:36:02'),
(121,1,16,'us-east-1','t3.medium',0.041600,NULL,NULL,'USD','2025-01-01','2025-08-27 14:39:42'),
(122,1,16,'us-east-1','c5.xlarge',0.170000,NULL,NULL,'USD','2025-01-01','2025-08-27 14:39:42'),
(123,1,17,'us-east-1',NULL,NULL,0.025000,NULL,'USD','2025-01-01','2025-08-27 14:39:42'),
(124,1,16,'us-west-2','t3.medium',0.043000,NULL,NULL,'USD','2025-01-01','2025-08-27 14:39:42'),
(125,1,16,'us-west-2','c5.xlarge',0.175000,NULL,NULL,'USD','2025-01-01','2025-08-27 14:39:42'),
(126,1,17,'us-west-2',NULL,NULL,0.025000,NULL,'USD','2025-01-01','2025-08-27 14:39:42'),
(127,1,16,'eu-west-1','t3.medium',0.045000,NULL,NULL,'USD','2025-01-01','2025-08-27 14:39:42'),
(128,1,16,'eu-west-1','c5.xlarge',0.185000,NULL,NULL,'USD','2025-01-01','2025-08-27 14:39:42'),
(129,1,17,'eu-west-1',NULL,NULL,0.026000,NULL,'USD','2025-01-01','2025-08-27 14:39:42'),
(130,1,16,'ap-south-1','t3.medium',0.048000,NULL,NULL,'USD','2025-01-01','2025-08-27 14:39:42'),
(131,1,16,'ap-south-1','c5.xlarge',0.195000,NULL,NULL,'USD','2025-01-01','2025-08-27 14:39:42'),
(132,1,17,'ap-south-1',NULL,NULL,0.030000,NULL,'USD','2025-01-01','2025-08-27 14:39:42'),
(133,1,16,'ap-northeast-1','t3.medium',0.050000,NULL,NULL,'USD','2025-01-01','2025-08-27 14:39:42'),
(134,1,16,'ap-northeast-1','c5.xlarge',0.210000,NULL,NULL,'USD','2025-01-01','2025-08-27 14:39:42'),
(135,1,17,'ap-northeast-1',NULL,NULL,0.029000,NULL,'USD','2025-01-01','2025-08-27 14:39:42'),
(136,1,16,'me-south-1','t3.medium',0.052000,NULL,NULL,'USD','2025-01-01','2025-08-27 14:39:42'),
(137,1,16,'me-south-1','c5.xlarge',0.220000,NULL,NULL,'USD','2025-01-01','2025-08-27 14:39:42'),
(138,1,17,'me-south-1',NULL,NULL,0.032000,NULL,'USD','2025-01-01','2025-08-27 14:39:42'),
(139,3,20,'eastus','D2s_v5',0.045000,NULL,NULL,'USD','2025-01-01','2025-08-27 14:43:49'),
(140,3,21,'eastus',NULL,NULL,0.020000,NULL,'USD','2025-01-01','2025-08-27 14:43:49'),
(141,3,20,'westus2','D2s_v5',0.046000,NULL,NULL,'USD','2025-01-01','2025-08-27 14:43:49'),
(142,3,21,'westus2',NULL,NULL,0.020000,NULL,'USD','2025-01-01','2025-08-27 14:43:49'),
(143,3,20,'westeurope','D2s_v5',0.048000,NULL,NULL,'USD','2025-01-01','2025-08-27 14:43:49'),
(144,3,21,'westeurope',NULL,NULL,0.021000,NULL,'USD','2025-01-01','2025-08-27 14:43:49'),
(145,3,20,'centralindia','D2s_v5',0.050000,NULL,NULL,'USD','2025-01-01','2025-08-27 14:43:49'),
(146,3,21,'centralindia',NULL,NULL,0.024000,NULL,'USD','2025-01-01','2025-08-27 14:43:49'),
(147,3,20,'japaneast','D2s_v5',0.052000,NULL,NULL,'USD','2025-01-01','2025-08-27 14:43:49'),
(148,3,21,'japaneast',NULL,NULL,0.023000,NULL,'USD','2025-01-01','2025-08-27 14:43:49'),
(149,3,20,'uaenorth','D2s_v5',0.055000,NULL,NULL,'USD','2025-01-01','2025-08-27 14:43:49'),
(150,3,21,'uaenorth',NULL,NULL,0.027000,NULL,'USD','2025-01-01','2025-08-27 14:43:49'),
(151,4,22,'us-central1','n2-standard-2',0.042000,NULL,NULL,'USD','2025-01-01','2025-08-27 14:44:29'),
(152,4,23,'us-central1',NULL,NULL,0.020000,NULL,'USD','2025-01-01','2025-08-27 14:44:29'),
(153,4,22,'us-west1','n2-standard-2',0.043000,NULL,NULL,'USD','2025-01-01','2025-08-27 14:44:29'),
(154,4,23,'us-west1',NULL,NULL,0.020000,NULL,'USD','2025-01-01','2025-08-27 14:44:29'),
(155,4,22,'europe-west1','n2-standard-2',0.045000,NULL,NULL,'USD','2025-01-01','2025-08-27 14:44:29'),
(156,4,23,'europe-west1',NULL,NULL,0.021000,NULL,'USD','2025-01-01','2025-08-27 14:44:29'),
(157,4,22,'asia-south1','n2-standard-2',0.047000,NULL,NULL,'USD','2025-01-01','2025-08-27 14:44:29'),
(158,4,23,'asia-south1',NULL,NULL,0.024000,NULL,'USD','2025-01-01','2025-08-27 14:44:29'),
(159,4,22,'asia-northeast1','n2-standard-2',0.049000,NULL,NULL,'USD','2025-01-01','2025-08-27 14:44:29'),
(160,4,23,'asia-northeast1',NULL,NULL,0.023000,NULL,'USD','2025-01-01','2025-08-27 14:44:29'),
(161,4,22,'me-central1','n2-standard-2',0.052000,NULL,NULL,'USD','2025-01-01','2025-08-27 14:44:29'),
(162,4,23,'me-central1',NULL,NULL,0.027000,NULL,'USD','2025-01-01','2025-08-27 14:44:29'),
(163,2,18,'us-ashburn-1','VM.Standard3.Flex',0.040000,NULL,NULL,'USD','2025-01-01','2025-08-27 14:48:33'),
(164,2,19,'us-ashburn-1',NULL,NULL,0.025000,NULL,'USD','2025-01-01','2025-08-27 14:48:33'),
(165,2,18,'us-phoenix-1','VM.Standard3.Flex',0.041000,NULL,NULL,'USD','2025-01-01','2025-08-27 14:48:33'),
(166,2,19,'us-phoenix-1',NULL,NULL,0.025000,NULL,'USD','2025-01-01','2025-08-27 14:48:33'),
(167,2,18,'eu-frankfurt-1','VM.Standard3.Flex',0.045000,NULL,NULL,'USD','2025-01-01','2025-08-27 14:48:33'),
(168,2,19,'eu-frankfurt-1',NULL,NULL,0.026000,NULL,'USD','2025-01-01','2025-08-27 14:48:33'),
(169,2,18,'ap-mumbai-1','VM.Standard3.Flex',0.047000,NULL,NULL,'USD','2025-01-01','2025-08-27 14:48:33'),
(170,2,19,'ap-mumbai-1',NULL,NULL,0.030000,NULL,'USD','2025-01-01','2025-08-27 14:48:33'),
(171,2,18,'ap-tokyo-1','VM.Standard3.Flex',0.049000,NULL,NULL,'USD','2025-01-01','2025-08-27 14:48:33'),
(172,2,19,'ap-tokyo-1',NULL,NULL,0.029000,NULL,'USD','2025-01-01','2025-08-27 14:48:33'),
(173,2,18,'me-dubai-1','VM.Standard3.Flex',0.051000,NULL,NULL,'USD','2025-01-01','2025-08-27 14:48:33'),
(174,2,19,'me-dubai-1',NULL,NULL,0.032000,NULL,'USD','2025-01-01','2025-08-27 14:48:33'),
(175,4,22,'us-east1','n2-standard-2',0.085000,NULL,NULL,'USD','2025-01-01','2025-08-27 14:55:17'),
(176,4,22,'us-west1','n2-standard-2',0.089000,NULL,NULL,'USD','2025-01-01','2025-08-27 14:55:17'),
(177,4,22,'europe-west1','n2-standard-2',0.095000,NULL,NULL,'USD','2025-01-01','2025-08-27 14:55:17'),
(178,4,22,'asia-south1','n2-standard-2',0.100000,NULL,NULL,'USD','2025-01-01','2025-08-27 14:55:17'),
(179,4,22,'asia-northeast1','n2-standard-2',0.105000,NULL,NULL,'USD','2025-01-01','2025-08-27 14:55:17'),
(180,4,22,'me-central1','n2-standard-2',0.110000,NULL,NULL,'USD','2025-01-01','2025-08-27 14:55:17'),
(181,4,23,'us-east1',NULL,NULL,0.020000,NULL,'USD','2025-01-01','2025-08-27 14:55:17'),
(182,4,23,'us-west1',NULL,NULL,0.020000,NULL,'USD','2025-01-01','2025-08-27 14:55:17'),
(183,4,23,'europe-west1',NULL,NULL,0.021000,NULL,'USD','2025-01-01','2025-08-27 14:55:17'),
(184,4,23,'asia-south1',NULL,NULL,0.024000,NULL,'USD','2025-01-01','2025-08-27 14:55:17'),
(185,4,23,'asia-northeast1',NULL,NULL,0.023000,NULL,'USD','2025-01-01','2025-08-27 14:55:17'),
(186,4,23,'me-central1',NULL,NULL,0.027000,NULL,'USD','2025-01-01','2025-08-27 14:55:17'),
(187,4,31,'us-east1',NULL,NULL,0.095000,NULL,'USD','2025-01-01','2025-08-27 14:55:17'),
(188,4,31,'europe-west1',NULL,NULL,0.100000,NULL,'USD','2025-01-01','2025-08-27 14:55:17'),
(189,4,31,'asia-south1',NULL,NULL,0.105000,NULL,'USD','2025-01-01','2025-08-27 14:55:17'),
(190,4,31,'asia-northeast1',NULL,NULL,0.110000,NULL,'USD','2025-01-01','2025-08-27 14:55:17'),
(191,4,31,'me-central1',NULL,NULL,0.115000,NULL,'USD','2025-01-01','2025-08-27 14:55:17'),
(192,4,31,'us-west1',NULL,NULL,0.095000,NULL,'USD','2025-01-01','2025-08-27 14:55:17'),
(193,4,33,'us-east1',NULL,NULL,0.090000,NULL,'USD','2025-01-01','2025-08-27 14:55:17'),
(194,4,33,'europe-west1',NULL,NULL,0.100000,NULL,'USD','2025-01-01','2025-08-27 14:55:17'),
(195,4,33,'asia-south1',NULL,NULL,0.110000,NULL,'USD','2025-01-01','2025-08-27 14:55:17'),
(196,4,33,'asia-northeast1',NULL,NULL,0.120000,NULL,'USD','2025-01-01','2025-08-27 14:55:17'),
(197,4,33,'me-central1',NULL,NULL,0.130000,NULL,'USD','2025-01-01','2025-08-27 14:55:17'),
(198,4,33,'us-west1',NULL,NULL,0.090000,NULL,'USD','2025-01-01','2025-08-27 14:55:17');

/*Table structure for table `service_mappings` */

DROP TABLE IF EXISTS `service_mappings`;

CREATE TABLE `service_mappings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `provider_id` int(11) DEFAULT NULL,
  `service_type_id` int(11) DEFAULT NULL,
  `provider_service_name` varchar(100) NOT NULL,
  `provider_service_code` varchar(50) DEFAULT NULL,
  `conversion_factor` decimal(10,4) DEFAULT '1.0000',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `provider_id` (`provider_id`),
  KEY `service_type_id` (`service_type_id`),
  CONSTRAINT `service_mappings_ibfk_1` FOREIGN KEY (`provider_id`) REFERENCES `cloud_providers` (`id`),
  CONSTRAINT `service_mappings_ibfk_2` FOREIGN KEY (`service_type_id`) REFERENCES `service_types` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4;

/*Data for the table `service_mappings` */

insert  into `service_mappings`(`id`,`provider_id`,`service_type_id`,`provider_service_name`,`provider_service_code`,`conversion_factor`,`created_at`) values 
(1,1,1,'Elastic Compute Cloud (EC2)','ec2',1.0000,'2025-08-27 13:12:37'),
(2,1,2,'Elastic Block Store (EBS)','ebs',1.0000,'2025-08-27 13:12:37'),
(3,1,2,'Simple Storage Service (S3)','s3',1.0000,'2025-08-27 13:12:37'),
(4,1,1,'Lightsail','lightsail',1.0000,'2025-08-27 13:12:37'),
(5,1,3,'Virtual Private Cloud (VPC)','vpc',1.0000,'2025-08-27 13:12:37'),
(6,1,3,'Data Transfer','data-transfer',1.0000,'2025-08-27 13:12:37'),
(7,1,4,'RDS (Relational Database Service)','rds',1.0000,'2025-08-27 13:12:37'),
(8,1,5,'Cost Explorer','cost-explorer',1.0000,'2025-08-27 13:12:37'),
(10,2,2,'Block Volume','oci-block',1.0000,'2025-08-27 13:12:37'),
(11,2,2,'Object Storage','oci-object',1.0000,'2025-08-27 13:12:37'),
(12,2,3,'Virtual Cloud Network (VCN)','oci-vcn',1.0000,'2025-08-27 13:12:37'),
(13,2,3,'Data Transfer','oci-data-transfer',1.0000,'2025-08-27 13:12:37'),
(14,2,4,'Autonomous Database','oci-adb',1.0000,'2025-08-27 13:12:37'),
(15,2,5,'Cost Analysis','oci-cost-analytics',1.0000,'2025-08-27 13:12:37'),
(16,1,1,'Amazon EC2','AWS-EC2',1.0000,'2025-08-27 14:39:22'),
(17,1,2,'Amazon S3','AWS-S3',1.0000,'2025-08-27 14:39:22'),
(18,2,1,'OCI Compute','OCI-COMPUTE',1.0000,'2025-08-27 14:41:42'),
(19,2,2,'OCI Object Storage','OCI-OS',1.0000,'2025-08-27 14:41:42'),
(20,3,1,'Azure Virtual Machines','AZURE-VM',1.0000,'2025-08-27 14:43:33'),
(21,3,2,'Azure Blob Storage','AZURE-BLOB',1.0000,'2025-08-27 14:43:33'),
(22,4,1,'Google Compute Engine','GCP-COMPUTE',1.0000,'2025-08-27 14:44:14'),
(23,4,2,'Google Cloud Storage','GCP-STORAGE',1.0000,'2025-08-27 14:44:14'),
(24,1,2,'Amazon EBS','AWS-EBS',1.0000,'2025-08-27 14:54:18'),
(25,1,4,'Amazon VPC','AWS-VPC',1.0000,'2025-08-27 14:54:18'),
(26,1,4,'AWS Data Transfer','AWS-DATATRANSFER',1.0000,'2025-08-27 14:54:18'),
(27,2,4,'OCI Data Transfer','OCI-DATATRANSFER',1.0000,'2025-08-27 14:54:18'),
(28,3,2,'Azure Managed Disks','AZURE-DISK',1.0000,'2025-08-27 14:54:18'),
(29,3,4,'Azure VNet','AZURE-VNET',1.0000,'2025-08-27 14:54:18'),
(30,3,4,'Azure Data Transfer','AZURE-DATATRANSFER',1.0000,'2025-08-27 14:54:18'),
(31,4,2,'GCP Persistent Disk','GCP-DISK',1.0000,'2025-08-27 14:54:18'),
(32,4,4,'GCP VPC','GCP-VPC',1.0000,'2025-08-27 14:54:18'),
(33,4,4,'GCP Network Egress','GCP-EGRESS',1.0000,'2025-08-27 14:54:18'),
(34,2,1,'Amazon EC2','oci-compute',1.0000,'2025-08-27 14:56:49'),
(35,2,2,'Amazon S3','oci-os',1.0000,'2025-08-27 14:56:49'),
(36,2,2,'Amazon EBS','oci-block',1.0000,'2025-08-27 14:56:49'),
(37,2,4,'Amazon VPC','oci-vcn',1.0000,'2025-08-27 14:56:49'),
(38,2,4,'AWS Data Transfer','oci-data-transfer',1.0000,'2025-08-27 14:56:49');

/*Table structure for table `service_types` */

DROP TABLE IF EXISTS `service_types`;

CREATE TABLE `service_types` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text,
  `category` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_service_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4;

/*Data for the table `service_types` */

insert  into `service_types`(`id`,`name`,`description`,`category`,`created_at`) values 
(1,'Compute','Virtual machines and compute instances','Core','2025-08-27 13:09:44'),
(2,'Storage','Block, object, and archival storage','Core','2025-08-27 13:09:44'),
(3,'Database','Managed database services','Core','2025-08-27 13:09:44'),
(4,'Networking','VPC, data transfer, IPs, load balancing','Core','2025-08-27 13:09:44'),
(5,'Analytics','Data processing and analysis','Optional','2025-08-27 13:09:44');

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
