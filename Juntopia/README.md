# Juntopia

Aplicación web full stack en **JavaScript + React + Vite + Supabase**, desarrollada en la rama `Aiden`. La instrucción actual de JavaScript sustituye la propuesta anterior de TypeScript.

## Arranque

Requiere Node.js 22.12 o superior (recomendado 24).

```powershell
cd Juntopia
npm.cmd ci
Copy-Item .env.example .env.local
# Completar la URL y clave publicable de Supabase.
npm.cmd run dev
```

Abrir **http://localhost:3000**. Si `.env.local` ya está configurado, conservarlo y omitir Copy-Item. Este equipo apunta al proyecto Juntopia `czdldzleooqoqerxmmkk`. Ninguna clave secreta se incluye en el frontend ni en Git.

```powershell
npm.cmd run lint
npm.cmd test
npm.cmd run test:render
npm.cmd run build
```

GitHub Actions ejecuta estas comprobaciones en pushes a Aiden/main y pull requests. El frontend de producción se genera en `dist/`; usa rutas con hash, por lo que no requiere reescrituras de rutas del servidor.

## Funciones operativas

- Entrada pública separada del espacio privado; registro con aceptación de reglas beta, ingreso, confirmación de correo según Auth, recuperación y cambio de contraseña, cierre de sesión.
- Onboarding reanudable; seis bases de avatar con cabello, ropa, fondo y accesorios; nombre e identificador único; intereses y privacidad.
- Dashboard responsive con búsqueda, ocho categorías, recomendaciones por intereses, amistades y agenda basadas en datos reales.
- Catálogo comunitario de metadatos y enlaces oficiales, fichas, búsqueda y filtros. No hay streaming ni contenido comercial copiado.
- Biblioteca privada: favoritos, estados, progreso y etiquetas emocionales; reseñas de 1 a 5 con edición y retirada.
- Colecciones privadas o compartidas con miembros; edición y gestión de contenidos.
- Tarjeta de comunidad opcional, solicitudes y aceptación de amistad, bloqueo y desbloqueo.
- Mensajes 1:1 entre amistades y chat grupal dentro de Parties; Realtime con recarga de respaldo y reconexión.
- Parties públicas, de amigos o por invitación; horario y zona, cupos, duración, reglas, RSVP, lista de espera y moderación del anfitrión. Cambios de fecha/estado generan notificaciones.
- Sala con cuenta regresiva, propuestas y votos, enlaces oficiales, invitaciones, expulsión y readmisión; presencia opcional, desactivada por defecto y visible sólo para participantes.
- Agenda y exportación de encuentros a calendario ICS.
- Tinta Viva y Galería Viva: borradores privados, publicaciones originales, imágenes en Storage privado, atribución, comentarios y reportes.
- Notificaciones reales, preferencias de tema por cuenta, descarga de datos propios, manejo de desconexión y errores.
- Panel de moderación con roles internos, reportes y registro de decisiones. Nadie obtiene rol de moderador desde el cliente.

## Arquitectura

`src/components`: interfaz compartida. `src/features`: acceso y onboarding. `src/pages`: módulos cargados bajo demanda. `src/hooks`: sesión, navegación, consultas, acciones y Realtime. `src/lib`: acceso a datos, validación y utilidades. `supabase/migrations`: backend versionado. `supabase/tests`: aislamiento y permisos. `tests`: utilidades y render. `scripts`: pruebas de integración descartables.

Ver [arquitectura](docs/ARQUITECTURA.md), [seguridad](docs/SEGURIDAD.md), [verificación](docs/VERIFICACION.md) y [backend](supabase/README.md).

## Configuración y límites reales de lanzamiento

1. En Supabase Auth, revisar Site URL y Redirect URLs para `http://localhost:3000` y el dominio definitivo. Usar SMTP propio para entrega a personas ajenas al equipo, configurar remitente, límites y protección antiabuso. El código de registro está habilitado; no se verificó entrega de correos reales.
2. Designar moderadores desde administración, agregando su UUID a `private.moderators`. No se asignan roles automáticamente ni mediante user_metadata.
3. Los textos de reglas y privacidad son de una beta y requieren datos del responsable, contacto, retención y revisión antes del lanzamiento público.
4. La eliminación completa de cuenta continúa siendo administrativa en Supabase; no se muestra un botón que finja eliminarla. Requiere revocar sesiones y retirar también los archivos del usuario.
5. Catálogos externos, reproducción autorizada, lectores EPUB/PDF, chats grupales independientes de Parties, notificaciones push, pagos y anuncios no están integrados. El núcleo social funciona con fichas de enlaces oficiales y creaciones propias, sin depender de estas integraciones.
6. La búsqueda muestra hasta 200 fichas recientes; otros listados hasta 100/200 registros. Los chats muestran los últimos 100 mensajes. El crecimiento requiere paginación adicional y revisión de costes.
7. Verificación visual interactiva pendiente: el host de navegador no estaba disponible y la aprobación para Chrome venció. Se verificaron build, lint, render y API, sin afirmar una prueba visual que no se pudo realizar.

No se considera esta beta un lanzamiento público completo con todas las integraciones del documento de visión.
