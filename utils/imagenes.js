// Utilidades para las imágenes subidas desde el panel.
import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';

export const CARPETA_UPLOADS = fileURLToPath(new URL('../public/uploads/', import.meta.url));

// Tipos permitidos y la extensión con la que se guardan. SVG queda afuera a propósito:
// un SVG puede contener código que se ejecuta al abrirlo.
export const TIPOS = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

// Nombre aleatorio: nunca se usa el nombre que trae el archivo (evita pisar archivos y rutas raras)
export function nombreUnico(mimetype) {
  return `${randomUUID()}${TIPOS[mimetype]}`;
}

// Mira los primeros bytes del archivo ("firma") para saber qué es de verdad.
// El tipo que declara el navegador se puede falsear; los bytes no.
export function detectarTipoImagen(cabecera) {
  const b = cabecera;
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) {
    return 'image/jpeg';
  }
  if (
    b.length >= 8 &&
    b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 &&
    b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a
  ) {
    return 'image/png';
  }
  if (
    b.length >= 12 &&
    b.toString('ascii', 0, 4) === 'RIFF' &&
    b.toString('ascii', 8, 12) === 'WEBP'
  ) {
    return 'image/webp';
  }
  return null;
}

async function leerCabecera(ruta) {
  const archivo = await fs.open(ruta, 'r');
  try {
    const buffer = Buffer.alloc(12);
    const { bytesRead } = await archivo.read(buffer, 0, 12, 0);
    return buffer.subarray(0, bytesRead);
  } finally {
    await archivo.close();
  }
}

// Revisa los archivos ya guardados por multer. Devuelve un mensaje de error, o null si están bien.
export async function verificarImagenes(archivos) {
  for (const archivo of archivos) {
    const tipoReal = detectarTipoImagen(await leerCabecera(archivo.path));
    if (tipoReal === null || tipoReal !== archivo.mimetype) {
      const nombre = String(archivo.originalname ?? '').slice(0, 60);
      return `El archivo "${nombre}" no es una imagen válida. Solo se aceptan JPG, PNG o WebP.`;
    }
  }
  return null;
}

// Borra archivos de la carpeta de subidas. Ignora los que no existen.
// path.basename evita que un nombre como "../algo" salga de la carpeta.
export async function borrarArchivos(nombres, carpeta = CARPETA_UPLOADS) {
  await Promise.all(
    nombres.filter(Boolean).map((nombre) => fs.rm(path.join(carpeta, path.basename(nombre)), { force: true }))
  );
}