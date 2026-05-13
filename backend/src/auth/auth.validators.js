const { assertInstitutionEmail } = require('../services/security');
const { MIN_PASSWORD_LENGTH } = require('./auth.constants');

function getEmailFromBody(body) {
  return assertInstitutionEmail(body.email);
}

function getPasswordFromBody(rawPassword) {
  return String(rawPassword || '');
}

function getTrimmedPasswordFromBody(rawPassword) {
  return String(rawPassword || '').trim();
}

function getRoleFromBody(rawRole) {
  return String(rawRole || '').toLowerCase();
}

function getChallengeIdFromBody(body) {
  return body.challengeId;
}

function getOtpFromBody(body) {
  return String(body.otp || '');
}

function getResetTokenFromBody(body) {
  return String(body.resetToken || '');
}

function isPasswordTooShort(password) {
  return password.length < MIN_PASSWORD_LENGTH;
}

module.exports = {
  getChallengeIdFromBody,
  getEmailFromBody,
  getOtpFromBody,
  getPasswordFromBody,
  getResetTokenFromBody,
  getRoleFromBody,
  getTrimmedPasswordFromBody,
  isPasswordTooShort,
};
