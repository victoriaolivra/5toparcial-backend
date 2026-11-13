// Protege las rutas del panel: sin sesión iniciada, redirige al login.
export function requiereLogin(req, res, next) {
  if (req.session?.idUsuario) return next();
  res.redirect('/admin/login');
}

// Evita que el navegador guarde páginas del panel: después de cerrar sesión,
// el botón "Atrás" no debe mostrar contenido privado.
export function sinCache(req, res, next) {
  res.set('Cache-Control', 'no-store');
  next();
}