# Reglas de trabajo de Michipedia

## Repositorio y alcance

Este repositorio es la fuente principal del proyecto Michipedia. Continuar el desarrollo aquí, sobre React Native + Expo + TypeScript, con soporte iOS, Android y una vista web para probar desde la PC.

## Ramas y commits

- Cambios grandes (funcionalidades completas, migraciones, modificaciones amplias de arquitectura o UI): crear una rama desde `main`, trabajar allí y abrir un PR para integrar mediante merge después de la revisión y validación.
- Cambios chicos y acotados: se pueden comitear directamente en `main`.
- Todos los mensajes de commit deben estar en español e indicar el tipo de cambio.
- Prefijos: `feat:` para funcionalidades, `fix:` para correcciones, `refactor:` para reorganización, `eliminacion:` para quitar archivos o funciones, `docs:` para documentación, `test:` para pruebas y `chore:` para mantenimiento.
- Ejemplos: `fix: corregir el guardado de los encuentros`, `refactor: separar el mapa por plataforma`, `eliminacion: quitar componentes sin uso`.
- No sobrescribir trabajo existente ni usar push forzado para resolver divergencias.

## Validación

- Ejecutar `npm run typecheck` y `npm test` cuando cambie el código.
- Verificar exportación web y móvil cuando cambien mapas, dependencias o integración por plataforma.
- Informar por separado los chequeos de código y las pruebas reales en navegador o dispositivo. Exportar el bundle no equivale a compilar ni instalar una app nativa.
- No subir `node_modules`, builds, archivos de credenciales ni datos locales de usuarios.

## Producto

Capturar significa fotografiar un gato real y registrar el encuentro. Un gato puede tener muchos encuentros. La colección permanece local durante la alfa; no presentar esa etapa como sincronización o cuenta privada. Seguir ubicación únicamente en primer plano; no registrar toda la caminata.
