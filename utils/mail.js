// Envío de mails con Nodemailer. En desarrollo apunta a Mailpit (no manda nada real).
import nodemailer from 'nodemailer';
import { config } from '../config.js';
import { armarMailContacto } from './armarMail.js';

// Sin MAIL_TO no hay a quién avisar: el correo queda desactivado (los contactos se guardan igual)
const transporte = config.mailTo
  ? nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.secure,
      auth: config.smtp.user ? { user: config.smtp.user, pass: config.smtp.pass } : undefined,
      // Si el servidor de correo no responde, falla rápido en vez de colgarse
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      socketTimeout: 10000,
    })
  : null;

// Avisa a la pastelería que llegó un contacto nuevo
export async function enviarAvisoContacto(datos) {
  if (!transporte) return;
  await transporte.sendMail(armarMailContacto(datos, { de: config.mailFrom, para: config.mailTo }));
}

// Se usa al arrancar para avisar en la consola si el correo está bien configurado
export async function verificarCorreo() {
  if (!transporte) {
    console.warn('Correo: desactivado (falta MAIL_TO en .env). Los contactos se guardan, pero no se avisa por mail.');
    return;
  }
  try {
    await transporte.verify();
    console.log(`Correo: servidor SMTP OK (${config.smtp.host}:${config.smtp.port}), avisos a ${config.mailTo}`);
  } catch (error) {
    console.warn(
      `Correo: NO se pudo conectar al servidor SMTP (${error.code ?? error.message}). ` +
        '¿Está Mailpit abierto? Revisá SMTP_HOST y SMTP_PORT. Los contactos se guardan igual.'
    );
  }
}