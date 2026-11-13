// Panel de novedades (requiere sesión iniciada, ver app.js).
import { Router } from 'express';
import {
  getNovedades,
  getNovedadPorId,
  insertNovedad,
  updateNovedad,
  deleteNovedad,
} from '../../models/novedadesModel.js';
import { recibirImagenes } from '../../middlewares/subidas.js';
import { borrarArchivos, verificarImagenes } from '../../utils/imagenes.js';
import { calcularImagenes } from '../../utils/imagenesNovedad.js';
import { parsearId } from '../../utils/ids.js';
import { mensajeDe } from '../../utils/mensajes.js';
import { aNovedadPublica, urlImagen } from '../../utils/novedadPublica.js';
import { resumir } from '../../utils/texto.js';
import { validarNovedad } from '../../utils/validarNovedad.js';

const router = Router();

// Marca la sección activa del menú
router.use((req, res, next) => {
  res.locals.enNovedades = true;
  next();
});

const MENSAJES_OK = {
  adcreada: 'Novedad creada correctamente.',
  modificada: 'Noved modificada correctamente.',
  eliminada: 'Novedad eliminada correctamente.',
};
const MENSAJES_ERROR = {
  noexiste: 'La novedad que buscabas no existe (quizás ya fue eliminada).',
};


// GET /admin/novedades -> listado
router.get('/', async (req, res) => {
  const filas = await getNovedades();

  const novedades = filas.map((fila) => ({
    // baseUrl vacía: dentro del panel las imágenes se piden al mismo servidor (/uploads/...)
    ...aNovedadPublica(fila, ''),
    resumen: resumir(fila.cuerpo, 140),
  }));

  res.render('admin/novedades', {
    layout: 'admin/layout',
    titulo: 'Novedades',
    nombre: req.session.nombre,
    mensaje: mensajeDe(MENSAJES_OK, req.query.ok), // solo textos de esta lista, nunca lo que escriba la URL
    mensajeError: mensajeDe(MENSAJES_ERROR, req.query.error),
    novedades,
    total: `${novedades.length} novedad${novedades.length === 1 ? '' : 'es'}`,
  });
});

// ---------------------------------------------------------------- agregar

function mostrarFormulario(req, res, datos = {}) {
  res.render('admin/agregar', {
    layout: 'admin/layout',
    titulo: 'Agregar novedad',
    nombre: req.session.nombre,
    ...datos,
  });
}

// GET /admin/novedades/agregar -> formulario vacío
router.get('/agregar', (req, res) => {
  mostrarFormulario(req, res);
});

// POST /admin/novedades/agregar -> guarda la novedad
router.post('/agregar', recibirImagenes, async (req, res) => {
  const subidas = [req.files?.imagen1?.[0], req.files?.imagen2?.[0]].filter(Boolean);
  const nombresSubidos = subidas.map((archivo) => archivo.filename);

  try {
    const { datos, errores, valido } = validarNovedad(req.body);
    // Si la subida ya falló, los errores de los textos no son confiables (el formulario llegó incompleto)
    const errorImagenes = req.errorSubida ?? (await verificarImagenes(subidas));

    if (!valido || errorImagenes) {
      await borrarArchivos(nombresSubidos); // no dejamos imágenes huérfanas en el disco
      res.status(400);
      return mostrarFormulario(req, res, {
        form: datos, // dentro de "form" para no pisar el `titulo` de la página
        errores: req.errorSubida ? {} : errores,
        errorImagenes,
      });
    }

    await insertNovedad({
      ...datos,
      img1: nombresSubidos[0] ?? null, // si solo hay una imagen, va siempre en img1
      img2: nombresSubidos[1] ?? null,
    });
    res.redirect('/admin/novedades?ok=creada');
  } catch (error) {
    await borrarArchivos(nombresSubidos); // falló la base: tampoco dejamos las imágenes
    throw error;
  }
});

// -------------------------------------------------------------- modificar

// Devuelve la novedad del :id de la URL, o undefined si el id es inválido o no existe
async function cargarNovedad(idTexto) {
  const id = parsearId(idTexto);
  return id === null ? undefined : getNovedadPorId(id);
}

