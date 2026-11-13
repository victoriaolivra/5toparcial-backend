// Decide cómo quedan las 2 imágenes de una novedad al modificarla. Función pura (sin disco ni base).
//
//   actual: [img1, img2] tal como están guardadas hoy (null si no hay)
//   nuevas: [nombre1, nombre2] de los archivos recién subidos (null si no se subió)
//   quitar: [true/false, true/false] casillas "quitar esta imagen"
//
// Reglas por cada posición: si se subió una nueva, reemplaza; si no, y está tildado "quitar", se borra;
// si no, se conserva. Al final las imágenes se acomodan: si queda una sola, va siempre en img1.
// `aBorrar` son los archivos viejos que ya no se usan y hay que sacar del disco.
export function calcularImagenes(actual, { nuevas = [null, null], quitar = [false, false] } = {}) {
  const posiciones = [0, 1].map((i) => nuevas[i] ?? (quitar[i] ? null : actual[i] ?? null));
  const finales = posiciones.filter(Boolean);
  const aBorrar = actual.filter(Boolean).filter((nombre) => !finales.includes(nombre));

  return { img1: finales[0] ?? null, img2: finales[1] ?? null, aBorrar };
}