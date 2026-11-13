// Deja disponible en todas las páginas del panel la cantidad de contactos sin leer (el número del menú).
import { contarNoLeidos } from '../models/contactosModel.js';

export async function cargarNoLeidos(req, res, next) {
  if (req.session?.idUsuario) {
    try {
      res.locals.noLeidos = await contarNoLeidos();
    } catch (error) {
      // Si falla la base, la página se muestra igual, simplemente sin el número
      console.error('No se pudo contar los contactos sin leer:', error.code ?? error.message);
    }
  }
  next();
}