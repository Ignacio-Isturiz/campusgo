const crypto = require('crypto');

const ALLOWED_DOMAIN = '@unaula.edu.co';

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function assertInstitutionEmail(email) {
  const normalized = normalizeEmail(email);

  if (!normalized.endsWith(ALLOWED_DOMAIN)) {
    const error = new Error(`El correo debe terminar en ${ALLOWED_DOMAIN}`);
    error.statusCode = 400;
    throw error;
  }

  return normalized;
}

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const derived = crypto.scryptSync(String(password), salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

function verifyPassword(password, storedHash) {
  const [salt, expected] = String(storedHash || '').split(':');

  if (!salt || !expected) {
    return false;
  }

  const actual = crypto.scryptSync(String(password), salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(actual, 'hex'), Buffer.from(expected, 'hex'));
}

function generateOtp() {
  return String(crypto.randomInt(100000, 1000000));
}

function hashOtp(otp, salt = crypto.randomBytes(16).toString('hex')) {
  const digest = crypto.createHash('sha256').update(`${salt}:${otp}`).digest('hex');
  return {
    salt,
    hash: digest,
  };
}

function verifyOtp(otp, storedHash, salt) {
  const { hash } = hashOtp(otp, salt);
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(String(storedHash), 'hex'));
}

function randomToken() {
  return crypto.randomBytes(32).toString('hex');
}

module.exports = {
  ALLOWED_DOMAIN,
  assertInstitutionEmail,
  generateOtp,
  hashOtp,
  hashPassword,
  normalizeEmail,
  randomToken,
  verifyOtp,
  verifyPassword,
};