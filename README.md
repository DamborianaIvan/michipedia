# Michipedia · React Native + Expo + TypeScript

Alfa F0/F1: explorar con mapa, fotografiar gatos reales y coleccionar sus encuentros. Plataforma principal: iPhone, con soporte Android y vista web para desarrollar desde la PC.

## Probar en la PC

Requiere Node.js 22.18 o superior; recomendamos Node 24 LTS.
Copiá `.env.example` a `.env` y configurá `EXPO_PUBLIC_API_URL`. Para probar en la misma PC, la API local usa `http://localhost:4000`.

```sh
npm ci
npm install --prefix backend
npm run web
```

La API se ejecuta por separado:

```sh
cp backend/.env.example backend/.env
# completar MONGODB_URI y JWT_SECRET en backend/.env
npm run api
```

En Windows PowerShell, podés copiar los ejemplos con `Copy-Item .env.example .env` y `Copy-Item backend/.env.example backend/.env`. Para abrir la web desde otro equipo de la red, configurá `EXPO_PUBLIC_API_URL` con la IP de la PC; agregá también el origen web a `CORS_ORIGINS` en `backend/.env`.

Expo abre el navegador. Para GPS en la PC usar localhost o HTTPS y conceder permiso de ubicación. El navegador puede dar una ubicación menos precisa que el GPS del teléfono.

La vista web comparte pantallas, tipos y lógica con móvil. El mapa y almacenamiento se resuelven por plataforma: `EncounterMap.web.tsx` usa MapLibre GL JS; `EncounterMap.native.tsx` usa MapLibre Native. La cámara web depende del selector ofrecido por el navegador; no replica la experiencia nativa.

## Probar en el iPhone

MapLibre Native requiere una compilación de desarrollo: **no funciona con Expo Go**. El perfil EAS está listo, pero no hay build ni proyecto EAS registrado aún.

Para la ruta de instalación remota en un iPhone físico mediante EAS se necesita cuenta Expo y membresía Apple Developer activa. Desde Windows se puede compilar en la nube:

```sh
npx eas-cli@latest login
npx eas-cli@latest device:create
npx eas-cli@latest build --platform ios --profile development
npx expo start --dev-client
```

La primera compilación guía la asociación del proyecto y la configuración de firma. Instalar el enlace/QR entregado por EAS en el iPhone registrado. En iOS, habilitar el modo desarrollador si lo solicita. Mantener PC y teléfono con conectividad hacia Metro; si la red local impide la conexión, configurar un túnel compatible con Expo.

Con una Mac y Xcode se puede ejecutar `npx expo run:ios` en el simulador. El perfil `ios-simulator` también permite generar un build para simulador. Probar GPS real y cámara en el teléfono sigue siendo necesario.

No publicamos en App Store ni configuramos credenciales. No se ejecutaron builds nativos en este entorno Linux.

## Funcionalidades

- Explorar, Gatopedia, Mi aventura e historial de encuentros.
- Ubicación en primer plano con permiso explícito y círculo de precisión GPS. Se detiene al pasar a segundo plano y se reinicia al volver si estaba habilitada. Pausa de centrado al desplazar el mapa.
- Foto desde cámara o galería, vista previa y reintento ante errores.
- Punto congelado antes de abrir cámara/selector; no reemplazarlo por una ubicación tomada después. Revisar si hubo desplazamiento o si se selecciona una foto antigua. La fecha corresponde al inicio del registro, no se lee EXIF.
- Coordenadas manuales o selección del punto tocando el mapa.
- Gato nuevo o reencuentro; nombre opcional y número automático.
- Cada encuentro aparece en el mapa con una miniatura circular de su foto; al tocarla se abre la ficha del michi con sus encuentros, fechas y ubicaciones.
- Registro con correo y contraseña, login, verificación de sesión y cierre de sesión.
- Contraseñas cifradas con bcrypt y tokens JWT. En iOS/Android el token se guarda con SecureStore; en web se conserva en el almacenamiento del navegador.
- La colección se guarda localmente y se separa por cuenta en cada dispositivo. Al iniciar sesión por primera vez, los datos alfa anteriores se transfieren a esa cuenta local.
- Guardado de fotos: archivos en directorio de documentos + AsyncStorage en móvil; IndexedDB en web.
- Eliminación de encuentro con confirmación; el último elimina también la ficha del gato.
- Celebración animada con la foto al descubrir un michi nuevo; respeta la opción de reducir movimiento del dispositivo. La Gatopedia y sus tarjetas también aparecen con una entrada suave.
- Datos de usuario insertados como texto, sin HTML dinámico.

