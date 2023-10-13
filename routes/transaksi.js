const express = require("express");
const router = express.Router();
const con = require("../util/config");
const authToken = require("../util/authToken");
const { ValidatePostTransaksi, ValidateId, ValidateStatus, ValidateEditTransaksi, ValidateCancelTransaksi, ValidatePostPesanan, ValidatePostMenuPesanan } = require("../util/validators");
const { restart } = require("nodemon");

// router.get("/getTransaksi", authToken, (req, res) => {
//   if (req.user.role != "operator") {
//     return res.status(403).json({ error: "Unauthorized" });
//   } else {
//     con.query(`SELECT * FROM tbtransaksi WHERE idRestoran = "${req.user.id}"`, (err, result, field) => {
//       if (err) {
//         return res.status(200).json({ error: err });
//       }
//       return res.status(200).json({ data: result });
//     });
//   }
// });

// getDetailTransaksi
router.post("/getDetailTransaksi", (req, res) => {
  const data = {
    id: req.body.idTransaksi,
  };
  const { valid, _errors } = ValidateId(data);
  if (!valid) return res.status(400).json({ error: _errors });
  let total = 0;
  con.query(`SELECT m.idMenu, m.nama, dt.qty, dt.harga, dt.qty*dt.harga as subHarga  FROM tbdetailtransaksi dt JOIN tbmenu m ON dt.idMenu = m.idMenu WHERE idTransaksi = "${data.id}";`, (err, result, field) => {
    if (err) {
      return res.status(500).json({ error: err });
    }
    result.forEach((data) => {
      total += data.harga * data.qty;
    });

    return res.status(200).json({ data: result, total: total });
  });
});

// get all transaksi
router.get("/getTransaksi", authToken, (req, res) => {
  if (req.user.role != "operator") {
    return res.status(403).json({ error: "Unauthorized" });
  } else {
    con.query(`SELECT * FROM tbtransaksi WHERE idRestoran = ${req.user.id} ORDER BY tanggalBuat DESC `, (err, result, field) => {
      if (err) {
        console.log("error : ", err);
        return res.status(500).json({ error: err });
      } else if (result.length == 0) {
        return res.status(404).json({ error: "data not found" });
      }
      return res.status(200).json({ data: result });
    });
  }
});

// post transaksi 1 1
router.post("/postTransaksi", (req, res) => {
  const data = {
    username: req.body.username,
    nomorMeja: req.body.nomorMeja,
    status: "belum bayar",
    idRestoran: req.body.idRestoran,
  };
  const { valid, _errors } = ValidatePostPesanan(data);
  if (!valid) {
    return res.status(400).json({ error: _errors });
  } else {
    con.query(`INSERT INTO tbtransaksi (username, nomorMeja, tanggalBuat, status, idRestoran) VALUES ('${data.username}','${data.nomorMeja}', now() , '${data.status}','${data.idRestoran}')`, (err, result, field) => {
      if (err) {
        return res.status(500).json({ error: err });
      }
      return res.status(200).json({ data: { idTransaksi: result.insertId } });
    });
  }
});

// post pesanan
router.post("/postPesanan", (req, res) => {
  const data = {
    idTransaksi: req.body.idTransaksi,
    idMenu: req.body.idMenu,
    qty: req.body.qty,
  };
  const { valid, _errors } = ValidatePostMenuPesanan(data);
  if (!valid) return res.status(400).json({ error: _errors });
  con.query(`SELECT harga FROM tbmenu WHERE idMenu = ${data.idMenu}`, (err, result, field) => {
    if (err) {
      return res.status(500).json({ error: err });
    } else if (result.length == 0) {
      return res.status(404).json({ error: "data not found" });
    } else {
      const harga = result[0].harga;
      con.query(`INSERT INTO tbdetailtransaksi (idTransaksi, idMenu, qty, harga) VALUE ('${data.idTransaksi}','${data.idMenu}','${data.qty}','${harga}')`, (err, result, field) => {
        if (err) {
          return res.status(500).json({ error: err });
        }
        return res.status(200).json({
          data: {
            message: "upload success",
          },
        });
      });
    }
  });
});

// belom di tes balibur
router.post("/editPesanan", (req, res) => {
  const data = {
    idTransaksi: req.body.idTransaksi,
    idDetailTransaksi: req.body.idDetailTransaksi,
    idMenu: req.body.idMenu,
    qty: req.body.qty,
  };
  const { valid, _errors } = ValidateEditTransaksi(data);
  if (!valid) return res.status(400).json({ error: _errors });
  con.query(`SELECT * FROM tbmenu WHERE idMenu = ${data.idMenu}`, (err, result, field) => {
    if (err) {
      return res.status(500).json({ error: err });
    } else if (result.length == 0) {
      console.log("result : ", result);
      return res.status(404).json({ error: "data not found" });
    } else {
      const harga = result[0].harga;
      con.query(`UPDATE tbdetailtransaksi SET idMenu = ${data.idMenu} , qty = ${data.qty} , harga = ${harga} WHERE idTransaksi = ${data.idTransaksi} AND idDetailTransaksi = ${data.idDetailTransaksi}`, (err, result, field) => {
        if (err) {
          return res.status(500).json({ error: err });
        } else if (result.length == 0) {
          console.log("result : ", result);
          return res.status(404).json({ error: "data tidak ada" });
        } else {
          return res.status(200).json({
            data: {
              message: "Update detail transaksi success ",
            },
          });
        }
      });
    }
  });
});

