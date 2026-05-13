const OTP_TTL_MS = 15 * 60 * 1000;
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const MIN_PASSWORD_LENGTH = 6;

const ROLES = Object.freeze({
  ADMIN: 'admin',
  BIENESTAR: 'bienestar',
  ESTUDIANTE: 'estudiante',
});

const ALLOWED_ROLES = Object.freeze([
  ROLES.ADMIN,
  ROLES.BIENESTAR,
  ROLES.ESTUDIANTE,
]);

const AUTH_PURPOSES = Object.freeze({
  REGISTER: 'register',
  LOGIN: 'login',
  FORGOT_PASSWORD: 'forgot-password',
});

module.exports = {
  ALLOWED_ROLES,
  AUTH_PURPOSES,
  MIN_PASSWORD_LENGTH,
  OTP_TTL_MS,
  ROLES,
  SESSION_TTL_MS,
};
