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
      © 2026 Karta · <a href="${APP_URL}" style="color:#8B7355">karta.com.pe</a>
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

const SUPPORT_INBOX = process.env.SUPPORT_INBOX || FROM

interface AttachmentRef {
  fileName: string
  fileUrl: string
  fileSize: number
  mimeType: string
}

function renderAttachmentsHtml(attachments: AttachmentRef[]) {
  if (!attachments.length) return ''
  const items = attachments
    .map((a) => {
      const sizeKb = Math.round(a.fileSize / 1024)
      return `<li style="margin:4px 0;"><a href="${a.fileUrl}" target="_blank" style="color:#1B4FD8;">${a.fileName}</a> <span style="color:#8B7355;font-size:12px;">(${sizeKb} KB)</span></li>`
    })
    .join('')
  return `<p style="margin-top:16px;"><strong>Adjuntos:</strong></p><ul style="padding-left:18px;">${items}</ul>`
}

interface SupportTicketEmailParams {
  ticketId: string
  subject: string
  message: string
  customerEmail: string
  customerName: string
  restaurantName: string
  priority: boolean
  attachments?: AttachmentRef[]
}

export async function sendSupportTicketToInbox(params: SupportTicketEmailParams) {
  const transporter = getTransporter()
  const tag = params.priority ? '[PRIORITARIO] ' : ''
  const accentColor = params.priority ? '#dc2626' : '#1B4FD8'
  const attachments = params.attachments ?? []

  await transporter.sendMail({
    from: `Karta Soporte <${FROM}>`,
    to: SUPPORT_INBOX,
    replyTo: params.customerEmail,
    subject: `${tag}${params.subject} — ${params.restaurantName}`,
    html: baseTemplate(`
      <h2 style="color:${accentColor};">${params.priority ? 'Ticket PRIORITARIO' : 'Nuevo ticket de soporte'}</h2>
      <div class="highlight" style="border-left-color:${accentColor};">
        <strong>De:</strong> ${params.customerName} &lt;${params.customerEmail}&gt;<br/>
        <strong>Restaurante:</strong> ${params.restaurantName}<br/>
        <strong>Ticket ID:</strong> ${params.ticketId}
      </div>
      <p><strong>Asunto:</strong> ${params.subject}</p>
      <p style="white-space:pre-wrap;background:#FAF7F2;padding:16px;border-radius:8px;">${params.message}</p>
      ${renderAttachmentsHtml(attachments)}
      ${params.priority ? '<p style="font-size:13px;color:#dc2626;font-weight:600;">⚡ Cliente con Soporte Prioritario — responder en &lt; 4h hábiles</p>' : ''}
      <a href="${APP_URL}/admin/soporte" class="btn">Ver en el panel admin →</a>
    `),
  })
}

export async function sendSupportTicketConfirmationToCustomer(params: SupportTicketEmailParams) {
  const transporter = getTransporter()
  const slaText = params.priority
    ? 'Como tienes <strong>Soporte Prioritario</strong> activo, te responderemos en menos de <strong>4 horas hábiles</strong>.'
    : 'Te responderemos a este correo en las próximas <strong>48 horas hábiles</strong>.'
  const attachments = params.attachments ?? []

  await transporter.sendMail({
    from: `Karta <${FROM}>`,
    to: params.customerEmail,
    subject: `Recibimos tu consulta — Karta`,
    html: baseTemplate(`
      <h2>Recibimos tu consulta</h2>
      <p>Hola <strong>${params.customerName.split(' ')[0]}</strong>,</p>
      <p>Tu ticket fue registrado correctamente. ${slaText}</p>
      <div class="highlight">
        <strong>Asunto:</strong> ${params.subject}<br/>
        <strong>Ticket ID:</strong> ${params.ticketId}
      </div>
      ${renderAttachmentsHtml(attachments)}
      <p>Te llegará la respuesta a este correo. Si quieres agregar más información, simplemente responde este email.</p>
      <a href="${APP_URL}/dashboard/soporte/${params.ticketId}" class="btn">Ver mi ticket →</a>
    `),
  })
}

