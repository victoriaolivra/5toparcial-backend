// Resume un texto largo para mostrarlo en una lista: junta los espacios y saltos de línea,
// y lo corta en `maximo` caracteres agregando "…". Cuenta caracteres reales (no parte un emoji por la mitad).
export function resumir(texto, maximo) {
  const limpio = String(texto ?? '').replace(/\s+/g, ' ').trim();
  const caracteres = Array.from(limpio);
  if (caracteres.length <= maximo) return limpio;
  return `${caracteres.slice(0, maximo).join('').trimEnd()}…`;
}