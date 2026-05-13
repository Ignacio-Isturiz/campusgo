const {
  generateOtp,
  hashOtp,
  hashPassword,
  verifyPassword,
  randomToken,
} = require('../services/security');
const {
  ALLOWED_ROLES,
  AUTH_PURPOSES,
  ROLES,
} = require('./auth.constants');
const { AUTH_MESSAGES } = require('./auth.messages');
const {
  createChallenge,
  isInvalidActiveChallenge,
  isInvalidRecoverChallenge,
  validateOtp,
} = require('./auth.challenge.service');
const {
  createUser,
  findChallengeByIdAndPurpose,
  findUserByEmail,
  findUserById,
  userExistsByEmail,
} = require('./auth.repositories');
const { toUserPayload, respondWithError } = require('./auth.response');
const { createSession } = require('./auth.session.service');
const {
  getChallengeIdFromBody,
  getEmailFromBody,
  getOtpFromBody,
  getPasswordFromBody,
  getResetTokenFromBody,
  getRoleFromBody,
  getTrimmedPasswordFromBody,
  isPasswordTooShort,
} = require('./auth.validators');

function buildAuthSuccess(message, user, session) {
  return {
    message,
    token: session.token,
    user: toUserPayload(user),
  };
}

async function requestRegisterOtp(req, res) {
  try {
    const email = getEmailFromBody(req.body);
    const password = getPasswordFromBody(req.body.password);

    if (isPasswordTooShort(password)) {
      return res.status(400).json({ message: AUTH_MESSAGES.register.minPassword });
    }

    const existingUser = await userExistsByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: AUTH_MESSAGES.register.existingUser });
    }

    const challengeId = await createChallenge({
      email,
      purpose: AUTH_PURPOSES.REGISTER,
      payload: {
        passwordHash: hashPassword(password),
        role: ROLES.ESTUDIANTE,
      },
    });

    return res.json({
      message: AUTH_MESSAGES.register.otpSent,
      challengeId,
    });
  } catch (error) {
    return respondWithError(res, error, AUTH_MESSAGES.register.requestError);
  }
}

async function verifyRegisterOtp(req, res) {
  try {
    const email = getEmailFromBody(req.body);
    const challenge = await findChallengeByIdAndPurpose(
      getChallengeIdFromBody(req.body),
      AUTH_PURPOSES.REGISTER
    );

    if (isInvalidActiveChallenge(challenge)) {
      return res.status(400).json({ message: AUTH_MESSAGES.register.otpInvalidOrExpired });
    }

    if (challenge.email !== email) {
      return res.status(400).json({ message: AUTH_MESSAGES.common.invalidChallengeEmail });
    }

    if (!validateOtp(getOtpFromBody(req.body), challenge)) {
      return res.status(400).json({ message: AUTH_MESSAGES.common.invalidOtp });
    }

    const existingUser = await userExistsByEmail(challenge.email);
    if (existingUser) {
      return res.status(409).json({ message: AUTH_MESSAGES.register.existingUser });
    }

    const user = await createUser({
      email: challenge.email,
      passwordHash: challenge.payload.passwordHash,
      role: challenge.payload.role || ROLES.ESTUDIANTE,
    });

    challenge.consumedAt = new Date();
    await challenge.save();

    const session = await createSession(user._id);

    return res.json(buildAuthSuccess(AUTH_MESSAGES.register.verified, user, session));
  } catch (error) {
    if (error && error.code === 11000) {
      console.error('verifyRegisterOtp DUPLICATE KEY error:', JSON.stringify({
        code: error.code,
        keyPattern: error.keyPattern,
        keyValue: error.keyValue,
        message: error.message,
      }, null, 2));
      return res.status(409).json({ message: AUTH_MESSAGES.register.duplicate });
    }

    console.error('verifyRegisterOtp error:', error);
    return res.status(500).json({ message: AUTH_MESSAGES.register.verifyError });
  }
}

async function requestLoginOtp(req, res) {
  try {
    const email = getEmailFromBody(req.body);
    const password = getTrimmedPasswordFromBody(req.body.password);
    const user = await findUserByEmail(email, '_id passwordHash');

    if (user && password) {
      if (!verifyPassword(password, user.passwordHash)) {
        return res.status(400).json({ message: AUTH_MESSAGES.login.badCredentials });
      }
    }

    const challengeId = await createChallenge({
      email,
      purpose: AUTH_PURPOSES.LOGIN,
      payload: {
        userId: user ? String(user._id) : null,
        createUser: !user,
        passwordHash: user ? null : hashPassword(password || generateOtp()),
        role: ROLES.ESTUDIANTE,
      },
    });

    return res.json({
      message: AUTH_MESSAGES.login.otpSent,
      challengeId,
    });
  } catch (error) {
    return respondWithError(res, error, AUTH_MESSAGES.login.requestError);
  }
}

