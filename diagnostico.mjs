// Muestra qué configuración está leyendo el backend. Se borra cuando terminemos.
import { config } from './config.js';

const { host, user, password, database } = config.mysql;
console.log({
  host: JSON.stringify(host),
  user: JSON.stringify(user),
  password: password ? `(${password.length} caracteres)` : '(vacía)',
  database: JSON.stringify(database),
  cwd: process.cwd(),
});