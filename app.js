import express from 'express';
import cors from 'cors';
import session from 'express-session';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { config } from './config.js';
import pool from './models/bd.js';
import { verificarCorreo } from './utils/mail.js';
import { requiereLogin, sinCache } from './middlewares/autenticacion.js';
import { cargarNoLeidos } from './middlewares/contadores.js';
import { cabecerasSeguridad } from './middlewares/seguridad.js';
import apiRouter from './routes/api.js';
import loginRouter from './routes/admin/login.js';
import novedadesAdminRouter from './routes/admin/novedades.js';
import contactosAdminRouter from './routes/admin/contactos.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.disable('x-powered-by');


// Detrás de un proxy (hosting, nginx) hay que decirle a Express cuántos hay; si no, req.ip sería la del proxy
// y el límite de intentos contaría a todos los visitantes como una sola persona.
if (config.trustProxy > 0) app.set('trust proxy', config.trustProxy);

app.use(cabecerasSeguridad({ produccion: config.produccion }));

// Motor de vistas (hbs) para el panel de administración
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(express.json({ limit: '20kb' }));
app.use(express.urlencoded({ extended: false, limit: '20kb' }));
app.use(express.static(path.join(__dirname, 'public')));

// ---- API pública (la consume el frontend de React) ----
// CORS: solo el frontend configurado en FRONTEND_ORIGIN puede leer la API desde el navegador
app.use('/api', cors({ origin: config.frontendOrigin, methods: ['GET', 'POST'] }));
app.use('/api', apiRouter);

// ---- Panel de administración (con sesión) ----
// Las sesiones se guardan en memoria: si reiniciás el servidor, hay que volver a ingresar.
app.use(
  '/admin',
  session({
    name: 'bakes.sid',
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false, // no crea sesión hasta que alguien inicia sesión
    cookie: {
      httpOnly: true, // el JavaScript de la página no puede leer la cookie
      sameSite: 'lax', // el navegador no la manda en formularios que vienen de otros sitios
      secure: config.produccion, // en producción (con HTTPS) la cookie solo viaja cifrada
      maxAge: 8 * 60 * 60 * 1000, // 8 horas
    },
  })
);
app.use('/admin', sinCache);
app.use('/admin', cargarNoLeidos); // el número de contactos sin leer que se ve en el menú
app.use('/admin', loginRouter); // /admin/login y /admin/logout (públicas)
app.get('/admin', (req, res) => res.redirect('/admin/novedades'));
app.use('/admin/novedades', requiereLogin, novedadesAdminRouter);
app.use('/admin/contactos', requiereLogin, contactosAdminRouter);

// 404: ninguna ruta coincidió
app.use((req, res) => {
  res.status(404).json({ error: true, message: 'No encontrado' });
});

// Manejo de errores: en Express 5 los errores de funciones async llegan acá solos
app.use((err, req, res, next) => {
  console.error(err);
  if (res.headersSent) return next(err);

  const status = err.status >= 400 && err.status < 600 ? err.status : 500;
  res.status(status).json({
    error: true,
    message: status < 500 ? 'Solicitud inválida' : 'Error interno del servidor',
  });
});

const server = app.listen(config.port, async () => {
  console.log(`Servidor escuchando en http://localhost:${config.port}`);
  try {
    await pool.query('SELECT 1');
    console.log('Base de datos: conexión OK');
  } catch (error) {
    // No cortamos el servidor: /api/salud va a informar el problema
    const pistas = {
      ECONNREFUSED: '¿Está MySQL encendido en XAMPP? Revisá también MYSQL_HOST.',
      ER_ACCESS_DENIED_ERROR: 'Usuario o contraseña rechazados: revisá MYSQL_USER y MYSQL_PASSWORD.',
      ER_BAD_DB_ERROR: 'La base no existe: revisá MYSQL_DB_NAME o importá database/schema.sql.',
    };
    const codigo = error.code ?? error.message;
    console.error(`Base de datos: NO se pudo conectar (${codigo}). ${pistas[error.code] ?? ''}`);
  }
    await verificarCorreo();
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`El puerto ${config.port} ya está en uso. Cerrá el otro servidor o cambiá PORT en .env`);
  } else {
    console.error(error);
  }
  process.exit(1);
});

// Cierre ordenado con Ctrl+C
async function cerrar() {
  server.close();
  try {
    await pool.end();
  } catch {
    // si ya estaba cerrado, no importa
  }
  process.exit(0);
}
process.on('SIGINT', cerrar);
process.on('SIGTERM', cerrar);

export default app;