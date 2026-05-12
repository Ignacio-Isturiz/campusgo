const express = require('express');

const { requireAdmin, requireAuth } = require('../middlewares/auth');
const {
  assignRole,
  me,
  requestForgotPasswordOtp,
  requestLoginOtp,
  requestRegisterOtp,
  verifyForgotPasswordOtp,
  verifyLoginOtp,
  verifyRegisterOtp,
} = require('../controllers/authController');

const router = express.Router();

router.get('/me', requireAuth, me);
router.post('/register/request-otp', requestRegisterOtp);
router.post('/register/verify-otp', verifyRegisterOtp);
router.post('/login/request-otp', requestLoginOtp);
router.post('/login/verify-otp', verifyLoginOtp);
router.post('/forgot-password/request-otp', requestForgotPasswordOtp);
router.post('/forgot-password/verify-otp', verifyForgotPasswordOtp);
router.post('/admin/assign-role', requireAuth, requireAdmin, assignRole);

module.exports = router;