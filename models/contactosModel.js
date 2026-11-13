import pool from './bd.js';

// Guarda un mensaje del formulario de contacto. Devuelve el id nuevo.
export async function insertContacto({ nombre, telefono, mensaje }) {
  const [resultado] = await pool.query(
    'INSERT INTO contactos (nombre, telefono, mensaje) VALUES (?, ?, ?)',
    [nombre, telefono, mensaje]
  );
  return resultado.insertId;
}

// Los más recientes primero. Con soloNoLeidos trae únicamente los que todavía no se marcaron como leídos.
export async function getContactos({ soloNoLeidos = false, limite = 200 } = {}) {
  const donde = soloNoLeidos ? 'WHERE leido = 0' : '';
  const [filas] = await pool.query(
    `SELECT id, nombre, telefono, mensaje, leido, creado_en FROM contactos ${donde}
     ORDER BY creado_en DESC, id DESC LIMIT ?`,
    [limite]
  );
  return filas;
}

export async function getContactoPorId(id) {
  const [filas] = await pool.query(
    'SELECT id, nombre, telefono, mensaje, leido, creado_en FROM contactos WHERE id = ? LIMIT 1',
    [id]
  );
  return filas[0]; // undefined si no existe
}

export async function contarNoLeidos() {
  const [[fila]] = await pool.query('SELECT COUNT(*) AS total FROM contactos WHERE leido = 0');
  return fila.total;
}

export async function setLeido(id, leido) {
  await pool.query('UPDATE contactos SET leido = ? WHERE id = ?', [leido ? 1 : 0, id]);
}

export async function deleteContacto(id) {
  const [resultado] = await pool.query('DELETE FROM contactos WHERE id = ?', [id]);
  return resultado.affectedRows > 0;
}