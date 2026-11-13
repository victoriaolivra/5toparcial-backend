// Limitador de intentos fallidos en memoria (por ejemplo, por IP).
// Pasados `maximo` fallos dentro de la ventana, la clave queda bloqueada
// hasta que termina la ventana (contada desde el primer fallo).
// `ahora` se puede reemplazar en las pruebas para simular el paso del tiempo.
export function crearLimitador({ maximo, ventanaMs, ahora = Date.now }) {
  const registros = new Map(); // clave -> { cuenta, desde }

  function vigente(clave) {
    const registro = registros.get(clave);
    if (!registro) return null;
    if (ahora() - registro.desde >= ventanaMs) {
      registros.delete(clave);
      return null;
    }
    return registro;
  }

  function limpiarVencidos() {
    for (const clave of registros.keys()) vigente(clave);
  }

  return {
    // Segundos que faltan para poder reintentar (0 si no está bloqueada)
    segundosRestantes(clave) {
      const registro = vigente(clave);
      if (!registro || registro.cuenta < maximo) return 0;
      return Math.ceil((registro.desde + ventanaMs - ahora()) / 1000);
    },

    registrarFallo(clave) {
      const registro = vigente(clave);
      if (registro) {
        registro.cuenta += 1;
        return;
      }
      if (registros.size > 1000) limpiarVencidos(); // evita que el mapa crezca sin límite
      registros.set(clave, { cuenta: 1, desde: ahora() });
    },

    limpiar(clave) {
      registros.delete(clave);
    },
  };
}