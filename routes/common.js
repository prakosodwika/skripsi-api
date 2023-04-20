const express = require("express");
const router = express.Router();
const con = require("../util/config");
const authToken = require("../util/authToken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// multer
var storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "image");
  },
  filename: (req, file, callback) => {
    callback(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
  },
});

var upload = multer({
  storage: storage,
  fileFilter: (req, file, callback) => {
    if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
      callback(null, true);
    } else {
      callback(null, false);
      return callback(new Error("pastikan format gambar png / jpg / jpeg"));
    }
  },
  limits: { fileSize: 1 * 1024 * 1024 }, // 1mb
}).single("image");

const post = (file, lokasi, id, res) => {
  con.query(`UPDATE tbrestoran SET ${lokasi} = "${file}", tanggalUbah = '${new Date().toISOString().slice(0, 19).replace("T", " ")}'WHERE idRestoran = ${id}`, (err, result, field) => {
    if (err) {
      console.log("error : ", err);
      return res.status(500).json({ error: err });
    }
    if (file.length == 0) {
      return res.status(200).json({
        data: {
          message: "Delete image success",
        },
      });
    } else {
      return res.status(200).json({
        data: {
          message: "Upload image success",
        },
      });
    }
  });
};

router.post("/upload", authToken, (req, res) => {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: err });
    } else if (err) {
      return res.status(400).json({ error: err });
    }

    if (req.user.role == "operator") {
      if (req.user.id != req.body.idRestoran && req.body.lokasi != "menu") return res.status(403).json({ error: "Unauthorized" });
    } else if (req.user.role == "admin") {
      if (req.body.lokasi != "qr") return res.status(403).json({ error: "Unauthorized" });
    }

    const lokasi = req.body.lokasi == "menu" ? "fotoMenu" : req.body.lokasi == "qr" ? "qrchatbot" : "error";
    post(req.file.filename, lokasi, req.body.idRestoran, res);
  });
});

router.post("/delete", authToken, (req, res) => {
  const oldImage = `image/${req.body.oldImage}`;
  const idRestoran = req.body.idRestoran;
  const lokasi = req.body.lokasi == "menu" ? "fotoMenu" : req.body.lokasi == "qr" ? "qrchatbot" : "error";

  if (req.user.role == "operator") {
    if (req.user.id != req.body.idRestoran && req.body.lokasi != "menu") return res.status(403).json({ error: "Unauthorized" });
  } else if (req.user.role == "admin") {
    if (req.body.lokasi != "qr") return res.status(403).json({ error: "Unauthorized" });
  }

  // // delete
  fs.unlink(oldImage, (err) => {
    // jika gagal delete
    if (err) return res.status(400).json({ error: err });
    post("", lokasi, idRestoran, res);
  });
});

module.exports = router;
