const AUTH_MESSAGES = Object.freeze({
  common: {
    invalidOtp: 'El OTP ingresado no es correcto.',
    invalidChallengeEmail: 'El correo no coincide con el código OTP solicitado.',
  },
  register: {
    minPassword: 'La contraseña debe tener al menos 6 caracteres.',
    existingUser: 'Ese correo ya tiene una cuenta. Intenta iniciar sesión.',
    otpSent: 'Hemos enviado un código OTP para completar tu registro.',
    otpInvalidOrExpired: 'El código de registro expiró o no es válido.',
    verified: 'Registro completado correctamente.',
    duplicate: 'Ese correo ya fue registrado.',
    requestError: 'No fue posible iniciar el registro.',
    verifyError: 'No fue posible verificar el registro.',
  },
  login: {
    badCredentials: 'Correo o contraseña incorrectos.',
    otpSent: 'Hemos enviado un OTP a tu correo para iniciar sesión.',
    otpInvalidOrExpired: 'El código de acceso expiró o no es válido.',
    accountNotFound: 'No encontramos tu cuenta.',
    verified: 'Sesión iniciada correctamente.',
    requestError: 'No fue posible iniciar sesión.',
    verifyError: 'No fue posible verificar el ingreso.',
  },
  forgotPassword: {
    accountNotFound: 'No encontramos una cuenta con ese correo.',
    otpSent: 'Hemos enviado un OTP para recuperar tu contraseña.',
    processInvalidOrExpired: 'El proceso de recuperación expiró o no es válido.',
    readyToReset: 'Código verificado. Ya puedes definir tu nueva contraseña.',
    minPassword: 'La contraseña debe tener al menos 6 caracteres.',
    invalidResetToken: 'El token de recuperación no es válido.',
    updated: 'Contraseña actualizada correctamente.',
    requestError: 'No fue posible iniciar la recuperación.',
    verifyError: 'No fue posible recuperar la contraseña.',
  },
  assignRole: {
    invalidRole: 'Rol no válido.',
    emailNotFound: 'No encontramos ese correo.',
    updated: 'Rol actualizado correctamente.',
    error: 'No fue posible cambiar el rol.',
  },
  session: {
    missingToken: 'Falta el token de acceso.',
    invalidSession: 'Sesión inválida o expirada.',
    inactiveAccount: 'La cuenta está inactiva.',
    validateError: 'No fue posible validar la sesión.',
    adminOnly: 'Solo un admin puede realizar esta acción.',
  },
});

module.exports = {
  AUTH_MESSAGES,
};
