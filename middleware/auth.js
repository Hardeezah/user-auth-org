const jwt = require('jsonwebtoken');
const { User } = require('../models');

module.exports = async (req, res, next) => {
  const token = req.header('Authorization').replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({
      status: 'error',
      message: 'Access denied. No token provided.',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    const user = await User.findOne({ where: { userId: decoded.userId } });
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid token.',
      });
    }
    next();
  } catch (err) {
    console.error(err);
    return res.status(400).json({
      status: 'error',
      message: 'Invalid token.',
    });
  }
};
