const express = require("express");
const router = express.Router();
const con = require("../util/config");
const jwt = require("jsonwebtoken");
const authToken = require("../util/authToken");
const fs = require("fs");
const { HashPassword, DecryptPassword } = require("../util/hash");
const { ValidateLogin, ValidateRegistrasi, ValidateUpdateRestoranByIdToken, ValidateId, ValidateUpdatePasswordByIdToken, ValidateStatus, ValidateDeleteAkun } = require("../util/validators");

// registrasi done
router.post("/registrasi", (req, res) => {
  const data = {
    nama: req.body.nama,
    email: req.body.email,
    nomorTelepon: req.body.nomorTelepon,
    alamat: req.body.alamat,
    password: req.body.password,
    konfirmasiPassword: req.body.konfirmasiPassword,
    status: "belum terverifikasi",
    jumlahMeja: req.body.jumlahMeja,
  };

  const { valid, _errors } = ValidateRegistrasi(data);
  if (!valid) return res.status(400).json({ error: _errors });
  const hashedPassword = HashPassword(data.password);

  con.query(
    `INSERT INTO tbrestoran (nama, email, nomorTelepon, alamat, password, status, tanggalBuat, tanggalUbah, jumlahMeja)
    VALUES ('${data.nama}', '${data.email}', '${data.nomorTelepon}', '${data.alamat}', '${hashedPassword}', '${data.status}', now(), now(), '${data.jumlahMeja}')`,
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
        } else if (err.code === "ER_DATA_TOO_LONG") {
          return res.status(400).json({ error: "Alamat terlalu panjang" });
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

// getAll restoran (admin)
router.get("/", authToken, (req, res) => {
  if (req.user.role != "admin") {
    return res.status(403).json({ error: "Unauthorized" });
  } else {
    con.query("select idRestoran, nama, alamat, nomorTelepon, email, jumlahMeja, status, qrchatbot, fotoMenu from tbrestoran", (err, result, field) => {
      if (err) {
        console.log("error : ", err);
        return res.status(500).json({ error: err });
      }
      return res.status(200).json({ data: result });
    });
  }
});

// get 1 data restoran by id restoran (admin)
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

// getRestoran by id token
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
    jumlahMeja: req.body.jumlahMeja,
  };
  const { valid, _errors } = ValidateUpdateRestoranByIdToken(data);
  if (!valid) return res.status(400).json({ error: _errors });
  if (req.user.role != "operator") {
    return res.status(403).json({ error: "Unauthorized" });
  } else {
    con.query(
      `UPDATE tbrestoran SET nama='${data.nama}', email='${data.email}', alamat='${data.alamat}', nomorTelepon='${data.nomorTelepon}' , tanggalUbah= now() , jumlahMeja='${data.jumlahMeja}' WHERE idRestoran='${req.user.id}';`,
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
    status: req.body.status,
    id: req.body.idRestoran,
  };
  const { valid, _errors } = ValidateStatus(data);
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

// ubah password acc restoran
router.post("/ubahPassword", authToken, (req, res) => {
  const data = {
    passwordLama: req.body.passwordLama,
    passwordBaru: req.body.passwordBaru,
    konfirmasiPasswordBaru: req.body.konfirmasiPasswordBaru,
  };
  const { valid, _errors } = ValidateUpdatePasswordByIdToken(data);
  if (!valid) return res.status(400).json({ error: _errors });
  if (req.user.role != "operator") {
    return res.status(403).json({ error: "Unauthorized" });
  } else {
    con.query(`SELECT * FROM tbrestoran WHERE idRestoran = ${req.user.id}`, (err, result, field) => {
      if (err) {
        console.log("error : ", err);
        return res.status(500).json({ error: err });
      } else if (DecryptPassword(data.passwordLama, result[0].password)) {
        const hashedPassword = HashPassword(data.passwordBaru);
        con.query(`UPDATE tbrestoran SET password = "${hashedPassword}" WHERE idRestoran = ${req.user.id}`, (err, result, field) => {
          if (err) {
            console.log("error : ", err);
            return res.status(500).json({ error: err });
          }
          return res.status(200).json({ data: { message: "Edit password success" } });
        });
      } else {
        return res.status(400).json({
          error: {
            passwordLama: "Password lama salah",
          },
        });
      }
    });
  }
});

// belom di tes walibin
router.get("/image", (req, res) => {
  const data = {
    id: req.body.idRestoran,
  };
  const { valid, _errors } = ValidateId(data);
  if (!valid) {
    return res.status(400).json({ error: _errors });
  } else {
    con.query(`SELECT fotoMenu FROM tbrestoran WHERE idRestoran = ${data.id}`, (err, result, field) => {
      if (err) {
        return res.status(500).json({ error: err });
      } else if (result.length == 0) {
        return res.status(404).json({ error: "data not found" });
      } else {
        return res.status(200).json({ data: "../../../skripsi-api/image/" + result[0].fotoMenu });
      }
    });
  }
});

// hapus akun
router.post("/delete", authToken, (req, res) => {
  const data = {
    idRestoran: req.body.idRestoran,
    password: req.body.password,
  };
  const { valid, _errors } = ValidateDeleteAkun(data);
  if (!valid) return res.status(400).json({ error: _errors });
  if (req.user.id != data.idRestoran) {
    return res.status(403).json({ error: "Unauthorized" });
  } else {
    con.query(`SELECT * FROM tbrestoran WHERE idRestoran = "${data.idRestoran}"`, (err, result, field) => {
      if (err) {
        return res.status(500).json({ error: err });
      } else if (DecryptPassword(data.password, result[0].password)) {
        // cek data transaksi dan detail transaksi
        con.query(`SELECT idTransaksi FROM tbtransaksi WHERE idRestoran = ${req.user.id}`, (err, result, field) => {
          if (err) {
            return res.status(500).json({ error: err });
          } else if (result.length != 0) {
            const DetailTransaksi = result;
            DetailTransaksi.forEach((data) => {
              // delete detail transaksi
              con.query(`DELETE FROM tbdetailtransaksi WHERE idTransaksi = ${data.idTransaksi}`, (err, result, field) => {
                if (err) {
                  return res.status(500).json({ error: err });
                }
              });
              // delete transaksi
              con.query(`DELETE FROM tbtransaksi WHERE idTransaksi = ${data.idTransaksi}`, (err, result, field) => {
                if (err) {
                  return res.status(500).json({ error: err });
                }
              });
            });
          }
          // delete data menu
          con.query(`DELETE FROM tbmenu WHERE idRestoran = ${data.idRestoran}`, (err, result, field) => {
            if (err) {
              return res.status(500).json({ error: err });
            }
            con.query(`SELECT fotoMenu, qrchatbot FROM tbRestoran WHERE idRestoran =${req.user.id}`, (err, result, field) => {
              if (err) {
                return res.status(500).json({ error: err });
              }

              result.forEach((data) => {
                if (data.fotoMenu != null && data.fotoMenu !== "") {
                  fs.unlink(`image/${data.fotoMenu}`, (err) => {
                    if (err) return res.status(400).json({ error: err });
                    con.query(`UPDATE tbrestoran SET fotoMenu = '${data.fotoMenu}' WHERE idRestoran = '${req.user.id}'`, (err, result, field) => {
                      if (err) {
                        return res.status(500).json({ error: err });
                      }
                    });
                  });
                } else if (data.qrchatbot != null && data.qrchatbot !== "") {
                  fs.unlink(`image/${data.qrchatbot}`, (err) => {
                    if (err) return res.status(400).json({ error: err });
                    con.query(`UPDATE tbrestoran SET qrchatbot = '${data.qrchatbot}' WHERE idRestoran = '${req.user.id}'`, (err, result, field) => {
                      if (err) {
                        return res.status(500).json({ error: err });
                      }
                    });
                  });
                }
              });
              // delete akun restoran
              con.query(`DELETE FROM tbrestoran WHERE idRestoran = ${data.idRestoran}`, (err, result, field) => {
                if (err) {
                  return res.status(500).json({ error: err });
                } else {
                  return res.status(200).json({
                    data: {
                      message: "Delete akun success",
                    },
                  });
                }
              });
            });
          });
        });
      } else {
        return res.status(400).json({
          error: {
            password: "Password salah",
          },
        });
      }
    });
  }
});

module.exports = router;
