const jwt = require('jsonwebtoken');

exports.generateToken = (user, expiresIn = '1h') => {
  return jwt.sign(
    {
      userId: user.userId,
      email: user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn }
  );
};
