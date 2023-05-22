const express = require("express");
const router = express.Router();
const con = require("../util/config");
const authToken = require("../util/authToken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
// aws s3

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

router.get("/download", authToken, (req, res) => {
  if (req.user.role != "operator") {
    return res.status(403).json({ error: "Unauthorized" });
  } else {
    con.query(`SELECT qrchatbot FROM tbrestoran WHERE idRestoran = ${req.user.id}`, (err, result, field) => {
      if (err) {
        return res.status(500).json({ error: err });
      }
      const path = "../skripsi-api/image/" + result[0].qrchatbot;
      console.log("path : ", path);
      fs.readFile(path, (err, data) => {
        if (err) {
          console.log("error : ", err);
          return res.status(500).json({ error: err });
        }
        console.log(data);
        fs.writeFile("../../../../Downloads/QrImage.png", data, (err) => {
          if (err) {
            console.log("error : ", err);
            return res.status(500).json({ error: err });
          }
          return res.status(200).json({
            data: {
              message: "Download Success",
            },
          });
        });
      });
    });
  }
});

module.exports = router;
