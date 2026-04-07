import nodemailer from 'nodemailer'

const FROM = process.env.EMAIL_FROM || 'kartaperu@gmail.com'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

function getTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  })
}

function baseTemplate(content: string) {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body { margin: 0; padding: 0; background: #FAF7F2; font-family: 'DM Sans', Arial, sans-serif; }
    .wrapper { max-width: 560px; margin: 40px auto; background: #fff; border-radius: 16px; overflow: hidden; border: 1px solid #E8E0D0; }
    .header { background: #1A1208; padding: 32px; text-align: center; }
    .header h1 { margin: 0; color: #C9A96E; font-size: 24px; letter-spacing: 1px; }
    .header span { color: rgba(255,255,255,0.5); font-size: 12px; }
    .body { padding: 32px; color: #1A1208; }
    .body h2 { font-size: 20px; margin-top: 0; }
    .body p { font-size: 15px; line-height: 1.6; color: #5a4a35; }
    .btn { display: inline-block; background: #1B4FD8; color: #fff !important; padding: 14px 28px; border-radius: 8px; font-weight: 700; font-size: 15px; text-decoration: none; margin: 16px 0; }
    .footer { padding: 20px 32px; border-top: 1px solid #E8E0D0; text-align: center; font-size: 12px; color: #8B7355; }
    .highlight { background: #FAF7F2; border-left: 4px solid #1B4FD8; padding: 12px 16px; border-radius: 0 8px 8px 0; margin: 16px 0; font-weight: 600; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>Karta</h1>
      <span>Carta digital para restaurantes</span>
    </div>
    <div class="body">
      ${content}
    </div>
    <div class="footer">
      © 2026 Karta · <a href="${APP_URL}" style="color:#8B7355">kartaperu.com</a>
    </div>
  </div>
</body>
</html>`
}

export async function sendWelcomeEmail(name: string, email: string, restaurantName: string) {
  const transporter = getTransporter()
  await transporter.sendMail({
    from: `Karta <${FROM}>`,
    to: email,
    subject: `¡Bienvenido a Karta, ${name.split(' ')[0]}!`,
    html: baseTemplate(`
      <h2>¡Tu carta digital está lista!</h2>
      <p>Hola <strong>${name.split(' ')[0]}</strong>, bienvenido a Karta.</p>
      <p>Acabas de crear la cuenta de <strong>${restaurantName}</strong>. Ya puedes empezar a construir tu carta digital.</p>
      <div class="highlight">Tu restaurante: ${restaurantName}</div>
      <p>Entra al panel y agrega tus primeras categorías y platos. En menos de 10 minutos tendrás tu carta lista para compartir.</p>
      <a href="${APP_URL}/dashboard" class="btn">Ir al panel →</a>
      <p style="font-size:13px;color:#8B7355;">
        Si tienes dudas, responde a este email. Estamos para ayudarte.
      </p>
    `),
  })
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const transporter = getTransporter()
  const resetUrl = `${APP_URL}/recuperar/${token}`

  await transporter.sendMail({
    from: `Karta <${FROM}>`,
    to: email,
    subject: 'Recupera tu contraseña — Karta',
    html: baseTemplate(`
      <h2>Recuperar contraseña</h2>
      <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en Karta.</p>
      <p>Haz clic en el botón para crear una nueva contraseña. El enlace expira en <strong>1 hora</strong>.</p>
      <a href="${resetUrl}" class="btn">Restablecer contraseña →</a>
      <p style="font-size:13px;color:#8B7355;">
        Si no solicitaste esto, ignora este email. Tu contraseña no cambiará.
      </p>
      <p style="font-size:12px;color:#aaa;">
        O copia este enlace en tu navegador:<br/>${resetUrl}
      </p>
    `),
  })
}

export async function sendPlanExpiryEmail(
  email: string,
  name: string,
  plan: string,
  daysLeft: number
) {
  const transporter = getTransporter()
  const urgent = daysLeft <= 1

  await transporter.sendMail({
    from: `Karta <${FROM}>`,
    to: email,
    subject: urgent
      ? `Tu plan ${plan} vence MAÑANA — Karta`
      : `Tu plan ${plan} vence en ${daysLeft} días — Karta`,
    html: baseTemplate(`
      <h2>${urgent ? 'Último aviso' : 'Tu plan está por vencer'}</h2>
      <p>Hola <strong>${name.split(' ')[0]}</strong>,</p>
      <p>Tu plan <strong>${plan}</strong> vence ${urgent ? '<strong>mañana</strong>' : `en <strong>${daysLeft} días</strong>`}.</p>
      <p>Si no renuevas, tu carta digital quedará inactiva y tus clientes no podrán verla.</p>
      <a href="${APP_URL}/dashboard/plan" class="btn">Renovar plan →</a>
      <p style="font-size:13px;color:#8B7355;">
        ¿Tienes dudas sobre el pago? Responde este email y te ayudamos.
      </p>
    `),
  })
}

export async function sendPaymentConfirmationEmail(
  email: string,
  name: string,
  plan: string,
  amount: number,
  nextBillingDate: string
) {
  const transporter = getTransporter()
  const formatted = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount)

  await transporter.sendMail({
    from: `Karta <${FROM}>`,
    to: email,
    subject: `Pago confirmado — Plan ${plan} · ${formatted}`,
    html: baseTemplate(`
      <h2>Pago confirmado</h2>
      <p>Hola <strong>${name.split(' ')[0]}</strong>, recibimos tu pago correctamente.</p>
      <div class="highlight">
        Plan ${plan} · ${formatted}/mes<br/>
        Próximo cobro: ${nextBillingDate}
      </div>
      <p>Tu carta digital está activa y disponible para tus clientes.</p>
      <a href="${APP_URL}/dashboard" class="btn">Ir al panel →</a>
      <p style="font-size:13px;color:#8B7355;">
        Guarda este email como comprobante de pago.
      </p>
    `),
  })
}
