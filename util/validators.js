const { error } = require("firebase-functions/logger");

const isEmpty = (data) => {
  if (typeof data !== "string") return true;
  if (data.trim() === "") return true;
  else return false;
};

const isEmail = (data) => {
  const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(data);
};

const isNumber = (data) => {
  return typeof data == "number";
};

ValidateRegistrasiLoginAdmin = (data) => {
  let _errors = {};
  if (isEmpty(data.nama)) _errors.nama = "Nama tidak boleh kosong";
  if (isEmpty(data.password)) _errors.password = "Password tidak boleh kosong";
  return {
    _errors,
    valid: Object.keys(_errors).length === 0 ? true : false,
  };
};

ValidateRegistrasi = (data) => {
  let _errors = {};
  if (isEmpty(data.nama)) _errors.nama = "Nama tidak boleh kosong";
  if (!isEmail(data.email)) _errors.email = "Email tidak boleh kosong / format salah";
  // salah string tapi pingin ada +62 nya
  if (isEmpty(data.nomorTelepon)) _errors.nomorTelepon = "Nomor tidak boleh Telepon kosong";
  if (isEmpty(data.alamat)) _errors.alamat = "Alamat tidak boleh kosong";
  if (isEmpty(data.password)) _errors.password = "Password tidak boleh kosong";
  if (data.password != data.konfirmasiPassword) _errors.konfirmasiPassword = "Password tidak sama";
  if (!isNumber(data.jumlahMeja)) _errors.jumlahMeja = "Jumlah meja harus angka";
  return {
    _errors,
    valid: Object.keys(_errors).length === 0 ? true : false,
  };
};

ValidateLogin = (data) => {
  let _errors = {};
  if (!isEmail(data.email)) _errors.email = "Email tidak boleh kosong / format salah";
  if (isEmpty(data.password)) _errors.password = "Password tidak boleh kosong";
  return {
    _errors,
    valid: Object.keys(_errors).length === 0 ? true : false,
  };
};

ValidateUpdateRestoranByIdToken = (data) => {
  let _errors = {};
  if (isEmpty(data.nama)) _errors.nama = "Nama tidak boleh kosong";
  if (!isEmail(data.email)) _errors.email = "Format email salah";
  if (isEmpty(data.alamat)) _errors.alamat = "Alamat tidak boleh kosong";
  if (isEmpty(data.nomorTelepon)) _errors.nomorTelepon = "Nomor telepon tidak boleh kosong";
  if (!isNumber(data.jumlahMeja)) _errors.jumlahMeja = "Jumlah meja harus angka";

  return {
    _errors,
    valid: Object.keys(_errors).length === 0 ? true : false,
  };
};

ValidatePostMenuRestoranByIdToken = (data) => {
  let _errors = {};
  if (isEmpty(data.nama)) _errors.nama = "Nama tidak boleh kosong";
  if (!(data.tipe == "makanan" || data.tipe == "minuman")) _errors.tipe = "Tipe harus makanan / minuman";
  if (!isNumber(data.harga)) _errors.harga = "Harga harus angka";
  return {
    _errors,
    valid: Object.keys(_errors).length === 0 ? true : false,
  };
};

ValidateUpdateMenuRestoranByIdToken = (data) => {
  let _errors = {};
  if (isEmpty(data.nama)) _errors.nama = "Nama tidak boleh kosong";
  if (!(data.tipe == "makanan" || data.tipe == "minuman")) _errors.tipe = "Tipe harus makanan / minuman";
  if (!isNumber(data.harga)) _errors.harga = "Harga harus angka";
  if (!isNumber(data.idMenu)) _errors.idMenu = "Id menu harus terisi dan angka";
  return {
    _errors,
    valid: Object.keys(_errors).length === 0 ? true : false,
  };
};

ValidateId = (data) => {
  let _errors = {};
  if (!isNumber(data.id)) _errors.id = "Id harus terisi dan angka";
  return {
    _errors,
    valid: Object.keys(_errors).length === 0 ? true : false,
  };
};

ValidateUpdatePasswordByIdToken = (data) => {
  let _errors = {};
  if (isEmpty(data.passwordLama)) _errors.passwordLama = "Password lama tidak boleh kosong";
  if (isEmpty(data.passwordBaru)) _errors.passwordBaru = "Password baru tidak boleh kosong";
  if (data.passwordBaru != data.konfirmasiPasswordBaru) _errors.konfirmasiPasswordBaru = "Harus sama dengan password baru";
  return {
    _errors,
    valid: Object.keys(_errors).length === 0 ? true : false,
  };
};

