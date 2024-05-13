const jwt = require("jsonwebtoken");
const users = require("../models").user;

//Verifies Roles
function authRole(user_role) {
  return async (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    tokenData = JSON.parse(atob(token.split(".")[1]));

    const user = await users.findOne({
      where: { id: tokenData.userId, role: user_role },
    });

    if (user) {
      next();
    } else {
      res.status(404).send("You do not have access");
    }
  };
}

//Autheticates token
function authToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) {
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }
    req.user = user;
    next();
  });
}

module.exports = { authToken, authRole };
