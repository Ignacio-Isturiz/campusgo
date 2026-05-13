const { sendOtpEmail } = require('../services/mailer');
const { generateOtp, hashOtp, randomToken, verifyOtp } = require('../services/security');
const { OTP_TTL_MS } = require('./auth.constants');
const { createAuthChallenge } = require('./auth.repositories');

async function createChallenge({ email, purpose, payload }) {
  const otp = generateOtp();
  const otpData = hashOtp(otp);
  const challengeId = randomToken();
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);

  await createAuthChallenge({
    challengeId,
    email,
    purpose,
    otpHash: otpData.hash,
    otpSalt: otpData.salt,
    payload,
    expiresAt,
  });

  await sendOtpEmail({ to: email, otp, purpose });

  return challengeId;
}

function isChallengeExpired(challenge) {
  return challenge.expiresAt < new Date();
}

function isInvalidActiveChallenge(challenge) {
  return !challenge || challenge.consumedAt || isChallengeExpired(challenge);
}

function isInvalidRecoverChallenge(challenge) {
  return !challenge || isChallengeExpired(challenge);
}

function validateOtp(inputOtp, challenge) {
  return verifyOtp(inputOtp, challenge.otpHash, challenge.otpSalt);
}

module.exports = {
  createChallenge,
  isInvalidActiveChallenge,
  isInvalidRecoverChallenge,
  validateOtp,
};
