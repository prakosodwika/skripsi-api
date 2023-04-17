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

router.post("/upload", authToken, (req, res) => {
  console.log("test");
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: err });
    } else if (err) {
      return res.status(400).json({ error: err });
    }
    if (req.body.lokasi == "menu") {
      con.query(
        `UPDATE tbrestoran SET fotoMenu = '${req.file.filename}' WHERE idRestoran = ${req.user.id};
      `,
        (err, result, field) => {
          if (err) {
            console.log("error : ", err);
            return res.status(500).json({ error: err });
          }
          return res.status(200).json({ data: "Upload gambar menu success" });
        }
      );
    } else if (req.body.lokasi == "qr") {
      con.query(
        `UPDATE tbrestoran SET qrchatbot = '${req.file.filename}' WHERE idRestoran = ${req.user.id};
      `,
        (err, result, field) => {
          if (err) {
            console.log("error : ", err);
            return res.status(500).json({ error: err });
          }
          return res.status(200).json({ data: "Upload gambar qr chat bot success" });
        }
      );
    } else {
      fs.unlinkSync(file);
      return res.status(500).json({ error: "Upload gagal" });
    }
  });
});

module.exports = router;