async function verifyLoginOtp(req, res) {
  try {
    const email = getEmailFromBody(req.body);
    const challenge = await findChallengeByIdAndPurpose(
      getChallengeIdFromBody(req.body),
      AUTH_PURPOSES.LOGIN
    );

    if (isInvalidActiveChallenge(challenge)) {
      return res.status(400).json({ message: AUTH_MESSAGES.login.otpInvalidOrExpired });
    }

    if (challenge.email !== email) {
      return res.status(400).json({ message: AUTH_MESSAGES.common.invalidChallengeEmail });
    }

    if (!validateOtp(getOtpFromBody(req.body), challenge)) {
      return res.status(400).json({ message: AUTH_MESSAGES.common.invalidOtp });
    }

    let user = await findUserByEmail(challenge.email);

    if (!user) {
      if (!challenge.payload.createUser) {
        return res.status(404).json({ message: AUTH_MESSAGES.login.accountNotFound });
      }

      user = await createUser({
        email: challenge.email,
        passwordHash: challenge.payload.passwordHash,
        role: challenge.payload.role || ROLES.ESTUDIANTE,
      });
    }

    challenge.consumedAt = new Date();
    await challenge.save();

    const session = await createSession(user._id);

    return res.json(buildAuthSuccess(AUTH_MESSAGES.login.verified, user, session));
  } catch (error) {
    return res.status(500).json({ message: AUTH_MESSAGES.login.verifyError });
  }
}

async function requestForgotPasswordOtp(req, res) {
  try {
    const email = getEmailFromBody(req.body);
    const user = await findUserByEmail(email, '_id');

    if (!user) {
      return res.status(404).json({ message: AUTH_MESSAGES.forgotPassword.accountNotFound });
    }

    const challengeId = await createChallenge({
      email,
      purpose: AUTH_PURPOSES.FORGOT_PASSWORD,
      payload: {
        userId: String(user._id),
      },
    });

    return res.json({
      message: AUTH_MESSAGES.forgotPassword.otpSent,
      challengeId,
    });
  } catch (error) {
    return respondWithError(res, error, AUTH_MESSAGES.forgotPassword.requestError);
  }
}

async function verifyForgotPasswordOtp(req, res) {
  try {
    const challenge = await findChallengeByIdAndPurpose(
      getChallengeIdFromBody(req.body),
      AUTH_PURPOSES.FORGOT_PASSWORD
    );

    if (isInvalidRecoverChallenge(challenge)) {
      return res.status(400).json({ message: AUTH_MESSAGES.forgotPassword.processInvalidOrExpired });
    }

    if (!challenge.verifiedAt) {
      const otp = getOtpFromBody(req.body);
      if (!validateOtp(otp, challenge)) {
        return res.status(400).json({ message: AUTH_MESSAGES.common.invalidOtp });
      }

      const resetToken = randomToken();
      const resetTokenData = hashOtp(resetToken);

      challenge.verifiedAt = new Date();
      challenge.resetTokenHash = resetTokenData.hash;
      challenge.resetTokenSalt = resetTokenData.salt;
      await challenge.save();

      return res.json({
        message: AUTH_MESSAGES.forgotPassword.readyToReset,
        resetToken,
      });
    }

    const resetToken = getResetTokenFromBody(req.body);
    const newPassword = getPasswordFromBody(req.body.newPassword);

    if (isPasswordTooShort(newPassword)) {
      return res.status(400).json({ message: AUTH_MESSAGES.forgotPassword.minPassword });
    }

    if (!resetToken || !validateOtp(resetToken, {
      otpHash: challenge.resetTokenHash,
      otpSalt: challenge.resetTokenSalt,
    })) {
      return res.status(400).json({ message: AUTH_MESSAGES.forgotPassword.invalidResetToken });
    }

    const user = await findUserById(challenge.payload.userId);
    if (!user) {
      return res.status(404).json({ message: AUTH_MESSAGES.login.accountNotFound });
    }

    user.passwordHash = hashPassword(newPassword);
    await user.save();

    challenge.consumedAt = new Date();
    await challenge.save();

    const session = await createSession(user._id);

    return res.json(buildAuthSuccess(AUTH_MESSAGES.forgotPassword.updated, user, session));
  } catch (error) {
    return res.status(500).json({ message: AUTH_MESSAGES.forgotPassword.verifyError });
  }
}

async function assignRole(req, res) {
  try {
    const email = getEmailFromBody(req.body);
    const role = getRoleFromBody(req.body.role);

    if (!ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({ message: AUTH_MESSAGES.assignRole.invalidRole });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: AUTH_MESSAGES.assignRole.emailNotFound });
    }

    user.role = role;
    await user.save();

    return res.json({
      message: AUTH_MESSAGES.assignRole.updated,
      user: toUserPayload(user),
    });
  } catch (error) {
    return respondWithError(res, error, AUTH_MESSAGES.assignRole.error);
  }
}

async function me(req, res) {
  return res.json({
    user: toUserPayload(req.user),
  });
}

module.exports = {
  assignRole,
  me,
  requestForgotPasswordOtp,
  requestLoginOtp,
  requestRegisterOtp,
  verifyForgotPasswordOtp,
  verifyLoginOtp,
  verifyRegisterOtp,
};
