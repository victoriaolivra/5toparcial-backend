// Pide una contraseña por la terminal SIN mostrarla mientras se escribe.
import { stdin, stdout } from 'node:process';

export function pedirClave(pregunta) {
  return new Promise((resolve, reject) => {
    if (!stdin.isTTY) {
      reject(new Error('Hace falta una terminal interactiva para escribir la contraseña.'));
      return;
    }

    let clave = '';
    stdout.write(pregunta);
    stdin.setRawMode(true);
    stdin.setEncoding('utf8');
    stdin.resume();

    function terminar() {
      stdin.setRawMode(false);
      stdin.pause();
      stdin.removeListener('data', alRecibir);
      stdout.write('\n');
    }

    function alRecibir(texto) {
      // Teclas especiales (flechas, etc.) llegan como una secuencia que empieza con ESC: se ignoran
      if (texto.startsWith('\u001b')) return;

      for (const caracter of texto) {
        if (caracter === '\r' || caracter === '\n') {
          terminar();
          resolve(clave);
          return;
        }
        if (caracter === '\u0003') { // Ctrl+C
          terminar();
          reject(new Error('Cancelado.'));
          return;
        }
        if (caracter === '\u007f' || caracter === '\b') { // retroceso
          clave = Array.from(clave).slice(0, -1).join('');
        } else if (caracter >= ' ') {
          clave += caracter;
        }
      }
    }

    stdin.on('data', alRecibir);
  });
}