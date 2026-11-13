// Validaciones de usuario y contraseña. Devuelven un texto de error, o null si está bien.

export function validarUsuario(valor) {
  if (typeof valor !== 'string' || !/^[A-Za-z0-9._-]{3,50}$/.test(valor)) {
    return 'El usuario debe tener entre 3 y 50 caracteres: letras, números, punto, guion o guion bajo.';
  }
  return null;
}

export function validarClave(valor) {
  if (typeof valor !== 'string' || valor === '') {
    return 'La contraseña es obligatoria.';
  }
  if (valor.length < 8) {
    return 'La contraseña debe tener al menos 8 caracteres.';
  }
  // bcrypt solo usa los primeros 72 bytes: más que eso se ignoraría en silencio
  if (Buffer.byteLength(valor, 'utf8') > 72) {
    return 'La contraseña no puede superar los 72 bytes (límite de bcrypt).';
  }
  return null;
}