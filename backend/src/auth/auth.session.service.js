const { randomToken } = require('../services/security');
const { SESSION_TTL_MS } = require('./auth.constants');
const { createAuthSession } = require('./auth.repositories');

async function createSession(userId) {
  const token = randomToken();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await createAuthSession({
    token,
    userId,
    expiresAt,
  });

  return { token, expiresAt };
}

module.exports = {
  createSession,
};
