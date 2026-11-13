// Recibe el formulario con imágenes (multipart/form-data) usando multer.
import fs from 'node:fs';
import multer from 'multer';
import { CARPETA_UPLOADS, TIPOS, nombreUnico } from '../utils/imagenes.js';

fs.mkdirSync(CARPETA_UPLOADS, { recursive: true });

const subir = multer({
  storage: multer.diskStorage({
    destination: CARPETA_UPLOADS,
    filename: (req, archivo, cb) => cb(null, nombreUnico(archivo.mimetype)),
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB por imagen
    files: 2,
    fields: 10,
    fieldSize: 100 * 1024,
  },
  fileFilter: (req, archivo, cb) => {
    if (TIPOS[archivo.mimetype]) return cb(null, true);
    const error = new Error('Tipo de archivo no permitido');
    error.code = 'TIPO_NO_PERMITIDO';
    cb(error);
  },
}).fields([
  { name: 'imagen1', maxCount: 1 },
  { name: 'imagen2', maxCount: 1 },
]);

const MENSAJES = {
  LIMIT_FILE_SIZE: 'Cada imagen puede pesar como máximo 5 MB.',
  LIMIT_FILE_COUNT: 'Solo se pueden subir 2 imágenes.',
  LIMIT_UNEXPECTED_FILE: 'Solo se pueden subir 2 imágenes.',
  TIPO_NO_PERMITIDO: 'Solo se aceptan imágenes JPG, PNG o WebP.',
};

// Errores del sistema (disco lleno, sin permisos...) son nuestros, no del usuario
const ERRORES_DEL_SISTEMA = ['ENOENT', 'EACCES', 'EPERM', 'ENOSPC'];

// Si la subida falla por culpa del formulario (archivo muy grande, tipo no permitido...),
// NO corta la petición: deja el mensaje en req.errorSubida para que la ruta vuelva a mostrar el formulario.
export function recibirImagenes(req, res, next) {
  subir(req, res, (error) => {
    if (!error) return next();
    if (ERRORES_DEL_SISTEMA.includes(error.code)) return next(error);
    req.errorSubida = MENSAJES[error.code] ?? 'No se pudo procesar el formulario. Probá de nuevo.';
    next();
  });
}