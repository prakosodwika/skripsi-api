const jwt = require("jsonwebtoken");

// pemisahan token admin dan restran agar admin tidak mengedit data menu dari restoran dan restoran tidak dapat mengedit data pettren
authToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.status(401).json({ error: "Invalid token" });

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Forbidden token" });
    req.user = user;
    next();
  });
};

module.exports = authToken;
