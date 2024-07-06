const User = require('../models/User');

const getUserDetails = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findOne({ userId }).select('-password');
    if (!user) {
      return res.status(404).send({
        status: 'Not Found',
        message: 'User not found',
        statusCode: 404
      });
    }
    res.status(200).send({
      status: 'success',
      message: 'User details retrieved successfully',
      data: user
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({
      status: 'error',
      message: 'Server error',
      statusCode: 500
    });
  }
};

module.exports = { getUserDetails };
