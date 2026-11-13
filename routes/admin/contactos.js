// Panel de contactos: mensajes que llegan desde el formulario de la web (requiere sesión, ver app.js).
import { Router } from 'express';
import { getContactos, getContactoPorId, setLeido, deleteContacto } from '../../models/contactosModel.js';
import { aContactoVista, normalizarFiltro, urlLista } from '../../utils/contactosVista.js';
import { parsearId } from '../../utils/ids.js';
import { mensajeDe } from '../../utils/mensajes.js';

const router = Router();

// Marca la sección activa del menú
router.use((req, res, next) => {
  res.locals.enContactos = true;
  next();
});

const MENSAJES_OK = {
  eliminado: 'Contacto eliminado correctamente.',
};
const MENSAJES_ERROR = {
  noexiste: 'Ese contacto no existe (quizás ya fue eliminado).',
};

const LIMITE = 200;

// Devuelve el contacto del :id de la URL, o undefined si el id es inválido o no existe
async function cargarContacto(idTexto) {
  const id = parsearId(idTexto);
  return id === null ? undefined : getContactoPorId(id);
}

// GET /admin/contactos[?filtro=sinleer] -> listado
router.get('/', async (req, res) => {
  const filtro = normalizarFiltro(req.query.filtro);
  // Se pide uno más que el límite para saber si hay mensajes que no se muestran
  const filas = await getContactos({ soloNoLeidos: filtro === 'sinleer', limite: LIMITE + 1 });
  const contactos = filas.slice(0, LIMITE).map((fila) => aContactoVista(fila, filtro));

  res.render('admin/contactos', {
    layout: 'admin/layout',
    titulo: 'Contactos',
    nombre: req.session.nombre,
    mensaje: mensajeDe(MENSAJES_OK, req.query.ok),
    mensajeError: mensajeDe(MENSAJES_ERROR, req.query.error),
    contactos,
    filtroTodos: filtro === 'todos',
    filtroSinLeer: filtro === 'sinleer',
    hayMas: filas.length > LIMITE,
    limite: LIMITE,
    textoVacio: filtro === 'sinleer' ? 'No hay mensajes sin leer.' : 'Todavía no llegó ningún mensaje.',
  });
});

// POST /admin/contactos/:id/leido -> marca como leído (valor=1) o como no leído (valor=0)
router.post('/:id/leido', async (req, res) => {
  const filtro = normalizarFiltro(req.body?.filtro);
  const contacto = await cargarContacto(req.params.id);
  if (!contacto) return res.redirect(urlLista(filtro, { error: 'noexiste' }));

  await setLeido(contacto.id, req.body?.valor === '1');
  res.redirect(urlLista(filtro));
});

// GET /admin/contactos/:id/eliminar -> página de confirmación (no borra nada)
router.get('/:id/eliminar', async (req, res) => {
  const filtro = normalizarFiltro(req.query.filtro);
  const contacto = await cargarContacto(req.params.id);
  if (!contacto) return res.redirect(urlLista(filtro, { error: 'noexiste' }));

  res.render('admin/eliminar-contacto', {
    layout: 'admin/layout',
    titulo: 'Eliminar contacto',
    nombre: req.session.nombre,
    contacto: aContactoVista(contacto, filtro),
  });
});

// POST /admin/contactos/:id/eliminar -> borra el contacto
router.post('/:id/eliminar', async (req, res) => {
  const filtro = normalizarFiltro(req.body?.filtro);
  const contacto = await cargarContacto(req.params.id);
  if (!contacto) return res.redirect(urlLista(filtro, { error: 'noexiste' }));

  await deleteContacto(contacto.id);
  res.redirect(urlLista(filtro, { ok: 'eliminado' }));
});

export default router;