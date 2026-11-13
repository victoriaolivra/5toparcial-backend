-- Bakes Lourdes - novedades iniciales (las que hoy están escritas a mano en la web)
-- Cada INSERT se saltea si ya existe una novedad con ese título,
-- así que se puede ejecutar más de una vez sin duplicar.
-- Se inserta primero Día del Padre para que, ordenando de la más nueva a la más
-- vieja (id descendente), San Valentín siga apareciendo arriba como hoy.

USE bakeslourdes;

INSERT INTO novedades (titulo, subtitulo, cuerpo, img1, img2)
SELECT
  'Día del Padre 👨',
  'Tortas, Postres y Box personalizados para homenajear a Papá',
  'Con su sabor favorito. Propuestas con la tematica que más le gusta a papá.',
  'boxpapa1.jpeg',
  'boxpapa2.jpeg'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM novedades WHERE titulo = 'Día del Padre 👨');

INSERT INTO novedades (titulo, subtitulo, cuerpo, img1, img2)
SELECT
  'Día de San Valentín ❤',
  'Box de desayunos diseñadas para celebrar el amor',
  'Ideal para regalar y compartir un momento dulce en pareja. Incluye mini torta, cookies y detalles personalizados.',
  'boxsanvalentin.jpeg',
  NULL
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM novedades WHERE titulo = 'Día de San Valentín ❤');