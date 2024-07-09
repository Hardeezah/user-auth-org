const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { createOrganisation, getUserOrganisations, getOrganisation, addUserToOrganisation } = require('../controllers/organisationController');

router.post('/organisations', auth, createOrganisation);
router.get('/organisations', auth, getUserOrganisations);
router.get('/organisations/:orgId', auth, getOrganisation);
router.post('/organisations/:orgId/users', auth, addUserToOrganisation);

module.exports = router;
