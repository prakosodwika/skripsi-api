const express = require("express");
const router = express.Router();
const con = require("../util/config");
const jwt = require("jsonwebtoken");
const authToken = require("../util/authToken");
const { HashPassword, DecryptPassword } = require("../util/hash");
const { ValidateLogin, ValidateRegistrasi, ValidateUpdateRestoranByIdToken, ValidateId, ValidateUpdatePasswordByIdToken, ValidateStatus } = require("../util/validators");

// registrasi
router.post("/registrasi", (req, res) => {
  const data = {
    nama: req.body.nama,
    email: req.body.email,
    nomorTelepon: req.body.nomorTelepon,
    alamat: req.body.alamat,
    password: req.body.password,
    konfirmasiPassword: req.body.konfirmasiPassword,
    status: "belum terverifikasi",
    tanggalBuat: new Date().toISOString().slice(0, 19).replace("T", " "),
    tanggalUbah: new Date().toISOString().slice(0, 19).replace("T", " "),
    jumlahMeja: req.body.jumlahMeja,
  };

  const { valid, _errors } = ValidateRegistrasi(data);
  if (!valid) return res.status(400).json({ error: _errors });
  const hashedPassword = HashPassword(data.password);

  con.query(
    `INSERT INTO tbrestoran (nama, email, nomorTelepon, alamat, password, status, tanggalBuat, tanggalUbah, jumlahMeja)
    VALUES ('${data.nama}', '${data.email}', '${data.nomorTelepon}', '${data.alamat}', '${hashedPassword}', '${data.status}', '${data.tanggalBuat}', '${data.tanggalUbah}', '${data.jumlahMeja}')`,
    (err, result, field) => {
      if (err) {
        console.log("error : ", err);
        if (err.code === "ER_DUP_ENTRY") {
          const text = err.sqlMessage;
          if (text.includes(data.nama)) {
            return res.status(400).json({ error: "Nama telah digunakan" });
          } else {
            return res.status(400).json({ error: "Email telah digunakan" });
          }
        }
        return res.status(500).json({ error: err });
      }
      // console.log("result : ", result.insertId);
      // const user = { role: "operator", id: result.insertId, nama: data.nama };
      // const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
      return res.status(200).json({
        data: {
          message: "registrasi success",
          // token: accessToken,
        },
      });
    }
  );
});

// login
router.post("/login", (req, res) => {
  const data = {
    email: req.body.email,
    password: req.body.password,
  };

  const { valid, _errors } = ValidateLogin(data);
  if (!valid) return res.status(400).json({ error: _errors });

  con.query(`select * from tbrestoran where email = '${data.email}'`, (err, result, field) => {
    if (err) {
      console.log("error : ", err);
      return res.status(500).json({ error: err });
    } else if (result.length == 0) {
      return res.status(400).json({
        error: { email: "Email tidak terdaftar" },
      });
    } else if (DecryptPassword(data.password, result[0].password)) {
      const user = { role: "operator", id: result[0].idRestoran, nama: result[0].nama };
      const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
      return res.status(200).json({
        data: {
          message: "login success",
          token: accessToken,
        },
      });
    } else {
      return res.status(400).json({
        error: { password: "Password salah" },
      });
    }
  });
});

// getAll restoran
router.get("/", authToken, (req, res) => {
  if (req.user.role != "admin") {
    return res.status(403).json({ error: "Unauthorized" });
  } else {
    con.query("select idRestoran, nama, alamat, nomorTelepon, email, jumlahMeja, status from tbrestoran", (err, result, field) => {
      if (err) {
        console.log("error : ", err);
        return res.status(500).json({ error: err });
      }
      return res.status(200).json({ data: result });
    });
  }
});

router.post("/getRestoranByIdRestoran", authToken, (req, res) => {
  const data = {
    id: req.body.idRestoran,
  };
  const { valid, _errors } = ValidateId(data);
  if (!valid) return res.status(400).json({ error: _errors });
  if (req.user.role != "admin") {
    return res.status(403).json({ error: "Unauthorized" });
  } else {
    con.query(`select nama, alamat, nomorTelepon, email, jumlahMeja from tbRestoran where idRestoran = "${data.id}"`, (err, result, field) => {
      if (err) {
        console.log("error : ", err);
        return res.status(500).json({ error: err });
      }
      return res.status(200).json({ data: result });
    });
  }
});

// getRestoran by id in token
router.get("/getRestoranByIdToken", authToken, (req, res) => {
  if (req.user.role != "operator") {
    return res.status(403).json({ error: "Unauthorized" });
  } else {
    con.query(`select idRestoran, nama, email, nomorTelepon, alamat, fotoMenu, qrchatbot, jumlahMeja from tbrestoran where idRestoran = '${req.user.id}'`, (err, result, field) => {
      if (err) {
        console.log("error : ", err);
        return res.status(500).json({ error: err });
      }
      return res.status(200).json({ data: result });
    });
  }
});

// updateRestoran by id in token
router.post("/updateRestoranByIdToken", authToken, (req, res) => {
  const data = {
    nama: req.body.nama,
    email: req.body.email,
    alamat: req.body.alamat,
    nomorTelepon: req.body.nomorTelepon,
    tanggalUbah: new Date().toISOString().slice(0, 19).replace("T", " "),
    jumlahMeja: req.body.jumlahMeja,
  };
  const { valid, _errors } = ValidateUpdateRestoranByIdToken(data);
  if (!valid) return res.status(400).json({ error: _errors });
  if (req.user.role != "operator") {
    return res.status(403).json({ error: "Unauthorized" });
  } else {
    con.query(
      `UPDATE tbrestoran SET nama='${data.nama}', email='${data.email}', alamat='${data.alamat}', nomorTelepon='${data.nomorTelepon}' , tanggalUbah='${data.tanggalUbah}', jumlahMeja='${data.jumlahMeja}' WHERE idRestoran='${req.user.id}';`,
      (err, result, field) => {
        if (err) {
          console.log("error : ", err);
          return res.status(500).json({ error: err });
        }
        return res.status(200).json({
          data: {
            message: "Update data success",
          },
        });
      }
    );
  }
});

router.post("/postVerifikasi", authToken, (req, res) => {
  const data = {
    status: "terverifikasi",
    id: req.body.idRestoran,
  };
  const { valid, _errors } = ValidateId(data);
  if (!valid) return res.status(400).json({ error: _errors });
  if (req.user.role != "admin") {
    return res.status(403).json({ error: "Unauthorized" });
  } else {
    con.query(`UPDATE tbrestoran SET status = "${data.status}" WHERE idRestoran = ${data.id}`, (err, result, field) => {
      if (err) {
        return res.status(500).json({ error: err });
      }
      return res.status(200).json({
        data: {
          message: "Update success",
        },
      });
    });
  }
});
// updatepassword
// router.post("/updatePasswordByIdToken", authToken, (res, req) => {
//   const data = {
//     passwordLama: req.body.passwordLama,
//     passwordBaru: req.body.passwordBaru,
//     konfirmasiPasswordBaru: req.body.konfirmasiPasswordBaru
//   };

//   const {valid, _errors} = ValidateUpdatePasswordByIdToken(data)
//   if (!valid) return res.status(400).json({errors: _errors})
//   if (req.user.role != "operator") {
//     return res.status(403).json({error: "Unauthorized"})
//     // error ngelu
//   } else if (){
//     con.query
//   }

// });

// upload gambar
// edit gambar
// upload qr
// edit stattus
// router.post("/updateStatusRestoranByAdmin", authToken, (res, req) => {
//   const data = {
//     status: "Terverifikasi"
//   }
// })

module.exports = router;
