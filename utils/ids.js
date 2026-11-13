// Convierte el :id de la URL en un número entero positivo, o null si no es un id válido.
// Acepta solo dígitos (sin signos, decimales, notación científica ni ceros a la izquierda).
export function parsearId(texto) {
  if (typeof texto !== 'string' || !/^[1-9]\d{0,8}$/.test(texto)) return null;
  return Number(texto);
}