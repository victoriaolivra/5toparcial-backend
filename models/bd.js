// Pool de conexiones a MySQL/MariaDB (mysql2 con promesas).
// Un pool reutiliza conexiones en lugar de abrir una nueva en cada consulta.
import mysql from 'mysql2/promise';
import { config } from '../config.js';

const pool = mysql.createPool({
  host: config.mysql.host,
  user: config.mysql.user,
  password: config.mysql.password,
  database: config.mysql.database,
  charset: 'utf8mb4', // tildes y emojis
  connectionLimit: 10,
  connectTimeout: 5000, // si la base no responde, falla en 5 s en vez de colgarse
});

export default pool;