function mostrarFormularioModificar(req, res, novedad, datos = {}) {
  res.render('admin/modificar', {
    layout: 'admin/layout',
    titulo: 'Modificar novedad',
    nombre: req.session.nombre,
    id: novedad.id,
    // Las dos posiciones siempre, para mostrar la imagen actual (si hay) y el campo de archivo
    slots: [novedad.img1, novedad.img2].map((nombre, i) => ({
      n: i + 1,
      url: nombre ? urlImagen(nombre, '') : null,
    })),
    form: { titulo: novedad.titulo, subtitulo: novedad.subtitulo, cuerpo: novedad.cuerpo },
    ...datos,
  });
}

// GET /admin/novedades/:id/modificar -> formulario con los datos actuales
router.get('/:id/modificar', async (req, res) => {
  const novedad = await cargarNovedad(req.params.id);
  if (!novedad) return res.redirect('/admin/novedades?error=noexiste');
  mostrarFormularioModificar(req, res, novedad);
});

// POST /admin/novedades/:id/modificar -> guarda los cambios
router.post('/:id/modificar', recibirImagenes, async (req, res) => {
  const subidas = [req.files?.imagen1?.[0], req.files?.imagen2?.[0]];
  const nombresSubidos = subidas.filter(Boolean).map((archivo) => archivo.filename);
  let guardado = false; // una vez guardado en la base, las imágenes nuevas ya NO se pueden borrar

  try {
    const novedad = await cargarNovedad(req.params.id);
    if (!novedad) {
      await borrarArchivos(nombresSubidos);
      return res.redirect('/admin/novedades?error=noexiste');
    }

    const { datos, errores, valido } = validarNovedad(req.body);
    const errorImagenes = req.errorSubida ?? (await verificarImagenes(subidas.filter(Boolean)));

    if (!valido || errorImagenes) {
      await borrarArchivos(nombresSubidos);
      res.status(400);
      return mostrarFormularioModificar(req, res, novedad, {
        // Si el formulario llegó incompleto por la subida, completamos con lo que ya tenía la novedad
        form: req.errorSubida
          ? {
              titulo: datos.titulo || novedad.titulo,
              subtitulo: datos.subtitulo || novedad.subtitulo,
              cuerpo: datos.cuerpo || novedad.cuerpo,
            }
          : datos,
        errores: req.errorSubida ? {} : errores,
        errorImagenes,
      });
    }

    const { img1, img2, aBorrar } = calcularImagenes([novedad.img1, novedad.img2], {
      nuevas: [subidas[0]?.filename ?? null, subidas[1]?.filename ?? null],
      quitar: [req.body?.quitar1 === '1', req.body?.quitar2 === '1'],
    });

    await updateNovedad(novedad.id, { ...datos, img1, img2 });
    guardado = true;

    // Recién ahora, con la base ya actualizada, sacamos del disco las imágenes que dejaron de usarse.
    // Si esto falla no es grave (queda un archivo suelto): no le mostramos un error al usuario.
    try {
      await borrarArchivos(aBorrar);
    } catch (error) {
      console.error('No se pudieron borrar imágenes viejas:', error.code ?? error.message);
    }
    res.redirect('/admin/novedades?ok=modificada');
  } catch (error) {
    if (!guardado) await borrarArchivos(nombresSubidos);
    throw error;
  }
});

// --------------------------------------------------------------- eliminar

// GET /admin/novedades/:id/eliminar -> página de confirmación (no borra nada)
router.get('/:id/eliminar', async (req, res) => {
  const novedad = await cargarNovedad(req.params.id);
  if (!novedad) return res.redirect('/admin/novedades?error=noexiste');

  res.render('admin/eliminar', {
    layout: 'admin/layout',
    titulo: 'Eliminar novedad',
    nombre: req.session.nombre,
    novedad: aNovedadPublica(novedad, ''),
  });
});

// POST /admin/novedades/:id/eliminar -> borra la novedad y sus imágenes
// Es POST (no un link GET) para que nadie pueda borrar novedades con solo hacerte abrir una dirección.
router.post('/:id/eliminar', async (req, res) => {
  const novedad = await cargarNovedad(req.params.id);
  if (!novedad) return res.redirect('/admin/novedades?error=noexiste');

  // Primero la base: si falla, no se toca ningún archivo y la novedad queda completa
  await deleteNovedad(novedad.id);

  // Después las imágenes. Si falla el borrado queda un archivo suelto, pero no es un error para el usuario.
  try {
    await borrarArchivos([novedad.img1, novedad.img2]);
  } catch (error) {
    console.error('No se pudieron borrar imágenes de la novedad eliminada:', error.code ?? error.message);
  }
  res.redirect('/admin/novedades?ok=eliminada');
});

export default router;