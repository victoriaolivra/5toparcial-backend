// Valida y limpia los datos del formulario de contacto. Función pura (sin Express ni base de datos).
const NOMBRE = { min: 2, max: 100 };
const MENSAJE = { min: 5, max: 2000 };

// Caracteres de control (invisibles, no son texto). En el mensaje se permiten salto de línea y tabulación.
const CONTROL = /[\u0000-\u001F\u007F]/;
const CONTROL_EN_MENSAJE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;

// Cuenta caracteres reales (un emoji cuenta 1), igual que MySQL con utf8mb4
const largo = (texto) => Array.from(texto).length;

function textoDe(valor) {
  return typeof valor === 'string' ? valor.trim() : '';
}

export function validarContacto(body) {
  const origen = body ?? {};
  const errores = {};

  const nombre = textoDe(origen.nombre);
  if (nombre === '') {
    errores.nombre = 'El nombre es obligatorio.';
  } else if (largo(nombre) < NOMBRE.min || largo(nombre) > NOMBRE.max) {
    errores.nombre = `El nombre debe tener entre ${NOMBRE.min} y ${NOMBRE.max} caracteres.`;
  } else if (CONTROL.test(nombre)) {
    errores.nombre = 'El nombre contiene caracteres no válidos.';
  }

  const telefono = textoDe(origen.telefono);
  const digitos = telefono.replace(/\D/g, '').length;
  if (telefono === '') {
    errores.telefono = 'El teléfono es obligatorio.';
  } else if (telefono.length > 30 || !/^[0-9+()\-.\s]+$/.test(telefono) || digitos < 6 || digitos > 15) {
    errores.telefono = 'Ingresá un teléfono válido, con entre 6 y 15 números (podés usar +, espacios y guiones).';
  }

  // Los saltos de línea de Windows (\r\n) se guardan como \n
  const mensaje = textoDe(origen.mensaje).replace(/\r\n?/g, '\n');
  if (mensaje === '') {
    errores.mensaje = 'El mensaje es obligatorio.';
  } else if (largo(mensaje) < MENSAJE.min || largo(mensaje) > MENSAJE.max) {
    errores.mensaje = `El mensaje debe tener entre ${MENSAJE.min} y ${MENSAJE.max} caracteres.`;
  } else if (CONTROL_EN_MENSAJE.test(mensaje)) {
    errores.mensaje = 'El mensaje contiene caracteres no válidos.';
  }

  return { datos: { nombre, telefono, mensaje }, errores, valido: Object.keys(errores).length === 0 };
}