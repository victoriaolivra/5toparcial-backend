// Valida y limpia los textos de una novedad. Función pura (sin Express ni base de datos).
const LIMITES = { titulo: 150, subtitulo: 250, cuerpo: 3000 };
const NOMBRES = { titulo: 'El título', subtitulo: 'El subtítulo', cuerpo: 'El texto' };

// Cuenta caracteres reales (un emoji cuenta 1), igual que MySQL con utf8mb4
const largo = (texto) => Array.from(texto).length;

export function validarNovedad(body) {
  const origen = body ?? {};
  const datos = {};
  const errores = {};

  for (const campo of Object.keys(LIMITES)) {
    const valor = typeof origen[campo] === 'string' ? origen[campo].trim() : '';
    datos[campo] = valor;

    if (valor === '') {
      errores[campo] = `${NOMBRES[campo]} es obligatorio.`;
    } else if (largo(valor) > LIMITES[campo]) {
      errores[campo] = `${NOMBRES[campo]} no puede superar los ${LIMITES[campo]} caracteres.`;
    }
  }

  return { datos, errores, valido: Object.keys(errores).length === 0 };
}