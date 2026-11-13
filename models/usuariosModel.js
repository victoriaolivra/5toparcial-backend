import pool from './bd.js';

export async function getUsuarioPorNombre(usuario) {
  const [filas] = await pool.query(
    'SELECT id, usuario, password_hash FROM usuarios WHERE usuario = ? LIMIT 1',
    [usuario]
  );
  return filas[0]; // undefined si no existe
}

export async function crearUsuario(usuario, passwordHash) {
  const [resultado] = await pool.query(
    'INSERT INTO usuarios (usuario, password_hash) VALUES (?, ?)',
    [usuario, passwordHash]
  );
  return resultado.insertId;
}

export async function cambiarClave(usuario, passwordHash) {
  const [resultado] = await pool.query(
    'UPDATE usuarios SET password_hash = ? WHERE usuario = ?',
    [passwordHash, usuario]
  );
  return resultado.affectedRows;
}