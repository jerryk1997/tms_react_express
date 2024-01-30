-- MySQL dump 10.13  Distrib 8.0.34, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: tms
-- ------------------------------------------------------
-- Server version	8.0.34

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
-- Table structure for table `application`
--

DROP TABLE IF EXISTS `application`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `application` (
  `App_Acronym` varchar(50) NOT NULL,
  `App_Description` longtext,
  `App_Rnumber` int NOT NULL,
  `App_startDate` varchar(50) DEFAULT NULL,
  `App_endDate` varchar(50) DEFAULT NULL,
  `App_permit_Create` varchar(50) NOT NULL,
  `App_permit_Open` varchar(50) NOT NULL,
  `App_permit_toDoList` varchar(50) NOT NULL,
  `App_permit_Doing` varchar(50) NOT NULL,
  `App_permit_Done` varchar(50) NOT NULL,
  PRIMARY KEY (`App_Acronym`),
  KEY `fk_App_permit_Create` (`App_permit_Create`),
  KEY `fk_App_permit_Open` (`App_permit_Open`),
  KEY `fk_App_permit_toDoList` (`App_permit_toDoList`),
  KEY `fk_App_permit_Doing` (`App_permit_Doing`),
  KEY `fk_App_permit_Done` (`App_permit_Done`),
  CONSTRAINT `fk_App_permit_Create` FOREIGN KEY (`App_permit_Create`) REFERENCES `groups` (`group_name`),
  CONSTRAINT `fk_App_permit_Doing` FOREIGN KEY (`App_permit_Doing`) REFERENCES `groups` (`group_name`),
  CONSTRAINT `fk_App_permit_Done` FOREIGN KEY (`App_permit_Done`) REFERENCES `groups` (`group_name`),
  CONSTRAINT `fk_App_permit_Open` FOREIGN KEY (`App_permit_Open`) REFERENCES `groups` (`group_name`),
  CONSTRAINT `fk_App_permit_toDoList` FOREIGN KEY (`App_permit_toDoList`) REFERENCES `groups` (`group_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `groups`
--

DROP TABLE IF EXISTS `groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `groups` (
  `group_name` varchar(50) NOT NULL,
  PRIMARY KEY (`group_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `plan`
--

DROP TABLE IF EXISTS `plan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `plan` (
  `Plan_MVP_name` varchar(50) NOT NULL,
  `Plan_startDate` varchar(50) DEFAULT NULL,
  `Plan_endDate` varchar(50) DEFAULT NULL,
  `Plan_app_Acronym` varchar(50) NOT NULL,
  PRIMARY KEY (`Plan_MVP_name`,`Plan_app_Acronym`),
  KEY `App_Acronym_idx` (`Plan_app_Acronym`),
  CONSTRAINT `App_Acronym` FOREIGN KEY (`Plan_app_Acronym`) REFERENCES `application` (`App_Acronym`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `task`
--

DROP TABLE IF EXISTS `task`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `task` (
  `Task_Name` varchar(50) NOT NULL,
  `Task_description` longtext,
  `Task_notes` longtext,
  `Task_id` varchar(100) NOT NULL,
  `Task_plan` varchar(50) DEFAULT NULL,
  `Task_createDate` varchar(50) NOT NULL,
  `Task_state` varchar(10) NOT NULL,
  `Task_creator` varchar(50) NOT NULL,
  `Task_owner` varchar(50) NOT NULL,
  `Task_app_Acronym` varchar(50) NOT NULL,
  PRIMARY KEY (`Task_id`),
  KEY `App_acronym_idx` (`Task_app_Acronym`),
  KEY `App_creator_idx` (`Task_creator`),
  KEY `Owner_idx` (`Task_owner`),
  KEY `Plan_idx` (`Task_plan`),
  KEY `plan` (`Task_plan`,`Task_app_Acronym`),
  CONSTRAINT `Creator` FOREIGN KEY (`Task_creator`) REFERENCES `users` (`username`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Owner` FOREIGN KEY (`Task_owner`) REFERENCES `users` (`username`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `plan` FOREIGN KEY (`Task_plan`, `Task_app_Acronym`) REFERENCES `plan` (`Plan_MVP_name`, `Plan_app_Acronym`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Task_app_acronym` FOREIGN KEY (`Task_app_Acronym`) REFERENCES `application` (`App_Acronym`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL,
  `groups` varchar(1000) DEFAULT NULL,
  PRIMARY KEY (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Inserting default user groups required for basic functionality
--
LOCK TABLES `groups` WRITE;
INSERT INTO `groups` VALUES ('admin'),('project lead');
UNLOCK TABLES;

--
-- Inserting default users required for basic functionality
--

LOCK TABLES `users` WRITE;
INSERT INTO `users` VALUES ('admin','$2a$10$SUmxuNvk5A8hplF29MqzHeXCEPkq3Q302jpvOjzuOdI56Imys6wdC','admin@tms.com',1,'admin'),
('project lead','$2a$10$XbK/5NMnt/1tmy1TpAW8WuRXlOcX4Ait7u8l/iyEJYso6TDUlg2Gq','project_lead@tms.com',1,'project lead');
UNLOCK TABLES;

/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;