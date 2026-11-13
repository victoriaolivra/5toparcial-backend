// Crea el usuario administrador (o le cambia la contraseña).
//   node scripts/crearAdmin.js <usuario>
//   node scripts/crearAdmin.js <usuario> --cambiar-clave
import pool from '../models/bd.js';
import { getUsuarioPorNombre, crearUsuario, cambiarClave } from '../models/usuariosModel.js';
import { hashearClave } from '../utils/clave.js';
import { pedirClave } from '../utils/pedirClave.js';
import { validarUsuario, validarClave } from '../utils/validaciones.js';

const argumentos = process.argv.slice(2);
const quiereCambiarClave = argumentos.includes('--cambiar-clave');
const usuario = argumentos.find((a) => !a.startsWith('--'));

async function main() {
  if (!usuario) {
    console.error('Uso: node scripts/crearAdmin.js <usuario> [--cambiar-clave]');
    return 1;
  }

  const errorUsuario = validarUsuario(usuario);
  if (errorUsuario) {
    console.error(errorUsuario);
    return 1;
  }

  const existente = await getUsuarioPorNombre(usuario);
  if (existente && !quiereCambiarClave) {
    console.error(`El usuario "${usuario}" ya existe. Si querés cambiarle la contraseña, agregá --cambiar-clave.`);
    return 1;
  }
  if (!existente && quiereCambiarClave) {
    console.error(`El usuario "${usuario}" no existe. Para crearlo, ejecutá el comando sin --cambiar-clave.`);
    return 1;
  }

  const clave = await pedirClave('Contraseña (mínimo 8 caracteres): ');
  const errorClave = validarClave(clave);
  if (errorClave) {
    console.error(errorClave);
    return 1;
  }
  const repetida = await pedirClave('Repetí la contraseña: ');
  if (clave !== repetida) {
    console.error('Las contraseñas no coinciden. No se guardó nada.');
    return 1;
  }

  const hash = await hashearClave(clave);
  if (existente) {
    await cambiarClave(usuario, hash);
    console.log(`Contraseña actualizada para "${usuario}".`);
  } else {
    await crearUsuario(usuario, hash);
    console.log(`Usuario "${usuario}" creado.`);
  }
  return 0;
}

try {
  process.exitCode = await main();
} catch (error) {
  console.error(error.code === 'ER_DUP_ENTRY' ? 'Ese usuario ya existe.' : `Error: ${error.message}`);
  process.exitCode = 1;
} finally {
  await pool.end();
}