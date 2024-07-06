const express = require('express');
const { getUserDetails } = require('../controllers/userController');
const authenticateJWT = require('../middleware/auth');

const router = express.Router();

router.get('/users/:id', authenticateJWT, getUserDetails);

module.exports = router;
