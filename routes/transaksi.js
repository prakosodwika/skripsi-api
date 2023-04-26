const express = require("express");
const router = express.Router();
const con = require("../util/config");
const authToken = require("../util/authToken");
const { ValidatePostTransaksi, ValidateId, ValidateStatus, ValidateEditTransaksi } = require("../util/validators");
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

// salah database karena tidak ada iddetailtransaksi
router.post("/getDetailTransaksi", authToken, (req, res) => {
  const data = {
    id: req.body.idTransaksi,
  };
  const { valid, _errors } = ValidateId(data);
  if (!valid) return res.status(400).json({ error: _errors });
  if (req.user.role != "operator") {
    return res.status(403).json({ error: "Unauthorized" });
  } else {
    let total = 0;
    con.query(`SELECT m.nama, dt.qty, dt.harga FROM tbdetailtransaksi dt JOIN tbmenu m ON dt.idMenu = m.idMenu WHERE idTransaksi = "${data.id}";`, (err, result, field) => {
      if (err) {
        return res.status(500).json({ error: err });
      }
      result.forEach((data) => {
        total += data.harga * data.qty;
      });

      return res.status(200).json({ data: result, total: total });
    });
  }
});

// get all transaksi
router.get("/getTransaksi", authToken, (req, res) => {
  if (req.user.role != "operator") {
    return res.status(403).json({ error: "Unauthorized" });
  } else {
    con.query(`SELECT * FROM tbtransaksi WHERE idRestoran = ${req.user.id}`, (err, result, field) => {
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

router.post("/postStatus", authToken, (req, res) => {
  const data = {
    status: "lunas",
    // tanggalbayar
    id: req.body.idTransaksi,
    tanggalBayar: new Date().toISOString().slice(0, 19).replace("T", " "),
  };
  const { valid, _errors } = ValidateStatus(data);
  if (!valid) return res.status(400).json({ error: _errors });
  if (req.user.role != "operator") {
    return res.status(403).json({ error: "Unauthorized" });
  } else {
    con.query(`UPDATE tbtransaksi SET status = '${data.status}', tanggalBayar = '${data.tanggalBayar}' WHERE idTransaksi = '${data.id}'`, (err, result, field) => {
      if (err) {
        return res.status(500).json({ error: err });
      }
      return res.status(200).json({
        data: {
          message: "Update status success",
        },
      });
    });
  }
});

// diskusi dengan waliyin
router.post("/editTransaksi", (req, res) => {
  const data = {
    id: req.body.idTransaksi,
    pesanan: req.body.pesanan,
  };
  const { valid, _errors } = ValidateEditTransaksi(data);
  if (!valid) return res.status(400).json({ errors: _errors });
  con.query(`SELECT * FROM tbtransaksi WHERE idTransaksi = "${data.id}"`, (err, result, field) => {
    if (err) {
      return res.status(500).json({ error: err });
    }
    console.log("result : ", result);
    return res.status(200).json({ message: "success" });
  });
});

// post pesanan
router.post("/pesan", (req, res) => {
  const data = {
    username: req.body.username,
    nomorMeja: req.body.nomorMeja,
    tanggalBuat: new Date().toISOString().slice(0, 19).replace("T", " "),
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
          con.query(`INSERT INTO tbtransaksi (username, nomorMeja, tanggalBuat, status, idRestoran) VALUES ('${data.username}','${data.nomorMeja}', '${data.tanggalBuat}', '${data.status}','${idRestoran}')`, (err, result, field) => {
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

module.exports = router;
