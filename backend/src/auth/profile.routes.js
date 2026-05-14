const express = require('express');
const { requireAuth } = require('./auth.middleware');
const { updateProfilePhoto, getProfile } = require('./profile.controller');

const router = express.Router();

router.get('/me', requireAuth, getProfile);
router.post('/photo', requireAuth, updateProfilePhoto);

module.exports = router;
