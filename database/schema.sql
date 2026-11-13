-- Bakes Lourdes - estructura de la base de datos
-- Se puede ejecutar más de una vez: no borra nada si las tablas ya existen.

CREATE DATABASE IF NOT EXISTS bakeslourdes
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE bakeslourdes;

-- Novedades que se muestran en la web (hasta 2 imágenes, opcionales)
CREATE TABLE IF NOT EXISTS novedades (
  id        INT UNSIGNED NOT NULL AUTO_INCREMENT,
  titulo    VARCHAR(150) NOT NULL,
  subtitulo VARCHAR(250) NOT NULL,
  cuerpo    TEXT NOT NULL,
  img1      VARCHAR(255) NULL,
  img2      VARCHAR(255) NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Usuario(s) que entran al panel de administración
-- La contraseña se guarda siempre hasheada (bcrypt), nunca en texto plano.
CREATE TABLE IF NOT EXISTS usuarios (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  usuario       VARCHAR(50)  NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_usuarios_usuario (usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Mensajes que llegan desde el formulario de contacto
CREATE TABLE IF NOT EXISTS contactos (
  id        INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre    VARCHAR(100) NOT NULL,
  telefono  VARCHAR(30)  NOT NULL,
  mensaje   TEXT NOT NULL,
  leido     TINYINT(1)   NOT NULL DEFAULT 0,
  creado_en DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;