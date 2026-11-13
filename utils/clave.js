// Hash y comparación de contraseñas con bcrypt (bcryptjs: JavaScript puro, sin compilar nada en Windows).
import bcrypt from 'bcryptjs';

const COSTO = 12; // cuanto más alto, más lento de adivinar (y más lento de verificar)

export function hashearClave(clave) {
  return bcrypt.hash(clave, COSTO);
}

export function compararClave(clave, hash) {
  return bcrypt.compare(clave, hash);
}

// Hash de relleno: cuando el usuario no existe igual comparamos contra este,
// para que la respuesta tarde lo mismo y no se pueda descubrir qué usuarios existen.
export const HASH_FALSO = bcrypt.hashSync('relleno-para-igualar-tiempos', COSTO);