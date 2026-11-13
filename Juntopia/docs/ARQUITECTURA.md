# Arquitectura actual

## Decisión de stack

JavaScript, React y Vite, conservando el framework inicial. La instrucción más reciente del usuario reemplaza TypeScript. No hay fuentes .ts/.tsx ni compilador TypeScript como dependencia directa. Los tipos transitivos que traigan bibliotecas no forman parte del código de la aplicación.

## Identidad

Referencia inspeccionada: src/assets/Juntopia.png. Bosque profundo, musgo, crema, luz cálida, bordes oliva y paneles redondeados. Se reconstruyó con componentes, CSS y SVG; no se usa la imagen de referencia como fondo ni se copian sus ejemplos como datos reales.

## Separación de responsabilidades

- La aplicación React se ocupa de interfaz y estado; las páginas se cargan bajo demanda.
- Auth gestiona las credenciales. El navegador sólo utiliza la clave publicable.
- PostgreSQL valida integridad, privacidad y propiedad con RLS. Los controles visuales no son autorización.
- Las funciones privadas privilegiadas tienen search_path vacío, permisos explícitos y comprobaciones de identidad. Los endpoints RPC públicos son wrappers SECURITY INVOKER.
- Storage es privado; los enlaces firmados de obras autorizadas duran 60 segundos. Una obra privada no habilita acceso a otros usuarios por conocer su ruta.
- Realtime difunde cambios sujetos a políticas. Se recargan datos al reconectar, enfocar y cada 30 segundos como respaldo.

## Datos

profiles conserva el perfil privado y progreso; member_cards comparte sólo lo que el usuario habilita. save_profile guarda ambos atómicamente. policy_acceptances registra versión y hora del servidor. user_settings guarda preferencias.

categories y content_items separan catálogo de user_content_status, reviews, collections y collection_items. Las fichas contienen metadatos originales y enlaces a fuentes oficiales.

friendships, blocks, conversations y messages definen relaciones y mensajes privados. parties, invites, attendees, bans, messages, queue, votes y presence modelan encuentros. El RSVP bloquea la fila de la Party antes de contar participantes para impedir sobrecupos concurrentes.

creator_works y work_comments modelan creación original con borradores y publicación. reports y las tablas privadas de moderación dejan trazabilidad. notifications se genera desde triggers autorizados.

## Alcance de esta beta

La plataforma social está conectada al backend. No se simula streaming, pagos, usuarios, amistades o recomendaciones. Los términos definitivos, entrega de correos, eliminación automatizada de cuentas y proveedores externos son dependencias de lanzamiento, detalladas en README.md.
