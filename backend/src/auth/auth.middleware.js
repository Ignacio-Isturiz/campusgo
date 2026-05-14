const { ROLES, SESSION_TTL_MS } = require('./auth.constants');
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

    // Attach session and user to the request
    req.authSession = session;
    req.user = session.user;

    // Sliding expiration: extend session expiry on each validated request
    try {
      session.expiresAt = new Date(Date.now() + SESSION_TTL_MS);
      // Save asynchronously but don't block the request flow on small delays
      // keep it awaited to ensure the DB write occurs and TTL index is updated
      await session.save();
    } catch (e) {
      // If saving the session fails we don't want to block the request
      console.error('Failed to extend session expiry:', e && e.message ? e.message : e);
    }
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
