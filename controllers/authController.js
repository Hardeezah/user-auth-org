const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Organisation } = require('../models');
const { v4: uuidv4 } = require('uuid');  // Importing the uuid package

const generateToken = (user) => {
  return jwt.sign({ userId: user.userId, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: '1h'
  });
};

const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(422).json({
        errors: [
          { field: "firstName", message: "First name is required" },
          { field: "lastName", message: "Last name is required" },
          { field: "email", message: "Email is required" },
          { field: "password", message: "Password is required" }
        ]
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      userId: uuidv4(),  // Generating a unique user ID
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone
    });

    const organisation = await Organisation.create({
      orgId: uuidv4(),  // Generating a unique organisation ID
      name: `${firstName}'s Organisation`,
      description: `Organisation for ${firstName}`
    });

    await user.addOrganisation(organisation);

    const token = generateToken(user);

    res.status(201).json({
      status: 'success',
      message: 'Registration successful',
      data: {
        accessToken: token,
        user: {
          userId: user.userId,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone
        }
      }
    });
  } catch (error) {
    console.error('Error during registration:', error);  // Enhanced error logging
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      details: error.message  // Include error details in the response
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({
        status: 'Bad request',
        message: 'Authentication failed',
        statusCode: 401
      });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({
        status: 'Bad request',
        message: 'Authentication failed',
        statusCode: 401
      });
    }

    const token = generateToken(user);

    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        accessToken: token,
        user: {
          userId: user.userId,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone
        }
      }
    });
  } catch (error) {
    console.error('Error during login:', error);  // Enhanced error logging
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      details: error.message  // Include error details in the response
    });
  }
};

module.exports = {
  register,
  login
};
