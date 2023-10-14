const express = require("express");
const router = express.Router();
const con = require("../util/config");
const authToken = require("../util/authToken");
const { ValidateTag, ValidatePostPatternsResponse, ValidateDeletePatternsRasponse, ValidateId, ValidateUpdateTag, ValidateUpdatePatternsResponse } = require("../util/validators");

router.post("/postTag", authToken, (req, res) => {
  const data = {
    tag: req.body.tag,
  };
  const { valid, _errors } = ValidateTag(data);
  if (!valid) return res.status(400).json({ error: _errors });
  if (req.user.role != "admin") {
    return res.status(403).json({ error: "Unauthorized" });
  } else {
    con.query(`INSERT INTO tbpatterns (tag) VALUE ('${data.tag}')`, (err, result, field) => {
      if (err) {
        console.log("error : ", err);
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

router.post("/postPatternsResponse", authToken, (req, res) => {
  const data = {
    pesan: req.body.pesan,
    tag: req.body.tag,
    tipe: req.body.tipe,
  };
  const { valid, _errors } = ValidatePostPatternsResponse(data);
  if (!valid) return res.status(400).json({ error: _errors });
  if (req.user.role != "admin") {
    return res.status(403).json({ error: "Unauthorized" });
  } else {
    con.query(`SELECT idPatterns  FROM tbpatterns WHERE tag = '${data.tag}'`, (err, result, field) => {
      if (err) {
        console.log("error : ", err);
        return res.status(500).json({ error: err });
      }
      const idPatterns = result[0].idPatterns;
      con.query(`INSERT INTO tbdetailpatterns (pesan, tipe, idPatterns) VALUE ('${data.pesan}', '${data.tipe}', '${idPatterns}')`, (err, result, field) => {
        if (err) {
          console.log("error : ", err);
          return res.status(500).json({ error: err });
        }
        return res.status(200).json({
          data: {
            message: "Upload Success",
          },
        });
      });
    });
  }
});

// get tag
router.get("/getTag", authToken, (req, res) => {
  if (req.user.role != "admin") {
    return res.status(403).json({ error: "Unauthorized" });
  } else {
    con.query(`SELECT tag FROM tbpatterns`, (err, result, field) => {
      if (err) {
        console.log("error : ", err);
        return res.status(500).json({ error: err });
      } else if (result.length == 0) {
        return res.status(404).json({ error: "data not found" });
      } else {
        return res.status(200).json({
          data: result,
        });
      }
    });
  }
});

// get response and patterns
router.post("/getPatternsResponse", authToken, (req, res) => {
  const data = {
    tag: req.body.tag,
  };
  const { valid, _errors } = ValidateTag(data);
  if (!valid) return res.status(400).json({ error: _errors });
  if (req.user.role != "admin") {
    return res.status(403).json({ error: "Unauthorized" });
  } else {
    con.query(`SELECT idPatterns FROM tbpatterns WHERE tag = "${data.tag}"`, (err, result, field) => {
      if (err) {
        console.log("error : ", err);
        return res.status(500).json({ error: err });
      }
      const idPatterns = result[0].idPatterns;
      con.query(`SELECT idDetailPatterns, pesan, tipe FROM tbDetailPatterns WHERE idPatterns = '${idPatterns}'`, (err, result, field) => {
        if (err) {
          console.log("error : ", err);
          return res.status(500).json({ error: err });
        }
        return res.status(200).json({ data: result });
      });
    });
  }
});

// get petterns
router.get("/getDetailTag", authToken, (req, res) => {
  let data = [];
  con.query(`SELECT * FROM tbpatterns `, (err, result, field) => {
    if (err) {
      return res.status(500).json({ error: err });
    }
    const tag = result;
    con.query(`SELECT * FROM tbdetailpatterns`, (err, result, field) => {
      if (err) {
        return res.status(500).json({ error: err });
      }
      const patterns = result;

      tag.forEach((tag) => {
        let dataPatterns = [];
        let dataResponse = [];
        patterns.forEach((patterns) => {
          if (tag.idPatterns == patterns.idPatterns) {
            // petterns harus diganti
            if (patterns.tipe == "patterns") {
              dataPatterns.push({ idDetailPatterns: patterns.idDetailPatterns, pesan: patterns.pesan, tipe: patterns.tipe });
            } else if (patterns.tipe == "response") {
              dataResponse.push({ idDetailPatterns: patterns.idDetailPatterns, pesan: patterns.pesan, tipe: patterns.tipe });
            }
          }
        });
        data.push({
          tag: tag,
          patterns: dataPatterns,
          response: dataResponse,
        });
      });
      return res.status(200).json({ data });
    });
  });
});

// get intents by idRestoran
router.post("/intents", (req, res) => {
  const data = {
    id: req.body.idRestoran,
  };
  const { valid, _errors } = ValidateId(data);
  if (!valid) return res.status(400).json({ error: _errors });
  let intents = [
    // ini langsung error fix
    // {
    //   tag: 'error',
    //   patterns: [
    //     'gatau'
    //   ],
    //   response_error: [
    //     'maaf',
    //     'ini error'
    //   ]
    // }
  ];
  con.query(`SELECT * FROM tbpatterns `, (err, result, field) => {
    if (err) {
      return res.status(500).json({ error: err });
    }
    const tag = result;
    con.query(`SELECT * FROM tbdetailpatterns`, (err, result, field) => {
      if (err) {
        return res.status(500).json({ error: err });
      }
      const patterns = result;

      tag.forEach((tag) => {
        let dataPatterns = [];
        let dataResponse = [];
        patterns.forEach((patterns) => {
          if (tag.idPatterns == patterns.idPatterns) {
            // petterns harus diganti
            if (patterns.tipe == "patterns") {
              dataPatterns.push(patterns.pesan);
            } else if (patterns.tipe == "response") {
              dataResponse.push(patterns.pesan);
            }
          }
        });
        intents.push({
          tag: tag.tag,
          patterns: dataPatterns,
          response: dataResponse,
        });
      });

      con.query(`SELECT * FROM tbmenu WHERE idRestoran = ${data.id}`, (err, result, field) => {
        if (err) {
          return res.status(500).json({ error: err });
        }
        const namaMenu = [];
        const menus = result;

        menus.forEach((menu) => {
          namaMenu.push(menu.nama);
        });
        intents.push({
          tag: "menu",
          patterns: namaMenu,
          response: ["Menu itu ada ya kak. Silahkan dipesan"],
        });
        return res.status(200).json({ intents });
      });
    });
  });
});

router.post("/deletePatternsRasponse", authToken, (req, res) => {
  const data = {
    idDetailPatterns: req.body.idDetailPatterns,
    idPatterns: req.body.idPatterns,
  };
  const { valid, _errors } = ValidateDeletePatternsRasponse(data);
  if (!valid) return res.status(400).json({ error: _errors });
  if (req.user.role != "admin") {
    return res.status(403).json({ error: "Unauthotized" });
  } else {
    con.query(`DELETE FROM tbdetailpatterns WHERE idDetailPatterns = '${data.idDetailPatterns}' AND idPatterns = '${data.idPatterns}';`, (err, result, field) => {
      if (err) {
        console.log("error : ", err);
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

router.post("/deleteTag", authToken, (req, res) => {
  const data = {
    id: req.body.idPatterns,
  };
  const { valid, _errors } = ValidateId(data);
  if (!valid) return res.status(400).json({ error: _errors });
  if (req.user.role != "admin") {
    return res.status(403).json({ error: "Unauthorized" });
  } else {
    con.query(`SELECT idDetailPatterns FROM tbdetailpatterns WHERE idPatterns = ${data.id}`, (err, result, field) => {
      if (err) {
        console.log("error : ", err);
        return res.status(500).json({ error: err });
      } else if (result.length == 0) {
        // jika tidak memiliki detail patterns
        con.query(`DELETE FROM tbpatterns WHERE idPatterns = ${data.id}`, (err, result, field) => {
          if (err) {
            console.log("error 2 : ", err);
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
      } else {
        // get id detail untuk delete
        const DetailPatterns = result;
        DetailPatterns.forEach((idDetailPatterns) => {
          con.query(`DELETE FROM tbdetailpatterns WHERE idDetailPatterns = ${idDetailPatterns.idDetailPatterns}`, (err) => {
            if (err) {
              console.log("error 2 : ", err);
              return res.status(500).json({ error: err });
            }
          });
        });
        con.query(`DELETE FROM tbpatterns WHERE idPatterns = ${data.id}`, (err, result, field) => {
          if (err) {
            console.log("error 2 : ", err);
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

router.post("/updateTag", authToken, (req, res) => {
  const data = {
    tag: req.body.tag,
    id: req.body.idPatterns,
  };
  const { valid, _errors } = ValidateUpdateTag(data);
  if (!valid) return res.status(400).json({ error: _errors });
  if (req.user.role != "admin") {
    return res.status(403).json({ error: "Unauthorized" });
  } else {
    con.query(`UPDATE tbpatterns SET tag = '${data.tag}' WHERE idPatterns = ${data.id}`, (err, result, field) => {
      if (err) {
        console.log("error : ", err);
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

router.post("/updatePatternsResponse", authToken, (req, res) => {
  const data = {
    id: req.body.idDetailPatterns,
    tipe: req.body.tipe,
    pesan: req.body.pesan,
  };
  const { valid, _errors } = ValidateUpdatePatternsResponse(data);
  if (!valid) return res.status(400).json({ error: _errors });
  if (req.user.role != "admin") {
    return res.status(403).json({ error: "Unauthorized" });
  } else {
    con.query(`UPDATE tbDetailpatterns SET tipe = '${data.tipe}',pesan = '${data.pesan}' WHERE idDetailPatterns = ${data.id}`, (err, result, field) => {
      if (err) {
        console.log("error : ", err);
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

module.exports = router;
