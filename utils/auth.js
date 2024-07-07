const jwt = require('jsonwebtoken');

const generateToken = (user, expiresIn = '1h') => {
  const payload = {
    userId: user.userId,
    email: user.email
  };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

module.exports = { generateToken };
