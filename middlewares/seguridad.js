// Cabeceras de seguridad. Se hacen a mano (sin librerías) porque son pocas y así se ve qué hace cada una.
// Ojo con las imágenes: el frontend (localhost:3000) las pide a este servidor (localhost:3001), que para el
// navegador es "otro origen". Por eso /uploads y /api llevan Cross-Origin-Resource-Policy: cross-origin;
// con otro valor el navegador bloquearía las fotos de las novedades.

// El panel no usa scripts ni estilos escritos dentro de las páginas, así que podemos prohibirlos:
// aunque alguien lograra meter HTML en una página del panel, el navegador no ejecutaría su script.
const CSP_PANEL = [
  "default-src 'none'",
  "style-src 'self'",
  "img-src 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "base-uri 'none'",
].join('; ');

export function cabecerasSeguridad({ produccion = false } = {}) {
  return function cabeceras(req, res, next) {
    // El navegador no "adivina" el tipo de archivo: un .jpg es una imagen y nada más
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    // Solo con HTTPS real (producción): obliga al navegador a usar siempre https
    if (produccion) res.set('Strict-Transport-Security', 'max-age=15552000');

    const ruta = req.path;
    if (ruta === '/admin' || ruta.startsWith('/admin/')) {
      res.set('Content-Security-Policy', CSP_PANEL);
      res.set('X-Frame-Options', 'DENY'); // el panel no puede abrirse dentro de otra página
    }
    if (ruta.startsWith('/uploads/') || ruta === '/api' || ruta.startsWith('/api/')) {
      res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    }
    next();
  };
}