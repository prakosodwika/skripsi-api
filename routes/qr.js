const express = require("express");
const router = express.Router();
var qrCode = require("qrcode");

router.get("/", (req, res) => {
  let data = "https://www.youtube.com/watch?v=zSPasbw4A4s";
  // let stJson = JSON.stringify(data);
  // console.log(stJson);
  qrCode.toString(data, { type: "terminal" }, (err, code) => {
    if (err) {
      console.log("error : ", err);
      res.status(500).json({ error: err });
    } else {
      console.log(code);
      return res.status(200).json({ message: "success" });
    }
  });
});

module.exports = router;
