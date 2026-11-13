// Lógica de POST /api/contacto. Recibe sus dependencias (guardar en la base, avisar por mail y limitador)
// para poder probarla sin Express, sin base de datos y sin servidor de correo.
import { validarContacto } from '../utils/validarContacto.js';

export function crearManejadorContacto({
  insertarContacto,
  enviarAvisoContacto,
  limitador,
  registrarError = console.error,
}) {
  return async function manejadorContacto(req, res) {
    // 1) ¿Esta IP ya mandó demasiados mensajes seguidos?
    const espera = limitador.segundosRestantes(req.ip);
    if (espera > 0) {
      res.set('Retry-After', String(espera));
      return res.status(429).json({
        error: true,
        message: `Enviaste varios mensajes seguidos. Probá de nuevo en ${Math.ceil(espera / 60)} minuto(s).`,
      });
    }

    // 2) Validar. Solo se usan los 3 campos esperados: cualquier otro dato del pedido se ignora.
    const { datos, errores, valido } = validarContacto(req.body);
    if (!valido) {
      return res.status(400).json({ error: true, message: 'Revisá los datos del formulario.', errores });
    }

    // 3) Guardar. Si la base falla, el error sube al manejador general (500) y NO se cuenta el envío.
    await insertarContacto(datos);

    // 4) Contar el envío (el limitador sirve igual para fallos que para envíos)
    limitador.registrarFallo(req.ip);

    // 5) Avisar por mail SIN esperar la respuesta del servidor de correo. El mensaje ya está guardado:
    //    si el mail falla, no es un error para quien escribió, solo queda registrado en la consola.
    Promise.resolve()
      .then(() => enviarAvisoContacto(datos))
      .catch((error) => registrarError('No se pudo enviar el aviso por mail:', error.code ?? error.message));

    res.status(201).json({
      error: false,
      message: '¡Gracias! Recibimos tu mensaje y te vamos a responder a la brevedad.',
    });
  };
}