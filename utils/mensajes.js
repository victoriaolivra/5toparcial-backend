// Busca un mensaje fijo según una clave que viene de la URL (?ok=..., ?error=...).
// Solo mira claves propias de la lista: así "?ok=constructor" no devuelve nada raro.
export function mensajeDe(lista, clave) {
  return typeof clave === 'string' && Object.hasOwn(lista, clave) ? lista[clave] : null;
}