// Arma el mail de aviso cuando llega un contacto nuevo. Funciones puras (sin red ni nodemailer).

// Convierte texto en HTML seguro: lo que escribió la persona se muestra tal cual, nunca se interpreta.
export function escaparHtml(texto) {
  return String(texto)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function armarMailContacto({ nombre, telefono, mensaje }, { de, para }) {
  const text = `Nuevo contacto desde la web\n\nNombre: ${nombre}\nTeléfono: ${telefono}\n\nMensaje:\n${mensaje}\n`;

  const html = `<div style="font-family: Arial, sans-serif; color: #3b2f2f;">
  <h2 style="margin: 0 0 12px;">Nuevo contacto desde la web</h2>
  <p style="margin: 4px 0;"><strong>Nombre:</strong> ${escaparHtml(nombre)}</p>
  <p style="margin: 4px 0;"><strong>Teléfono:</strong> ${escaparHtml(telefono)}</p>
  <p style="margin: 12px 0 4px;"><strong>Mensaje:</strong></p>
  <p style="margin: 0; padding: 10px; background: #fbf6f4; border-radius: 6px;">${escaparHtml(mensaje).replace(/\n/g, '<br>')}</p>
</div>`;

  return {
    from: de,
    to: para,
    subject: `Nuevo contacto desde la web: ${nombre}`,
    text,
    html,
  };
}