const express = require('express');
const { requireAuth } = require('./auth.middleware');
const { updateProfilePhoto, getProfile, updateProfile } = require('./profile.controller');


const router = express.Router();

router.get('/me', requireAuth, getProfile);
router.post('/photo', requireAuth, updateProfilePhoto);
router.post('/', requireAuth, updateProfile);

module.exports = router;
