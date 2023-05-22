const express = require("express");
const router = express.Router();
const con = require("../util/config");
var qrCode = require("qrcode");
const authToken = require("../util/authToken");
const { ValidateLinkToQr } = require("../util/validators");

router.post("/", authToken, (req, res) => {
  // const location = ""
  let data = {
    idRestoran: req.body.idRestoran,
    link: req.body.telegramLink,
    image: "image" + "-" + Date.now() + ".png",
  };
  // let stJson = JSON.stringify(data);
  // console.log(stJson);
  const { valid, _errors } = ValidateLinkToQr(data);
  if (!valid) return res.status(400).json({ error: _errors });
  qrCode.toFile(`image/${data.image}`, data.link, { type: "terminal" }, (err, code) => {
    if (err) {
      console.log("error : ", err);
      res.status(500).json({ error: err });
    } else {
      con.query(`UPDATE tbrestoran SET qrchatbot = "${data.image}", tanggalUbah = now() WHERE idRestoran = ${data.idRestoran}`, (err, result, field) => {
        if (err) {
          console.log("error : ", err);
          return res.status(500).json({ error: err });
        } else {
          return res.status(200).json({
            data: {
              message: "Upload image success",
            },
          });
        }
      });
    }
  });
});

module.exports = router;
