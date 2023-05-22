const express = require("express");
const router = express.Router();
const con = require("../util/config");
const authToken = require("../util/authToken");
const { ValidatePostMenuRestoranByIdToken, ValidateUpdateMenuRestoranByIdToken, ValidateId } = require("../util/validators");

// upload menu makanan atau minuman
router.post("/postMenuRestoranByIdToken", authToken, (req, res) => {
  const data = {
    nama: req.body.nama,
    tipe: req.body.tipe,
    harga: req.body.harga,
    idRestoran: req.user.id,
  };
  const { valid, _errors } = ValidatePostMenuRestoranByIdToken(data);
  if (!valid) return res.status(400).json({ error: _errors });
  if (req.user.role != "operator") {
    return res.status(403).json({ error: "Unauthorized" });
  } else {
    con.query(
      `INSERT INTO tbmenu (nama, tipe, harga, tanggalBuat, tanggalUbah, idRestoran) VALUES ('${data.nama}', '${data.tipe}', '${data.harga}', now(), now(), '${data.idRestoran}')
      `,
      (err, result, field) => {
        if (err) {
          console.log("error : ", err);
          return res.status(500).json({ error: err });
        }
        console.log("result : ", result.insertId);
        return res.status(200).json({
          data: {
            message: "Upload menu success",
          },
        });
      }
    );
  }
});

// edit menu makanan atau minuman (ubah validasi menjadi data ubah dan idmenu)
router.post("/updateMenuRestoranByIdToken", authToken, (req, res) => {
  const data = {
    nama: req.body.nama,
    tipe: req.body.tipe,
    harga: req.body.harga,
    idRestoran: req.user.id,
    idMenu: req.body.idMenu,
  };
  const { valid, _errors } = ValidateUpdateMenuRestoranByIdToken(data);
  if (!valid) return res.status(400).json({ error: _errors });
  if (req.user.role != "operator") {
    return res.status(403).json({ error: "Unauthorized" });
  } else {
    con.query(`SELECT * FROM tbmenu WHERE idRestoran = "${req.user.id}" AND idMenu = "${data.idMenu}"`, (err, result, field) => {
      if (err) {
        console.log("error : ", err);
        return res.status(500).json({ error: err });
      } else if (result.length == 0) {
        // console.log("error : ", err);
        return res.status(404).json({ error: "data not found" });
      } else {
        con.query(`UPDATE tbmenu SET nama="${data.nama}", tipe = "${data.tipe}", harga = "${data.harga}", tanggalUbah = now() WHERE idMenu = "${data.idMenu}"`, (err, result, field) => {
          if (err) {
            console.log("error : ", err);
            return res.status(500).json({ error: err });
          }
          return res.status(200).json({
            data: {
              message: "Update menu success",
            },
          });
        });
      }
    });
  }
});

router.post("/getMenuByIdMenu", authToken, (req, res) => {
  const data = {
    id: req.body.idMenu,
  };
  const { valid, _errors } = ValidateId(data);
  if (!valid) {
    return res.status(400).json({ error: _errors });
  }
  if (req.user.role != "operator") {
    return res.status(403).json({ error: "Unauthorized" });
  } else {
    con.query(`SELECT nama, tipe, harga FROM tbmenu WHERE idRestoran = "${req.user.id}" AND idMenu = "${data.id}"`, (err, result, field) => {
      if (err) {
        console.log("error : ", err);
        return res.status(500).json({ error: err });
      } else if (result.length == 0) {
        return res.status(404).json({ error: "data not found" });
      } else {
        return res.status(200).json({ data: result });
      }
    });
  }
});

// get menu by idRestoran + token admin
router.post("/getAllMenuIdRestoran", (req, res) => {
  const data = {
    id: req.body.idRestoran,
  };
  const { valid, _errors } = ValidateId(data);
  if (!valid) return res.status(400).json({ error: _errors });
  con.query(`SELECT * FROM tbmenu WHERE idRestoran = "${data.id}"`, (err, result, field) => {
    if (err) {
      return res.status(500).json({ error: err });
    } else if (result.length == 0) {
      return res.status(404).json({ error: "data not found" });
    } else {
      return res.status(200).json({ data: result });
    }
  });
});

// get all menu
router.get("/getAllMenuByIdToken", authToken, (req, res) => {
  if (req.user.role != "operator") {
    return res.status(403).json({ error: "Unauthorized" });
  } else {
    con.query(`SELECT * FROM tbmenu WHERE idRestoran = "${req.user.id}"`, (err, result, field) => {
      if (err) {
        return res.status(500).json({ error: err });
      } else if (result.length == 0) {
        return res.status(404).json({ error: "data not found" });
      } else {
        return res.status(200).json({ data: result });
      }
    });
  }
});

// delete data menu
router.post("/deleteMenuByIdMenu", authToken, (req, res) => {
  const data = {
    id: req.body.idMenu,
  };
  const { valid, _errors } = ValidateId(data);
  if (!valid) {
    return res.status(400).json({ error: _errors });
  }
  if (req.user.role != "operator") {
    return res.status(403).json({ error: "Unauthorized" });
  } else {
    con.query(`DELETE FROM tbmenu WHERE idMenu = ${data.id} AND idRestoran = ${req.user.id}`, (err, result, field) => {
      if (err) {
        console.log("error : ", err);
        return res.status(500).json({ error: err });
      } else if (result.affectedRows == 0) {
        return res.status(404).json({ error: "data not found" });
      } else {
        console.log("result : ", result);
        return res.status(200).json({
          data: {
            message: "Delete success",
          },
        });
      }
    });
  }
});

module.exports = router;
