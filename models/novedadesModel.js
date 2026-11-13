import pool from './bd.js';

// Todas las novedades, de la más nueva a la más vieja
export async function getNovedades() {
  const [filas] = await pool.query(
    'SELECT id, titulo, subtitulo, cuerpo, img1, img2 FROM novedades ORDER BY id DESC'
  );
  return filas;
}

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

// Elimina una novedad. Devuelve true si existía y se borró, false si ya no estaba.
export async function deleteNovedad(id) {
  const [resultado] = await pool.query('DELETE FROM novedades WHERE id = ?', [id]);
  return resultado.affectedRows > 0;
}

// Guarda una novedad nueva. Se nombran las columnas una por una (no se inserta "lo que venga del formulario").
export async function insertNovedad({ titulo, subtitulo, cuerpo, img1, img2 }) {
  const [resultado] = await pool.query(
    'INSERT INTO novedades (titulo, subtitulo, cuerpo, img1, img2) VALUES (?, ?, ?, ?, ?)',
    [titulo, subtitulo, cuerpo, img1, img2]
  );
  return resultado.insertId;
}