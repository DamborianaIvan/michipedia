# Revisión del 7 de octubre de 2026

## Resultado

- Backend: `npm audit --prefix backend --workspaces=false --omit=dev` reportó 0 vulnerabilidades conocidas.
- Frontend: se corrigió el aviso crítico de MapLibre (GHSA-jrc7-96c5-q579) actualizando a 6.13.0 y adaptando la importación.
- Quedan 26 avisos transitivos del entorno Expo: 7 moderados y 19 altos. Sus causas son braces, node-forge y uuid. No confundir los 26 paquetes afectados con 26 fallas independientes.
- A la fecha de consulta, braces 3.0.3 y node-forge 1.4.0 son las últimas versiones publicadas y siguen reportadas. UUID llega a través de xcode; actualizarlo requiere validar la herramienta de generación de proyectos nativos.
- No se ejecutó `npm audit fix --force`: propone retroceder Expo y React Native a versiones incompatibles con esta app.

## Validaciones

Pruebas HTTP de registro, login y perfil con persistencia simulada, pero hooks de hash bcrypt y JWT reales. Pruebas de operadores MongoDB como entrada, JSON malformado, tamaño de cuerpo, CORS, limitación de intentos, expiración/audiencia/algoritmo de tokens, ausencia de contraseñas en respuestas y errores sin detalles internos.

La conectividad con Atlas y sus permisos requieren pruebas con la configuración del despliegue. Los limitadores utilizan almacenamiento de un único proceso. Las sesiones web se conservan en localStorage y son accesibles a JavaScript del mismo origen; una futura migración a cookies HttpOnly requiere diseñar también CSRF y el flujo web/móvil. Cerrar sesión borra el token local, sin revocarlo en el servidor.

## Referencias de los avisos pendientes

- https://github.com/advisories/GHSA-vfj7-8cjw-p6xm
- https://github.com/advisories/GHSA-86w9-cpqp-85rv
- https://github.com/advisories/GHSA-w5hq-g745-h8pq

La ausencia de avisos en npm audit no garantiza ausencia de vulnerabilidades lógicas ni reemplaza una revisión del despliegue.
