require("dotenv").config();
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var restoran = require("./routes/restoran");
var menu = require("./routes/menu");
// var con = require("./util/config")
var admin = require("./routes/admin");
var qr = require("./routes/qr");
var patterns = require("./routes/patterns");
var transaksi = require("./routes/transaksi");
var common = require("./routes/common");

var app = express();
app.use(cors({ origin: "*" }));

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/restoran", restoran);
app.use("/menu", menu);
// app.use("/con", con);
app.use("/admin", admin);
app.use("/qr", qr);
app.use("/patterns", patterns);
app.use("/transaksi", transaksi);
app.use("/common", common);

module.exports = app;
