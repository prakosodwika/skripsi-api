const express = require("express");
const router = express.Router();
const con = require("../util/config");
const jwt = require("jsonwebtoken");
const { ValidateRegistrasiLoginAdmin } = require("../util/validators");
const { HashPassword, DecryptPassword } = require("../util/hash");

// cek semua admin
// router.get("/", (req, res) => {
//   con.query("SELECT * FROM `tbadmin`", (err, result, field) => {
//     if (err) {
//       // console.log("error : ", err);
//       return res.status(500).json({ error: err });
//     }
//     console.log("result : ", result);
//     if (result.length == 0) {
//       return res.status(404).json({ data: "data not found" });
//     }
//     return res.status(200).json({ data: result });
//   });
// });

// regitstrasi admin
router.post("/registrasi", (req, res) => {
  const data = {
    nama: req.body.nama,
    password: req.body.password,
  };

  const { valid, _errors } = ValidateRegistrasiLoginAdmin(data);
  if (!valid) return res.status(400).json({ error: _errors });
  const hashedPassword = HashPassword(data.password);

  con.query(`INSERT INTO tbadmin (nama, password) VALUES ('${data.nama}', '${hashedPassword}')`, (err, result, field) => {
    if (err) {
      // console.log("error : ", err);
      if (err.code == "ER_DUP_ENTRY") {
        return res.status(400).json({ error: "nama tidak boleh sama" });
      } else {
        return res.status(500).json({ error: err });
      }
    }

    const user = { role: "admin", id: result.insertId, nama: data.nama };
    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
    return res.status(200).json({
      data: {
        message: "Registrasi success",
        token: accessToken,
      },
    });
  });
});

// Login
router.post("/login", (req, res) => {
  const data = {
    nama: req.body.nama,
    password: req.body.password,
  };

  const { valid, _errors } = ValidateRegistrasiLoginAdmin(data);
  if (!valid) return res.status(400).json({ error: _errors });

  con.query(`SELECT * FROM tbadmin where nama = "${data.nama}"`, (err, result, field) => {
    if (err) {
      console.log("error : ", err);
      return res.status(500).json({ error: err });
    } else if (result.length == 0) {
      return res.status(400).json({
        error: {
          nama: `Admin tidak terdaftar`,
        },
      });
    } else if (DecryptPassword(data.password, result[0].password)) {
      const user = {
        role: "admin",
        id: result[0].idAdmin,
        nama: data.nama,
      };
      const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
      return res.status(200).json({
        data: {
          message: "login success",
          token: accessToken,
        },
      });
    } else {
      return res.status(400).json({
        error: {
          password: "Password salah",
        },
      });
    }
  });
});

// router.post

module.exports = router;
