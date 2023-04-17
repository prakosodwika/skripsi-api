const bcrypt = require("bcrypt");
const saltRounds = 10;

// mengubah password
HashPassword = (plainPassword) => {
  return bcrypt.hashSync(plainPassword, saltRounds);
};

// membaca password
DecryptPassword = (plainPassword, hashFromDB) => {
  return bcrypt.compareSync(plainPassword, hashFromDB);
};

module.exports = { HashPassword, DecryptPassword };
