const mongoose = require('mongoose');

const OrganisationSchema = new mongoose.Schema({
  orgId: {
    type: String,
    unique: true,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
  },
  users: [{
    type: String,  // Change this to String
    ref: 'User'
  }]
});

const Organisation = mongoose.model('Organisation', OrganisationSchema);

module.exports = Organisation;
