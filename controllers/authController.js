const User = require('../models/User');
const Organisation = require('../models/Organisation');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone } = req.body;

    // Check for missing fields
    if (!firstName || !lastName || !email || !password) {
      return res.status(422).send({
        errors: [
          { field: "firstName", message: "First name is required" },
          { field: "lastName", message: "Last name is required" },
          { field: "email", message: "Email is required" },
          { field: "password", message: "Password is required" }
        ]
      });
    }

    const userId = uuidv4();
    const newUser = new User({
      userId, firstName, lastName, email, password, phone
    });

    await newUser.save();

    const orgId = uuidv4();
    const orgName = `${firstName}'s Organisation`;
    const newOrganisation = new Organisation({
      orgId, name: orgName, description: '', users: [newUser._id]
    });

    await newOrganisation.save();

    const token = jwt.sign({ userId: newUser.userId, email: newUser.email }, 'your_jwt_secret', { expiresIn: '1h' });

    res.status(201).send({
      status: 'success',
      message: 'Registration successful',
      data: {
        accessToken: token,
        user: {
          userId: newUser.userId,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          email: newUser.email,
          phone: newUser.phone,
        }
      }
    });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      // Duplicate key error
      const field = Object.keys(err.keyPattern)[0];
      res.status(422).send({
        errors: [
          { field, message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists` }
        ]
      });
    } else {
      res.status(400).send({
        status: 'Bad request',
        message: 'Registration unsuccessful',
        statusCode: 400
      });
    }
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).send({
        status: 'Bad request',
        message: 'Authentication failed',
        statusCode: 401
      });
    }

    const token = jwt.sign({ userId: user.userId, email: user.email }, 'your_jwt_secret', { expiresIn: '1h' });

    res.status(200).send({
      status: 'success',
      message: 'Login successful',
      data: {
        accessToken: token,
        user: {
          userId: user.userId,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
        }
      }
    });
  } catch (err) {
    console.error(err);
    res.status(400).send({
      status: 'Bad request',
      message: 'Authentication failed',
      statusCode: 401
    });
  }
};

module.exports = { register, login };
