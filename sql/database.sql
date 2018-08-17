DROP DATABASE IF EXISTS `mc`;
CREATE DATABASE `mc`;
USE `mc`;
DROP TABLE IF EXISTS `student`;
CREATE TABLE `student` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(18) DEFAULT NULL,
  `id_code` varchar(30) DEFAULT NULL,
  `competition_area` varchar(20) DEFAULT NULL,
  `type` int(11) DEFAULT NULL,
  `school_name` varchar(100) DEFAULT NULL,
  `major` varchar(100) DEFAULT NULL,
  `school_number` varchar(50) DEFAULT NULL,
  `contact` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

LOCK TABLES `student` WRITE;

UNLOCK TABLES;

DROP TABLE IF EXISTS `teacher`;

CREATE TABLE `teacher` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(18) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password` varchar(200) DEFAULT NULL,
  `accsee` int(11) DEFAULT NULL,
  `gender` int(11) DEFAULT NULL,
  `qq_number` varchar(20) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `login_time` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

LOCK TABLES `teacher` WRITE;

UNLOCK TABLES;

CREATE TABLE `race` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  `introduction` varchar(300) DEFAULT NULL,
  `start_time` datetime DEFAULT NULL,
  `end_time` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

LOCK TABLES `race` WRITE;

UNLOCK TABLES;

