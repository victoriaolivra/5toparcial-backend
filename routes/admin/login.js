import { Router } from 'express';
import { getUsuarioPorNombre } from '../../models/usuariosModel.js';
import { compararClave, HASH_FALSO } from '../../utils/clave.js';
import { crearLimitador } from '../../utils/limitadorIntentos.js';

const router = Router();

// Máximo 5 intentos fallidos por IP cada 15 minutos
const limitador = crearLimitador({ maximo: 5, ventanaMs: 15 * 60 * 1000 });

function mostrarLogin(res, datos = {}) {
  res.render('admin/login', { layout: 'admin/layout', titulo: 'Ingresar', ...datos });
}

// Las operaciones de sesión del store son con callback: las convertimos a promesas
const regenerar = (req) => new Promise((ok, fallo) => req.session.regenerate((e) => (e ? fallo(e) : ok())));
const guardar = (req) => new Promise((ok, fallo) => req.session.save((e) => (e ? fallo(e) : ok())));

router.get('/login', (req, res) => {
  if (req.session.idUsuario) return res.redirect('/admin/novedades');
  mostrarLogin(res);
});

router.post('/login', async (req, res) => {
  const espera = limitador.segundosRestantes(req.ip);
  if (espera > 0) {
    res.status(429);
    return mostrarLogin(res, {
      error: `Demasiados intentos fallidos. Probá de nuevo en ${Math.ceil(espera / 60)} minuto(s).`,
    });
  }

  const { usuario, password } = req.body ?? {};
  const formatoValido =
    typeof usuario === 'string' &&
    typeof password === 'string' &&
    usuario.length > 0 &&
    usuario.length <= 50 &&
    password.length > 0 &&
    Buffer.byteLength(password, 'utf8') <= 72;

  let fila;
  let coincide = false;
  if (formatoValido) {
    fila = await getUsuarioPorNombre(usuario);
    // Si el usuario no existe comparamos contra un hash de relleno (mismo tiempo de respuesta)
    coincide = await compararClave(password, fila ? fila.password_hash : HASH_FALSO);
  }

  if (!fila || !coincide) {
    limitador.registrarFallo(req.ip);
    res.status(401);
    // Mismo mensaje para "usuario inexistente" y "contraseña incorrecta"
    return mostrarLogin(res, {
      error: 'Usuario o contraseña incorrectos.',
      usuario: typeof usuario === 'string' ? usuario.slice(0, 50) : '',
    });
  }

  limitador.limpiar(req.ip);
  // Sesión nueva al iniciar sesión: evita que alguien reutilice un identificador de sesión previo
  await regenerar(req);
  req.session.idUsuario = fila.id;
  req.session.nombre = fila.usuario;
  await guardar(req);
  res.redirect('/admin/novedades');
});

// Cerrar sesión es POST (no un link GET) para que otra página no pueda dispararlo
router.post('/logout', (req, res, next) => {
  req.session.destroy((error) => {
    if (error) return next(error);
    res.clearCookie('bakes.sid');
    res.redirect('/admin/login');
  });
});

export default router;