## Alcance y límites

Las cuentas y perfiles se guardan en la base de datos de Michipedia; la colección y las fotos todavía no se sincronizan con el servidor. La colección sigue siendo local por dispositivo y una sesión iniciada en web no comparte sus michis con iPhone. Los datos pueden perderse al borrar el almacenamiento local. No hay respaldo, reconocimiento por IA ni seguimiento de caminatas en segundo plano.

El mapa usa **Liberty de OpenFreeMap**, con calles y nombres de OpenStreetMap/OpenMapTiles; funciona con MapLibre en web, iOS y Android y no requiere clave. Incluye controles para acercar/alejar en móvil y pantalla completa en web. MapLibre muestra la atribución del proveedor. La instancia pública es gratuita y sin límites publicados, pero no ofrece un SLA; la disponibilidad del mapa depende de su servicio. Para el lanzamiento se puede reevaluar el proveedor según cobertura y disponibilidad. Definir `EXPO_PUBLIC_MAP_STYLE_URL` en `.env` para cambiar el estilo (valor público, no poner secretos). Al cargar o navegar el mapa, el navegador y la app piden estilos/tiles al proveedor.

## Organización

- `App.tsx`: pantallas y recorrido operativo.
- `src/components/CatAddedCelebration.tsx`: celebración de alta hecha con React Native Reanimated, compartida entre web y móvil.
- `src/components/EncounterMap.*`: mapas por plataforma.
- `src/hooks/useLocation.ts`: permiso y ciclo de vida del GPS.
- `src/domain/model.ts`: gatos/encuentros y reglas compartidas.
- `src/services/storage.*`: persistencia y fotos por plataforma.
- `src/auth/*`: autenticación y almacenamiento de sesión según plataforma.
- `src/components/AuthScreen.tsx`: acceso y creación de cuenta.
- `backend/*`: API Node/Express y modelos de cuenta para la base de Michipedia.
- `tests/model.test.mjs`: reglas de colección y coordenadas.
- `app.json`: permisos y plugins.
- `eas.json`: compilaciones de desarrollo, simulador y producción.

## Verificar

```sh
npm run typecheck
npm test
npm run build:web
```

La API necesita una base MongoDB Atlas independiente para Michipedia. Puede alojarse en el clúster de Atlas ya usado por Pepes, pero no se deben compartir `MONGODB_URI` ni `JWT_SECRET`. Configurá `MONGODB_URI`, `JWT_SECRET` y `CORS_ORIGINS` en el servicio de la API, y `EXPO_PUBLIC_API_URL` en la app. Esta última URL es pública; no pongas secretos allí.

## Próximos hitos

1. Configurar proveedor con calles y abrir una compilación en el iPhone.
2. Probar permisos, caminar, sacar foto, guardar, cerrar/reabrir y registrar reencuentro.
3. F2: sincronización de gatos, encuentros y fotos entre dispositivos, con autorización por cuenta.
4. F3/F4: edición de fichas, respaldo y experiencia de encuentros.
5. F5/F6: logros, animaciones y beta.

## Validación de esta entrega

- TypeScript: PASS.
- Reglas de colección: 4 pruebas PASS.
- Exportación Metro para web, iOS y Android: PASS.
- Reanimated y Worklets: versiones instaladas según Expo SDK 57; las animaciones compilan para web, iOS y Android.
- Compatibilidad de dependencias con las recomendaciones incluidas en Expo SDK 57: PASS (comprobación offline).
- Pendiente: prueba visual en navegador, compilación nativa con firma, instalación en iPhone y pruebas reales de GPS/cámara. Exportar JavaScript/Hermes no equivale a compilar la app nativa.

La primera alfa HTML se conserva como referencia, pero este proyecto es la base para continuar.
