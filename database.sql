CREATE SCHEMA IF NOT EXISTS `capstone` DEFAULT CHARACTER SET utf8 ;
USE `capstone` ;

CREATE TABLE `tbadmin` (
  `idAdmin` int NOT NULL AUTO_INCREMENT,
  `nama` varchar(45) NOT NULL,
  `password` varchar(100) NOT NULL,
  PRIMARY KEY (`idAdmin`),
  UNIQUE KEY `nama_UNIQUE` (`nama`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb3;

CREATE TABLE `tbrestoran` (
  `idRestoran` int NOT NULL AUTO_INCREMENT,
  `nama` varchar(45) NOT NULL,
  `email` varchar(45) NOT NULL,
  `nomorTelepon` varchar(45) NOT NULL,
  `alamat` varchar(45) NOT NULL,
  `fotoMenu` varchar(255) DEFAULT NULL,
  `password` varchar(100) NOT NULL,
  `status` varchar(45) NOT NULL,
  `tanggalBuat` datetime NOT NULL,
  `tanggalUbah` datetime NOT NULL,
  `qrchatbot` varchar(255) DEFAULT NULL,
  `jumlahMeja` int DEFAULT NULL,
  PRIMARY KEY (`idRestoran`),
  UNIQUE KEY `nama_UNIQUE` (`nama`),
  UNIQUE KEY `email_UNIQUE` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb3;


CREATE TABLE `tbmenu` (
  `idMenu` int NOT NULL AUTO_INCREMENT,
  `nama` varchar(45) NOT NULL,
  `tipe` varchar(45) NOT NULL,
  `harga` int NOT NULL,
  `tanggalBuat` datetime NOT NULL,
  `tanggalUbah` datetime NOT NULL,
  `idRestoran` int NOT NULL,
  PRIMARY KEY (`idMenu`),
  KEY `fk_tbMenu_tbRestoran1_idx` (`idRestoran`),
  CONSTRAINT `fk_tbMenu_tbRestoran1` FOREIGN KEY (`idRestoran`) REFERENCES `tbrestoran` (`idRestoran`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb3;

CREATE TABLE `tbpatterns` (
  `idPatterns` int NOT NULL AUTO_INCREMENT,
  `tag` varchar(45) NOT NULL,
  PRIMARY KEY (`idPatterns`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb3;


CREATE TABLE `tbtransaksi` (
  `idTransaksi` int NOT NULL AUTO_INCREMENT,
  `username` varchar(45) NOT NULL,
  `nomorMeja` int NOT NULL,
  `tanggalBuat` datetime NOT NULL,
  `tanggalBayar` datetime DEFAULT NULL,
  `status` varchar(45) NOT NULL,
  `idRestoran` int NOT NULL,
  PRIMARY KEY (`idTransaksi`),
  KEY `fk_tbTransaksi_tbRestoran1_idx` (`idRestoran`),
  CONSTRAINT `fk_tbTransaksi_tbRestoran1` FOREIGN KEY (`idRestoran`) REFERENCES `tbrestoran` (`idRestoran`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb3;

CREATE TABLE `tbdetailpatterns` (
  `idDetailPatterns` int NOT NULL AUTO_INCREMENT,
  `pesan` varchar(100) NOT NULL,
  `tipe` varchar(45) NOT NULL,
  `idPatterns` int NOT NULL,
  PRIMARY KEY (`idDetailPatterns`),
  KEY `fk_tbDetailPetterns_tbPetterns1_idx` (`idPatterns`),
  CONSTRAINT `fk_tbDetailPetterns_tbPetterns1` FOREIGN KEY (`idPatterns`) REFERENCES `tbpatterns` (`idPatterns`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb3;

CREATE TABLE `tbdetailtransaksi` (
  `idTransaksi` int NOT NULL,
  `idMenu` int NOT NULL,
  `qty` int NOT NULL,
  `harga` int NOT NULL,
  `idDetailTransaksi` int NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`idDetailTransaksi`,`idTransaksi`,`idMenu`),
  KEY `fk_tbTransaksi_has_tbMenu_tbMenu1_idx` (`idMenu`),
  KEY `fk_tbTransaksi_has_tbMenu_tbTransaksi1_idx` (`idTransaksi`),
  CONSTRAINT `fk_tbTransaksi_has_tbMenu_tbMenu1` FOREIGN KEY (`idMenu`) REFERENCES `tbmenu` (`idMenu`),
  CONSTRAINT `fk_tbTransaksi_has_tbMenu_tbTransaksi1` FOREIGN KEY (`idTransaksi`) REFERENCES `tbtransaksi` (`idTransaksi`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb3;