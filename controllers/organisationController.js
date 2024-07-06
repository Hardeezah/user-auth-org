const Organisation = require('../models/Organisation');
const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');

const getUserOrganisations = async (req, res) => {
  try {
    const userId = req.user.userId;
    console.log(`Fetching organisations for user ID: ${userId}`); // Log the user ID

    const organisations = await Organisation.find({ users: userId });
    console.log(`Found organisations: ${JSON.stringify(organisations)}`); // Log the organisations

    res.status(200).send({
      status: 'success',
      message: 'Organisations retrieved successfully',
      data: { organisations }
    });
  } catch (err) {
    console.error('Error in getUserOrganisations:', err); // More detailed error logging
    res.status(500).send({
      status: 'error',
      message: 'Server error',
      statusCode: 500
    });
  }
};

const getSingleOrganisation = async (req, res) => {
  try {
    const { orgId } = req.params;
    console.log(`Fetching organisation with ID: ${orgId}`); // Log the orgId

    const organisation = await Organisation.findOne({ orgId });
    if (!organisation) {
      return res.status(404).send({
        status: 'Not Found',
        message: 'Organisation not found',
        statusCode: 404
      });
    }

    // Manually populate the users field to avoid ObjectId cast error
    const users = await User.find({ userId: { $in: organisation.users } }).select('-password');
    organisation.users = users;

    console.log(`Organisation found: ${JSON.stringify(organisation)}`); // Log the organisation

    res.status(200).send({
      status: 'success',
      message: 'Organisation details retrieved successfully',
      data: organisation
    });
  } catch (err) {
    console.error('Error in getSingleOrganisation:', err); // More detailed error logging
    res.status(500).send({
      status: 'error',
      message: 'Server error',
      statusCode: 500
    });
  }
};

const createOrganisation = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(422).send({
        status: 'Bad Request',
        message: 'Organisation name is required',
        statusCode: 422
      });
    }

    const orgId = uuidv4();
    const userId = req.user.userId;
    console.log(`Creating organisation with name: ${name}, description: ${description}, for user ID: ${userId}`); // Log the details

    const newOrganisation = new Organisation({
      orgId,
      name,
      description,
      users: [userId]
    });
    await newOrganisation.save();
    console.log(`Organisation created with ID: ${orgId}`); // Log the orgId

    res.status(201).send({
      status: 'success',
      message: 'Organisation created successfully',
      data: newOrganisation
    });
  } catch (err) {
    console.error('Error in createOrganisation:', err);
    res.status(400).send({
      status: 'Bad Request',
      message: 'Client error',
      statusCode: 400
    });
  }
};

const addUserToOrganisation = async (req, res) => {
  try {
    const { orgId } = req.params;
    const { userId } = req.body;
    console.log(`Adding user ID: ${userId} to organisation ID: ${orgId}`); // Log the userId and orgId

    const organisation = await Organisation.findOne({ orgId });
    if (!organisation) {
      return res.status(404).send({
        status: 'Not Found',
        message: 'Organisation not found',
        statusCode: 404
      });
    }
    organisation.users.push(userId);
    await organisation.save();
    console.log(`User ID: ${userId} added to organisation ID: ${orgId}`); // Log the success

    res.status(200).send({
      status: 'success',
      message: 'User added to organisation successfully'
    });
  } catch (err) {
    console.error('Error in addUserToOrganisation:', err);
    res.status(400).send({
      status: 'Bad Request',
      message: 'Client error',
      statusCode: 400
    });
  }
};

module.exports = { getUserOrganisations, getSingleOrganisation, createOrganisation, addUserToOrganisation };
