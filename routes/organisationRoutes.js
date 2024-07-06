const express = require('express');
const { getUserOrganisations, getSingleOrganisation, createOrganisation, addUserToOrganisation } = require('../controllers/organisationController');
const authenticateJWT = require('../middleware/auth');

const router = express.Router();

router.get('/organisations', authenticateJWT, getUserOrganisations);
router.get('/organisations/:orgId', authenticateJWT, getSingleOrganisation);
router.post('/organisations', authenticateJWT, createOrganisation);
router.post('/organisations/:orgId/users', authenticateJWT, addUserToOrganisation);

module.exports = router;
