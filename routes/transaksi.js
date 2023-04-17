const express = require("express");
const router = express.Router();
const con = require("../util/config");
const authToken = require("../util/authToken");
const { ValidatePostTransaksi, ValidateId, ValidateStatus, ValidateEditTransaksi, ValidatePesanan } = require("../util/validators");
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

// ulang
// router.post("/postTransaksi", async (req, res) => {
//   try {
//     const data = {
//       username: req.body.username,
//       nomorMeja: req.body.nomorMeja,
//       namaRestoran: req.body.namaRestoran,
//       tanggalBuat: new Date().toISOString().slice(0, 19).replace("T", " "),
//       status: "belum terbayar",
//       pesanan: req.body.pesanan,
//     };
//     const { valid, _errors } = await ValidatePostTransaksi(data);
//     if (!valid) return res.status(400).json({ error: _errors });
//     let pesanan = [];
//     await data.pesanan.forEach((pesan) => {
//       const dataPesanan = {
//         nama: pesan[0],
//         qty: pesan[1],
//       };
//       const { valid, _errors } = ValidatePesanan(data);
//       if (!valid) return res.status(400).json({ _errors });
//       con.query(`SELECT * FROM tbmenu WHERE nama = '${dataPesanan.nama}'`, (err, result) => {
//         if (err) {
//           return res.status(500).json({ error: err });
//         }
//         pesanan.push({
//           idMenu: result.idMenu,
//           idMenu: result.idMenu,
//           idMenu: result.idMenu,
//         });
//       });
//     });
//     return res.status(200).json({ message: "oke" });
//   } catch (error) {
//     console.log(error);
//   }
// });

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

module.exports = router;