router.post("/postStatus", authToken, (req, res) => {
  const data = {
    id: req.body.idTransaksi,
    status: "lunas",
  };
  const { valid, _errors } = ValidateStatus(data);
  if (!valid) return res.status(400).json({ error: _errors });

  con.query(`UPDATE tbtransaksi SET status = '${data.status}' , tanggalBayar = now() WHERE idTransaksi = ${data.id}`, (err, result, field) => {
    if (err) {
      return res.status(500).json({ error: err });
    } else {
      return res.status(200).json({
        data: {
          message: "Update status success ",
        },
      });
    }
  });
});

// post pesanan
router.post("/pesan", (req, res) => {
  const data = {
    username: req.body.username,
    nomorMeja: req.body.nomorMeja,
    status: "belum bayar",
    namaRestoran: req.body.namaRestoran,
    pesanan: req.body.pesanan,
  };

  const { valid, _errors } = ValidatePostTransaksi(data);
  if (!valid) return res.status(400).json({ error: _errors });
  con.query(`SELECT idRestoran FROM tbrestoran WHERE nama = '${data.namaRestoran}'`, (err, result, field) => {
    if (err) {
      return res.status(500).json({ error: err });
    } else if (result.length == 0) {
      return res.status(404).json({ error: "data not found" });
    } else if (result.length > 1) {
      return res.status(400).json({ error: "nama restoran kurang detail" });
    } else {
      const idRestoran = result[0].idRestoran;
      const pesanan = [];
      const namaMenu = [];
      const qty = [];
      data.pesanan.forEach((menu) => {
        pesanan.push([menu[0], idRestoran]);
        namaMenu.push(menu[0]);
        qty.push(menu[1]);
      });
      con.query(`SELECT idMenu, harga FROM tbmenu WHERE (nama, idRestoran) IN (?) ORDER BY FIELD(nama, ?) `, [pesanan, namaMenu], (err, result, field) => {
        const dataMenu = result;
        // data post detail transaksi
        const detailPesanan = [];
        if (err) {
          return res.status(500).json({ error: err });
        } else if (result.length == 0) {
          return res.status(404).json({ error: "data not found" });
        } else if (result.length != pesanan.length) {
          return res.status(400).json({ error: "ada typo dalam menu" });
        } else {
          dataMenu.forEach((menu, index) => {
            menu.qty = qty[index];
            detailPesanan.push(Object.values(menu));
          });
          // insert and get idTransaksi
          con.query(`INSERT INTO tbtransaksi (username, nomorMeja, tanggalBuat, status, idRestoran) VALUES ('${data.username}','${data.nomorMeja}', now(), '${data.status}','${idRestoran}')`, (err, result, field) => {
            if (err) {
              return res.status(500).json({ error: err });
            } else {
              const idDetail = result.insertId;
              detailPesanan.forEach((detail) => {
                detail.unshift(idDetail);
              });
              con.query(`INSERT INTO tbdetailtransaksi (idTransaksi, idMenu, harga, qty) VALUE ?`, [detailPesanan], (err, result, field) => {
                if (err) {
                  return res.status(500).json({ error: err });
                } else {
                  return res.status(200).json({
                    data: {
                      message: "pemesanan success",
                    },
                  });
                }
              });
            }
          });
        }
      });
    }
  });
});

// cancel
router.post("/cancel", (req, res) => {
  const data = {
    idTransaksi: req.body.idTransaksi,
    username: req.body.username,
  };
  const { valid, _errors } = ValidateCancelTransaksi(data);
  if (!valid) return res.status(400).json({ error: _errors });
  con.query(`SELECT status FROM tbtransaksi WHERE idTransaksi = ${data.idTransaksi} AND username = '${data.username}'`, (err, result, field) => {
    if (err) {
      return res.status(500).json({ error: err });
    } else if (result.length == 0) {
      return res.status(404).json({ error: "data not found" });
    } else if (result[0].status == "lunas") {
      return res.status(200).json({ data: { message: "pesanan tidak bisa di cancel" } });
    } else {
      con.query(`SELECT idDetailTransaksi FROM tbdetailtransaksi WHERE idTransaksi = ${data.idTransaksi}`, (err, result, field) => {
        if (err) {
          return res.status(500).json({ error: err });
        } else if (result.length == 0) {
          con.query(`DELETE FROM tbtransaksi WHERE idTransaksi = ${data.idTransaksi}`, (err, result, field) => {
            if (err) {
              return res.status(500).json({ error: err });
            } else if (result.affectedRows == 0) {
              return res.status(404).json({ error: "data not found" });
            } else {
              return res.status(200).json({ data: { message: "Delete success" } });
            }
          });
        } else {
          const DetailTransaksi = result;
          DetailTransaksi.forEach((idDetailTransaksi) => {
            con.query(`DELETE FROM tbdetailtransaksi WHERE idDetailTransaksi = ${idDetailTransaksi.idDetailTransaksi}`, (err, result, field) => {
              if (err) {
                return res.status(500).json({ error: err });
              }
            });
          });
          con.query(`DELETE FROM tbtransaksi WHERE idTransaksi = ${data.idTransaksi}`, (err, result, field) => {
            if (err) {
              return res.status(500).json({ error: err });
            } else if (result.affectedRows == 0) {
              return res.status(404).json({ error: "data not found" });
            } else {
              return res.status(200).json({
                data: {
                  message: "Delete success",
                },
              });
            }
          });
        }
      });
    }
  });
});

module.exports = router;
