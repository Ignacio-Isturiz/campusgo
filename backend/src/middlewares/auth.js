const AuthSession = require('../models/AuthSession');

async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: 'Falta el token de acceso.' });
    }

    const session = await AuthSession.findOne({ token }).populate('user');

    if (!session || !session.user) {
      return res.status(401).json({ message: 'Sesión inválida o expirada.' });
    }

    if (!session.user.active) {
      return res.status(403).json({ message: 'La cuenta está inactiva.' });
    }

    req.authSession = session;
    req.user = session.user;
    return next();
  } catch (error) {
    return res.status(500).json({ message: 'No fue posible validar la sesión.' });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Solo un admin puede realizar esta acción.' });
  }

  return next();
}

module.exports = {
  requireAdmin,
  requireAuth,
};