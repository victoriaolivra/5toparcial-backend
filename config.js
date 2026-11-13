// Carga el archivo .env y valida la configuración UNA sola vez, al arrancar.
// El resto de la app importa `config` desde acá y no lee process.env directamente.
import 'dotenv/config';
import { leerTrustProxy } from './utils/proxy.js';

function salirConError(...lineas) {
  for (const linea of lineas) console.error(linea);
  process.exit(1);
}

const requeridas = ['MYSQL_HOST', 'MYSQL_USER', 'MYSQL_DB_NAME'];
const faltantes = requeridas.filter((nombre) => !process.env[nombre]);
if (faltantes.length > 0) {
  salirConError(
    `Faltan variables en el archivo .env: ${faltantes.join(', ')}`,
    'Copiá .env.example a .env y completalo.'
  );
}

const port = Number(process.env.PORT || 3001);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  salirConError(`PORT inválido en .env: "${process.env.PORT}"`);
}

// Clave con la que se firman las cookies de sesión: tiene que ser larga y secreta
const sessionSecret = process.env.SESSION_SECRET ?? '';
if (sessionSecret.length < 32) {
  salirConError(
    'Falta SESSION_SECRET en .env, o tiene menos de 32 caracteres.',
    `Generá una con: node -p "require('crypto').randomBytes(32).toString('hex')"`
  );
}

// ---- Producción y proxy
const produccion = process.env.NODE_ENV === 'production';
const trustProxy = leerTrustProxy(process.env.TRUST_PROXY);
if (trustProxy === null) {
  salirConError(`TRUST_PROXY inválido en .env: "${process.env.TRUST_PROXY}". Tiene que ser un número (0 si no hay proxy).`);
}

// ---- Correo (SMTP). Por defecto apunta a Mailpit: puerto 1025, sin usuario ni contraseña
const smtpPort = Number(process.env.SMTP_PORT || 1025);
if (!Number.isInteger(smtpPort) || smtpPort < 1 || smtpPort > 65535) {
  salirConError(`SMTP_PORT inválido en .env: "${process.env.SMTP_PORT}"`);
}

const smtpSecure = (process.env.SMTP_SECURE || 'false').toLowerCase();
if (!['true', 'false'].includes(smtpSecure)) {
  salirConError(`SMTP_SECURE debe ser true o false (está en "${process.env.SMTP_SECURE}")`);
}

const smtpUser = process.env.SMTP_USER || '';
const smtpPass = process.env.SMTP_PASS || '';
if (Boolean(smtpUser) !== Boolean(smtpPass)) {
  salirConError('SMTP_USER y SMTP_PASS van juntos: completá los dos o dejá los dos vacíos.');
}

// MAIL_TO es opcional: si falta, el correo queda desactivado (los contactos se guardan igual)
const mailTo = (process.env.MAIL_TO || '').trim();
if (mailTo !== '' && !/^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/.test(mailTo)) {
  salirConError(`MAIL_TO inválido en .env: "${mailTo}". Tiene que ser una sola dirección de correo.`);
}

export const config = {
  port,
  frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://localhost:3000',
  // Dirección pública del backend: se usa para armar las URLs de las imágenes
  backendUrl: (process.env.BACKEND_URL || `http://localhost:${port}`).replace(/\/+$/, ''),
  sessionSecret,
    produccion,
  trustProxy,
  mysql: {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    // En XAMPP por defecto la contraseña de root está vacía
    password: process.env.MYSQL_PASSWORD ?? '',
    database: process.env.MYSQL_DB_NAME,
  },
  smtp: {
    host: process.env.SMTP_HOST || '127.0.0.1',
    port: smtpPort,
    secure: smtpSecure === 'true',
    user: smtpUser,
    pass: smtpPass,
  },
  mailFrom: (process.env.MAIL_FROM || '').trim() || 'Bakes Lourdes <web@bakeslourdes.local>',
  mailTo,
};