// Prepara los contactos para mostrarlos en el panel. Funciones puras (sin Express ni base de datos).
import { formatearFecha } from './fecha.js';

// Solo hay dos filtros posibles; cualquier otra cosa en la URL se trata como "todos"
export function normalizarFiltro(valor) {
  return valor === 'sinleer' ? 'sinleer' : 'todos';
}

// Dirección del listado conservando el filtro, y opcionalmente un mensaje (?ok=... / ?error=...)
export function urlLista(filtro, extra = {}) {
  const parametros = new URLSearchParams();
  if (normalizarFiltro(filtro) === 'sinleer') parametros.set('filtro', 'sinleer');
  for (const [clave, valor] of Object.entries(extra)) parametros.set(clave, valor);
  const texto = parametros.toString();
  return texto ? `/admin/contactos?${texto}` : '/admin/contactos';
}

export function aContactoVista(fila, filtro) {
  const leido = Boolean(fila.leido);
  return {
    id: fila.id,
    nombre: fila.nombre,
    telefono: fila.telefono,
    mensaje: fila.mensaje,
    fecha: formatearFecha(fila.creado_en),
    leido,
    // Lo que hace el botón: si está leído lo vuelve a "no leído" y al revés
    textoBoton: leido ? 'Marcar como no leído' : 'Marcar como leído',
    valorNuevo: leido ? '0' : '1',
    filtro: normalizarFiltro(filtro),
  };
}