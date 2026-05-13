const { ROLES } = require('./auth.constants');
const { AUTH_MESSAGES } = require('./auth.messages');
const { findSessionWithUserByToken } = require('./auth.repositories');

async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: AUTH_MESSAGES.session.missingToken });
    }

    const session = await findSessionWithUserByToken(token);

    if (!session || !session.user) {
      return res.status(401).json({ message: AUTH_MESSAGES.session.invalidSession });
    }

    if (!session.user.active) {
      return res.status(403).json({ message: AUTH_MESSAGES.session.inactiveAccount });
    }

    req.authSession = session;
    req.user = session.user;
    return next();
  } catch (error) {
    return res.status(500).json({ message: AUTH_MESSAGES.session.validateError });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== ROLES.ADMIN) {
    return res.status(403).json({ message: AUTH_MESSAGES.session.adminOnly });
  }

  return next();
}

module.exports = {
  requireAdmin,
  requireAuth,
};
