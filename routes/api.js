// API pública: es lo que consume el frontend de React.
import { Router } from 'express';
import { config } from '../config.js';
import { crearManejadorContacto } from '../controllers/contacto.js';
import { insertContacto } from '../models/contactosModel.js';
import { getNovedades } from '../models/novedadesModel.js';
import { aNovedadPublica } from '../utils/novedadPublica.js';
import { enviarAvisoContacto } from '../utils/mail.js';
import { crearLimitador } from '../utils/limitadorIntentos.js';

const router = Router();

// GET /api/novedades -> lista de novedades con URLs de imágenes completas
router.get('/novedades', async (req, res) => {
  const filas = await getNovedades();
  res.json(filas.map((fila) => aNovedadPublica(fila, config.backendUrl)));
});

// POST /api/contacto -> guarda el mensaje del formulario (máximo 5 por hora por IP)
router.post(
  '/contacto',
  crearManejadorContacto({
    insertarContacto: insertContacto,
        enviarAvisoContacto,
    limitador: crearLimitador({ maximo: 5, ventanaMs: 60 * 60 * 1000 }),
  })
);

export default router;