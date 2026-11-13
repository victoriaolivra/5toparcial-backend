// Convierte una fila de la tabla `novedades` en lo que ve el público (el frontend):
// en vez de img1 / img2 con nombres de archivo, una lista `imagenes` con URLs completas.
// Son funciones puras (sin base de datos ni Express), por eso es fácil probarlas.

// Una novedad por id (undefined si no existe)
export async function getNovedadPorId(id) {
  const [filas] = await pool.query(
    'SELECT id, titulo, subtitulo, cuerpo, img1, img2 FROM novedades WHERE id = ? LIMIT 1',
    [id]
  );
  return filas[0];
}

// Actualiza los textos y las imágenes de una novedad
export async function updateNovedad(id, { titulo, subtitulo, cuerpo, img1, img2 }) {
  await pool.query(
    'UPDATE novedades SET titulo = ?, subtitulo = ?, cuerpo = ?, img1 = ?, img2 = ? WHERE id = ?',
    [titulo, subtitulo, cuerpo, img1, img2, id]
  );
}

export function urlImagen(nombre, baseUrl) {
  return `${baseUrl}/uploads/${encodeURIComponent(nombre)}`;
}

export function aNovedadPublica(fila, baseUrl) {
  const imagenes = [fila.img1, fila.img2]
    .filter((nombre) => typeof nombre === 'string' && nombre.trim() !== '')
    .map((nombre) => urlImagen(nombre, baseUrl));

  return {
    id: fila.id,
    titulo: fila.titulo,
    subtitulo: fila.subtitulo,
    cuerpo: fila.cuerpo,
    imagenes,
  };
}