const AuthChallenge = require('../models/AuthChallenge');
const AuthSession = require('../models/AuthSession');
const User = require('../models/User');

async function createAuthSession({ token, userId, expiresAt }) {
  return AuthSession.create({
    token,
    user: userId,
    expiresAt,
  });
}

async function createAuthChallenge({ challengeId, email, purpose, otpHash, otpSalt, payload, expiresAt }) {
  return AuthChallenge.create({
    challengeId,
    email,
    purpose,
    otpHash,
    otpSalt,
    payload,
    expiresAt,
  });
}

async function findChallengeByIdAndPurpose(challengeId, purpose) {
  return AuthChallenge.findOne({ challengeId, purpose });
}

async function findUserByEmail(email, projection) {
  return User.findOne({ email }, projection);
}

async function findUserById(userId, projection) {
  return User.findById(userId, projection);
}

async function userExistsByEmail(email) {
  return User.exists({ email });
}

async function createUser({ email, passwordHash, role, displayName }) {
  return User.create({
    email,
    passwordHash,
    role,
    ...(displayName ? { displayName } : {}),
  });
}

async function findSessionWithUserByToken(token) {
  return AuthSession.findOne({ token }).populate({
    path: 'user',
    select: '_id email role active displayName',
  });
}

module.exports = {
  createAuthChallenge,
  createAuthSession,
  createUser,
  findChallengeByIdAndPurpose,
  findSessionWithUserByToken,
  findUserByEmail,
  findUserById,
  userExistsByEmail,
};
