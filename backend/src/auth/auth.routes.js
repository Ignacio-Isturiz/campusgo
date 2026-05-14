const express = require('express');

const { requireAdmin, requireAuth } = require('./auth.middleware');
const {
  assignRole,
  me,
  requestForgotPasswordOtp,
  requestLoginOtp,
  requestRegisterOtp,
  verifyForgotPasswordOtp,
  verifyLoginOtp,
  verifyRegisterOtp,
} = require('./auth.controller');

const router = express.Router();

router.get('/me', requireAuth, me);
// profile endpoints (get profile and update photo)
const profileRoutes = require('./profile.routes');
router.use('/profile', profileRoutes);
router.post('/register/request-otp', requestRegisterOtp);
router.post('/register/verify-otp', verifyRegisterOtp);
router.post('/login/request-otp', requestLoginOtp);
router.post('/login/verify-otp', verifyLoginOtp);
router.post('/forgot-password/request-otp', requestForgotPasswordOtp);
router.post('/forgot-password/verify-otp', verifyForgotPasswordOtp);
router.post('/admin/assign-role', requireAuth, requireAdmin, assignRole);
// logout endpoint
router.post('/logout', requireAuth, async (req, res) => {
  try {
    // remove the current session document
    const session = req.authSession;
    if (session && session._id) {
      await session.remove();
    }
    return res.json({ message: 'Logged out' });
  } catch (e) {
    return res.status(500).json({ message: 'Error al cerrar sesión' });
  }
});

module.exports = router;