ValidateTag = (data) => {
  let _errors = {};
  if (isEmpty(data.tag)) _errors.tag = "Tag tidak boleh kosong";
  return {
    _errors,
    valid: Object.keys(_errors).length === 0 ? true : false,
  };
};

ValidatePostPatternsResponse = (data) => {
  let _errors = {};
  if (isEmpty(data.pesan)) _errors.pesan = "Pesan harus tidak boleh kosong";
  if (isEmpty(data.tag)) _errors.tag = "Tag harus tidak boleh kosong";
  if (!(data.tipe == "patterns" || data.tipe == "response")) _errors.tipe = "Tipe harus patterns atau response";
  return {
    _errors,
    valid: Object.keys(_errors).length === 0 ? true : false,
  };
};

ValidateDeletePatternsRasponse = (data) => {
  let _errors = {};
  if (!isNumber(data.idDetailPatterns)) _errors.idDetailPatterns = "Id harus terisi dan angka";
  if (!isNumber(data.idPatterns)) _errors.idPatterns = "Id harus terisi dan angka";
  return {
    _errors,
    valid: Object.keys(_errors).length === 0 ? true : false,
  };
};

ValidateStatus = (data) => {
  let _errors = {};
  if (isEmpty(data.status)) _errors.status = "Status harus terisi";
  if (!isNumber(data.id)) _errors.id = "Id harus terisi dan angka";
  return {
    _errors,
    valid: Object.keys(_errors).length === 0 ? true : false,
  };
};

ValidatePostTransaksi = (data) => {
  let _errors = {};
  if (isEmpty(data.username)) _errors.username = "Username harus terisi";
  if (!isNumber(data.nomorMeja)) _errors.nomorMeja = "Nomor meja harus angka";
  if (isEmpty(data.namaRestoran)) _errors.namaRestoran = "Nama restoran tidak boleh kosong";
  if (!Array.isArray(data.pesanan) || data.pesanan.length == 0) _errors.pesanan = "harus terisi dan array";
  return {
    _errors,
    valid: Object.keys(_errors).length === 0 ? true : false,
  };
};

ValidatePesanan = (data) => {
  let _errors = {};
  if (isEmpty(data.nama)) _errors.nama = "nama pesanan tidak boleh kosong dan harus di array 0";
  if (!isNumber(data.qty)) _errors.qty = "qty harus angka dan di array 1";
  return {
    _errors,
    valid: Object.keys(_errors).length === 0 ? true : false,
  };
};

ValidateEditTransaksi = (data) => {
  let _errors = {};
  if (!isNumber(data.id)) _errors.id = "Id harus terisi dan angka";
  if (!Array.isArray(data.pesanan) || data.pesanan.length == 0) _errors.pesanan = "harus terisi dan array";
  return {
    _errors,
    valid: Object.keys(_errors).length === 0 ? true : false,
  };
};

ValidateUpdateTag = (data) => {
  let _errors = {};
  if (!isNumber(data.id)) _errors.id = "Id tidak kosong & angka";
  if (isEmpty(data.tag)) _errors.tag = "Tag tidak boleh kosong";
  return {
    _errors,
    valid: Object.keys(_errors).length === 0 ? true : false,
  };
};

ValidateUpdatePatternsResponse = (data) => {
  let _errors = {};
  if (!isNumber(data.id)) _errors.id = "Id tidak kosong & angka";
  if (isEmpty(data.tipe)) _errors.tipe = "Tipe tidak boleh kosong";
  if (isEmpty(data.pesan)) _errors.pesan = "Pesan tidak boleh kosong";
  return {
    _errors,
    valid: Object.keys(_errors).length === 0 ? true : false,
  };
};

module.exports = {
  ValidateLogin,
  ValidateRegistrasi,
  ValidateRegistrasiLoginAdmin,
  ValidateUpdateRestoranByIdToken,
  ValidatePostMenuRestoranByIdToken,
  ValidateUpdateMenuRestoranByIdToken,
  ValidateId,
  ValidateUpdatePasswordByIdToken,
  ValidateTag,
  ValidatePostPatternsResponse,
  ValidateDeletePatternsRasponse,
  ValidateStatus,
  ValidatePostTransaksi,
  ValidateEditTransaksi,
  ValidateUpdateTag,
  ValidateUpdatePatternsResponse,
  ValidatePesanan,
};
