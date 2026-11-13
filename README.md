# Backend de Bakes Lourdes

API y panel de administración de la web de Bakes Lourdes (pastelería artesanal).

- **Novedades**: se cargan y modifican desde el panel (cada una con hasta 2 fotos) y la web las muestra.
- **Contacto**: los mensajes del formulario se guardan en la base de datos, se avisan por mail y se gestionan desde el panel.

**Tecnologías:** Node.js (20.19 o superior), Express 5, MySQL/MariaDB (`mysql2`), Nodemailer, hbs (panel), express-session, bcryptjs, multer.

## Qué necesitás tener instalado

- Node.js 20.19 o superior (`node -v` para verlo)
- XAMPP con MySQL (MariaDB)
- Mailpit (solo para ver los mails en desarrollo): https://github.com/axllent/mailpit/releases
  (bajá `mailpit-windows-amd64.zip` y descomprimilo, por ejemplo en `C:\mailpit`)

## Puesta en marcha (primera vez)

1. **Instalar paquetes**, dentro de la carpeta del backend:
   ```powershell
   npm install
   ```
2. **Crear el archivo `.env`**: copiá `.env.example` como `.env` y completá `SESSION_SECRET`.
   Para generar una clave:
   ```powershell
   node -p "require('crypto').randomBytes(32).toString('hex')"
   ```
3. **Crear la base de datos**: encendé MySQL en XAMPP, abrí http://localhost/phpmyadmin, andá a la pestaña
   *Importar* y subí, en este orden, `database/schema.sql` y después `database/datos-iniciales.sql`.
4. **Copiar las fotos iniciales** (`boxpapa1.jpeg`, `boxpapa2.jpeg`, `boxsanvalentin.jpeg`) a `public/uploads/`.
5. **Crear el usuario administrador** (te pide la contraseña, mínimo 8 caracteres):
   ```powershell
   npm run crear-admin -- admin
   ```
   Para cambiar la contraseña más adelante: `npm run crear-admin -- admin --cambiar-clave`

## Uso diario (desarrollo)

Se necesitan cuatro programas encendidos, cada uno en su propia terminal o ventana:

| Qué | Cómo | Dirección |
|---|---|---|
| MySQL | botón *Start* en XAMPP | — |
| Mailpit | `.\mailpit.exe` dentro de su carpeta | bandeja en http://localhost:8025 |
| Backend | `npm run dev` (en la carpeta del backend) | http://localhost:3001 |
| Frontend (React) | `npm start` (en la carpeta del frontend) | http://localhost:3000 |

- Panel de administración: http://localhost:3001/admin
- Al arrancar, el backend avisa si la base de datos o el correo no responden.

## API pública

| Método | Ruta | Qué hace |
|---|---|---|
| GET | `/api/novedades` | Lista de novedades, de la más nueva a la más vieja (con las URLs completas de las fotos) |
| POST | `/api/contacto` | Recibe `{ nombre, telefono, mensaje }`, lo guarda y avisa por mail |

Respuestas de `POST /api/contacto`: `201` guardado, `400` datos inválidos (con el detalle por campo),
`429` demasiados envíos (máximo 5 por hora por visitante), `500` error del servidor.

## Variables del `.env`

| Variable | Para qué sirve |
|---|---|
| `PORT` | Puerto del backend (3001) |
| `FRONTEND_ORIGIN` | Dirección del frontend; es la única que puede usar la API desde el navegador |
| `BACKEND_URL` | Dirección pública del backend (se usa para armar las URLs de las fotos) |
| `SESSION_SECRET` | Clave secreta de las sesiones del panel (mínimo 32 caracteres) |
| `MYSQL_HOST`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DB_NAME` | Conexión a la base (en XAMPP: root, sin contraseña) |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS` | Servidor de correo (en desarrollo, Mailpit) |
| `MAIL_FROM`, `MAIL_TO` | Quién figura como remitente y quién recibe los avisos (si `MAIL_TO` queda vacío, no se mandan mails) |
| `NODE_ENV`, `TRUST_PROXY` | Solo para publicar el sitio (ver abajo) |

## Estructura

```
app.js              arranque del servidor y orden de los middlewares
config.js           lectura y validación del .env
routes/             rutas (api.js = pública, admin/ = panel)
controllers/        lógica de POST /api/contacto
models/             consultas a la base de datos
middlewares/        sesión, cabeceras de seguridad, subida de imágenes
utils/              validaciones, mails, límites, utilidades
views/admin/        páginas del panel (hbs)
public/             estilos del panel y fotos subidas (uploads/)
database/           schema.sql y datos-iniciales.sql
scripts/            crearAdmin.js
```

## Seguridad: qué está resuelto

- Contraseñas con bcrypt; límite de 5 intentos fallidos de login cada 15 minutos por visitante.
- Sesión con cookie `httpOnly` y `sameSite`; cerrar sesión y borrar se hacen con POST.
- Consultas a la base siempre parametrizadas (sin inyección SQL).
- Fotos: solo JPG, PNG o WebP, máximo 5 MB, verificadas por su contenido real y con nombre aleatorio.
- Todo lo que escribe un visitante se muestra como texto (nunca como HTML), también en los mails.
- CORS limitado al frontend, cabeceras de seguridad y política estricta en el panel.

## Para publicar el sitio

1. Servilo siempre con **HTTPS** y poné en el `.env` del servidor `NODE_ENV=production`
   (activa la cookie "solo HTTPS" y HSTS). No lo uses en tu PC con http://localhost: no podrías iniciar sesión.
2. Poné `TRUST_PROXY=1` si el hosting tiene un proxy delante (lo más común); si no, el límite de envíos
   contaría a todos los visitantes como una sola persona.
3. Cambiá `FRONTEND_ORIGIN` y `BACKEND_URL` por las direcciones reales.
4. Cambiá la configuración de correo (`SMTP_*`, `MAIL_FROM`, `MAIL_TO`) por la de un servicio real.
5. En la base real, creá un usuario de MySQL propio con contraseña (no uses `root`).
6. En el frontend, poné `REACT_APP_API_URL` con la dirección real del backend y generá la versión final con `npm run build`.
7. Hacé copias de seguridad de la base de datos y de la carpeta `public/uploads/`.

Limitación conocida: las sesiones se guardan en memoria, así que al reiniciar el servidor hay que volver a iniciar sesión en el panel.

## Problemas frecuentes

- **"No se pudo conectar a la base de datos"**: encendé MySQL en XAMPP y revisá `MYSQL_*` en el `.env`.
- **El mensaje se guarda pero no llega el mail**: Mailpit no estaba abierto. El mensaje igual está en el panel de Contactos.
- **Las novedades no se ven en la web**: el backend tiene que estar encendido y `REACT_APP_API_URL` apuntando a él
  (después de cambiar el `.env` del frontend hay que reiniciar `npm start`).
- **`Missing script: "dev"`**: estás en la carpeta equivocada; entrá a la del backend (donde está `package.json`).