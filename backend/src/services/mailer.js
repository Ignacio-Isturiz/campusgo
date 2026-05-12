const nodemailer = require('nodemailer');

function buildTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT || 465);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: String(process.env.SMTP_SECURE || 'true') === 'true',
    auth: {
      user,
      pass,
    },
  });
}

async function sendOtpEmail({ to, otp, purpose }) {
  const transporter = buildTransporter();

  if (!transporter) {
    console.log(`[OTP:${purpose}] ${to} -> ${otp}`);
    return;
  }

  const subjectMap = {
    register: 'Verificación de registro UNAULA',
    login: 'Código de ingreso UNAULA',
    'forgot-password': 'Recuperación de contraseña UNAULA',
  };

  const actionMap = {
    register: 'completar tu registro',
    login: 'ingresar a la plataforma',
    'forgot-password': 'recuperar tu contraseña',
  };

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || `"UNAULA Connect" <${process.env.SMTP_USER}>`,
      to,
      subject: subjectMap[purpose] || 'Código OTP UNAULA',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #1f1f1f;">
          <h2>Tu código OTP</h2>
          <p>Usa este código para ${actionMap[purpose] || 'continuar'}:</p>
          <div style="font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #f2482e; margin: 24px 0;">${otp}</div>
          <p>Este código expira en 15 minutos.</p>
        </div>
      `,
      text: `Tu código OTP es ${otp}. Expira en 15 minutos.`,
    });
  } catch (error) {
    throw error;
  }
}

module.exports = {
  sendOtpEmail,
};