// TRUST_PROXY: cuántos proxies (nginx, Cloudflare, el hosting...) hay entre el visitante y este servidor.
// Sin proxy (tu PC, XAMPP) va 0. Devuelve el número, o null si el valor no es válido.
export function leerTrustProxy(valor) {
  const texto = String(valor ?? '').trim();
  if (texto === '') return 0;
  if (!/^\d{1,2}$/.test(texto)) return null;
  return Number(texto);
}