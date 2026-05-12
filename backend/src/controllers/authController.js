const AuthChallenge = require('../models/AuthChallenge');
const AuthSession = require('../models/AuthSession');
const User = require('../models/User');
const {
  assertInstitutionEmail,
  generateOtp,
  hashOtp,
  hashPassword,
  randomToken,
  verifyOtp,
  verifyPassword,
} = require('../services/security');
const { sendOtpEmail } = require('../services/mailer');

const OTP_TTL_MS = 15 * 60 * 1000;
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

function toUserPayload(user) {
  return {
    id: String(user._id),
    email: user.email,
    role: user.role,
  };
}

async function createSession(userId) {
  const token = randomToken();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await AuthSession.create({
    token,
    user: userId,
    expiresAt,
  });

  return { token, expiresAt };
}

async function createChallenge({ email, purpose, payload }) {
  const otp = generateOtp();
  const otpData = hashOtp(otp);
  const challengeId = randomToken();
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);

  await AuthChallenge.create({
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

async function requestRegisterOtp(req, res) {
  try {
    const email = assertInstitutionEmail(req.body.email);
    const password = String(req.body.password || '');

    if (password.length < 6) {
      return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres.' });
    }

    // Verificar que el correo no esté ya registrado antes de enviar OTP
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Ese correo ya tiene una cuenta. Intenta iniciar sesión.' });
    }

    const challengeId = await createChallenge({
      email,
      purpose: 'register',
      payload: {
        passwordHash: hashPassword(password),
        role: 'estudiante',
      },
    });

    return res.json({
      message: 'Hemos enviado un código OTP para completar tu registro.',
      challengeId,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message || 'No fue posible iniciar el registro.' });
  }
}

async function verifyRegisterOtp(req, res) {
  try {
    const email = assertInstitutionEmail(req.body.email);
    const challenge = await AuthChallenge.findOne({ challengeId: req.body.challengeId, purpose: 'register' });

    if (!challenge || challenge.consumedAt || challenge.expiresAt < new Date()) {
      return res.status(400).json({ message: 'El código de registro expiró o no es válido.' });
    }

    if (challenge.email !== email) {
      return res.status(400).json({ message: 'El correo no coincide con el código OTP solicitado.' });
    }

    if (!verifyOtp(String(req.body.otp || ''), challenge.otpHash, challenge.otpSalt)) {
      return res.status(400).json({ message: 'El OTP ingresado no es correcto.' });
    }

    // Verificar que no se haya registrado entre la solicitud del OTP y la verificación
    const existingUser = await User.findOne({ email: challenge.email });
    if (existingUser) {
      return res.status(409).json({ message: 'Ese correo ya tiene una cuenta. Intenta iniciar sesión.' });
    }

    const user = await User.create({
      email: challenge.email,
      passwordHash: challenge.payload.passwordHash,
      role: challenge.payload.role || 'estudiante',
    });

    challenge.consumedAt = new Date();
    await challenge.save();

    const session = await createSession(user._id);

    return res.json({
      message: 'Registro completado correctamente.',
      token: session.token,
      user: toUserPayload(user),
    });
  } catch (error) {
    if (error && error.code === 11000) {
      console.error('verifyRegisterOtp DUPLICATE KEY error:', JSON.stringify({
        code: error.code,
        keyPattern: error.keyPattern,
        keyValue: error.keyValue,
        message: error.message,
      }, null, 2));
      return res.status(409).json({ message: 'Ese correo ya fue registrado.' });
    }

    console.error('verifyRegisterOtp error:', error);
    return res.status(500).json({ message: 'No fue posible verificar el registro.' });
  }
}

async function requestLoginOtp(req, res) {
  try {
    const email = assertInstitutionEmail(req.body.email);
    const password = String(req.body.password || '').trim();
    const user = await User.findOne({ email });

    if (user && password) {
      if (!verifyPassword(password, user.passwordHash)) {
        return res.status(400).json({ message: 'Correo o contraseña incorrectos.' });
      }
    }

    const challengeId = await createChallenge({
      email,
      purpose: 'login',
      payload: {
        userId: user ? String(user._id) : null,
        createUser: !user,
        passwordHash: user ? null : hashPassword(password || generateOtp()),
        role: 'estudiante',
      },
    });

    return res.json({
      message: 'Hemos enviado un OTP a tu correo para iniciar sesión.',
      challengeId,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message || 'No fue posible iniciar sesión.' });
  }
}

async function verifyLoginOtp(req, res) {
  try {
    const email = assertInstitutionEmail(req.body.email);
    const challenge = await AuthChallenge.findOne({ challengeId: req.body.challengeId, purpose: 'login' });

    if (!challenge || challenge.consumedAt || challenge.expiresAt < new Date()) {
      return res.status(400).json({ message: 'El código de acceso expiró o no es válido.' });
    }

    if (challenge.email !== email) {
      return res.status(400).json({ message: 'El correo no coincide con el código OTP solicitado.' });
    }

    if (!verifyOtp(String(req.body.otp || ''), challenge.otpHash, challenge.otpSalt)) {
      return res.status(400).json({ message: 'El OTP ingresado no es correcto.' });
    }

    let user = await User.findOne({ email: challenge.email });

    if (!user) {
      if (!challenge.payload.createUser) {
        return res.status(404).json({ message: 'No encontramos tu cuenta.' });
      }

      user = await User.create({
        email: challenge.email,
        passwordHash: challenge.payload.passwordHash,
        role: challenge.payload.role || 'estudiante',
      });
    }

    challenge.consumedAt = new Date();
    await challenge.save();

    const session = await createSession(user._id);

    return res.json({
      message: 'Sesión iniciada correctamente.',
      token: session.token,
      user: toUserPayload(user),
    });
  } catch (error) {
    return res.status(500).json({ message: 'No fue posible verificar el ingreso.' });
  }
}

async function requestForgotPasswordOtp(req, res) {
  try {
    const email = assertInstitutionEmail(req.body.email);
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'No encontramos una cuenta con ese correo.' });
    }

    const challengeId = await createChallenge({
      email,
      purpose: 'forgot-password',
      payload: {
        userId: String(user._id),
      },
    });

    return res.json({
      message: 'Hemos enviado un OTP para recuperar tu contraseña.',
      challengeId,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message || 'No fue posible iniciar la recuperación.' });
  }
}

