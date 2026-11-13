// Formatea una fecha para mostrarla en el panel (día/mes/año hora:minutos).
// MariaDB guarda la fecha en la hora de la computadora del servidor y Node la lee con esa misma hora,
// así que se muestra tal cual, sin convertir de zona horaria.
export function formatearFecha(fecha) {
  if (!(fecha instanceof Date) || Number.isNaN(fecha.getTime())) return '';
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(fecha);
}