interface SupportReplyEmailParams {
  ticketId: string
  subject: string
  body: string
  customerEmail: string
  customerName: string
  staffName: string
  attachments?: AttachmentRef[]
}

export async function sendSupportReplyToCustomer(params: SupportReplyEmailParams) {
  const transporter = getTransporter()
  const attachments = params.attachments ?? []

  await transporter.sendMail({
    from: `Karta Soporte <${FROM}>`,
    to: params.customerEmail,
    replyTo: SUPPORT_INBOX,
    subject: `Re: ${params.subject} — Karta`,
    html: baseTemplate(`
      <h2>Respuesta de Karta</h2>
      <p>Hola <strong>${params.customerName.split(' ')[0]}</strong>,</p>
      <p>${params.staffName} del equipo de Karta te respondió:</p>
      <div class="highlight">${params.body.replace(/\n/g, '<br/>')}</div>
      ${renderAttachmentsHtml(attachments)}
      <p>Puedes responder este correo directamente o continuar la conversación en el panel.</p>
      <a href="${APP_URL}/dashboard/soporte/${params.ticketId}" class="btn">Ver el ticket →</a>
    `),
  })
}

export async function sendSupportReplyToInbox(params: SupportReplyEmailParams & { restaurantName: string }) {
  const transporter = getTransporter()
  const attachments = params.attachments ?? []

  await transporter.sendMail({
    from: `Karta Soporte <${FROM}>`,
    to: SUPPORT_INBOX,
    replyTo: params.customerEmail,
    subject: `[Respuesta cliente] ${params.subject} — ${params.restaurantName}`,
    html: baseTemplate(`
      <h2>El cliente respondió</h2>
      <div class="highlight">
        <strong>De:</strong> ${params.customerName} &lt;${params.customerEmail}&gt;<br/>
        <strong>Restaurante:</strong> ${params.restaurantName}<br/>
        <strong>Ticket ID:</strong> ${params.ticketId}
      </div>
      <p style="white-space:pre-wrap;background:#FAF7F2;padding:16px;border-radius:8px;">${params.body}</p>
      ${renderAttachmentsHtml(attachments)}
      <a href="${APP_URL}/admin/soporte" class="btn">Abrir el ticket →</a>
    `),
  })
}

interface SupportStatusEmailParams {
  ticketId: string
  subject: string
  customerEmail: string
  customerName: string
  newStatus: 'in_progress' | 'resolved'
}

const STATUS_HEADLINE: Record<SupportStatusEmailParams['newStatus'], string> = {
  in_progress: 'Tu ticket está en revisión',
  resolved: 'Marcamos tu ticket como resuelto',
}

const STATUS_BODY: Record<SupportStatusEmailParams['newStatus'], string> = {
  in_progress: 'Nuestro equipo ya está trabajando en tu solicitud. Te avisamos por correo en cuanto haya una respuesta.',
  resolved: 'Cerramos el ticket porque entendimos que tu consulta quedó resuelta. Si necesitas seguir conversando, responde este correo o abre uno nuevo.',
}

export async function sendSupportStatusChangeEmail(params: SupportStatusEmailParams) {
  const transporter = getTransporter()
  await transporter.sendMail({
    from: `Karta Soporte <${FROM}>`,
    to: params.customerEmail,
    replyTo: SUPPORT_INBOX,
    subject: `${STATUS_HEADLINE[params.newStatus]} — Karta`,
    html: baseTemplate(`
      <h2>${STATUS_HEADLINE[params.newStatus]}</h2>
      <p>Hola <strong>${params.customerName.split(' ')[0]}</strong>,</p>
      <p>${STATUS_BODY[params.newStatus]}</p>
      <div class="highlight">
        <strong>Ticket:</strong> ${params.subject}<br/>
        <strong>ID:</strong> ${params.ticketId}
      </div>
      <a href="${APP_URL}/dashboard/soporte/${params.ticketId}" class="btn">Ver ticket →</a>
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