async function verifyForgotPasswordOtp(req, res) {
  try {
    const challenge = await AuthChallenge.findOne({ challengeId: req.body.challengeId, purpose: 'forgot-password' });

    if (!challenge || challenge.expiresAt < new Date()) {
      return res.status(400).json({ message: 'El proceso de recuperación expiró o no es válido.' });
    }

    if (!challenge.verifiedAt) {
      const otp = String(req.body.otp || '');
      if (!verifyOtp(otp, challenge.otpHash, challenge.otpSalt)) {
        return res.status(400).json({ message: 'El OTP ingresado no es correcto.' });
      }

      const resetToken = randomToken();
      const resetTokenData = hashOtp(resetToken);

      challenge.verifiedAt = new Date();
      challenge.resetTokenHash = resetTokenData.hash;
      challenge.resetTokenSalt = resetTokenData.salt;
      await challenge.save();

      return res.json({
        message: 'Código verificado. Ya puedes definir tu nueva contraseña.',
        resetToken,
      });
    }

    const resetToken = String(req.body.resetToken || '');
    const newPassword = String(req.body.newPassword || '');

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres.' });
    }

    if (!resetToken || !verifyOtp(resetToken, challenge.resetTokenHash, challenge.resetTokenSalt)) {
      return res.status(400).json({ message: 'El token de recuperación no es válido.' });
    }

    const user = await User.findById(challenge.payload.userId);
    if (!user) {
      return res.status(404).json({ message: 'No encontramos tu cuenta.' });
    }

    user.passwordHash = hashPassword(newPassword);
    await user.save();

    challenge.consumedAt = new Date();
    await challenge.save();

    const session = await createSession(user._id);

    return res.json({
      message: 'Contraseña actualizada correctamente.',
      token: session.token,
      user: toUserPayload(user),
    });
  } catch (error) {
    return res.status(500).json({ message: 'No fue posible recuperar la contraseña.' });
  }
}

async function assignRole(req, res) {
  try {
    const email = assertInstitutionEmail(req.body.email);
    const role = String(req.body.role || '').toLowerCase();

    if (!['admin', 'bienestar', 'estudiante'].includes(role)) {
      return res.status(400).json({ message: 'Rol no válido.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No encontramos ese correo.' });
    }

    user.role = role;
    await user.save();

    return res.json({
      message: 'Rol actualizado correctamente.',
      user: toUserPayload(user),
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message || 'No fue posible cambiar el rol.' });
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