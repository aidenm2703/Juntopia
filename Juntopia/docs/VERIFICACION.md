# Verificación de la entrega

## Ejecutado

- npm run lint: aprobado.
- npm test: tres pruebas de utilidades (URL, ICS y errores).
- npm run test:render: diez comprobaciones de render estático de registro, cambio de contraseña, seis avatares distintos, landing pública y enlaces seguros. No son pruebas de interacción del navegador.
- npm run build: aprobado, con separación en módulos de carga diferida.
- supabase/tests/profile_isolation.sql y community_isolation.sql: ejecutados contra el proyecto nuevo con rollback. Comprueban aislamiento, propiedad, colecciones privadas, privacidad de mensajes, capacidad, bloqueos, permisos de moderación y presencia opt-in.
- scripts/api-smoke.mjs: treinta comprobaciones reales con tres cuentas descartables. Incluye inicio de sesión Auth, perfil y tarjeta atómicos, duplicados, biblioteca, reseñas, RSVP concurrente, privacidad de chats, recepción de un cambio por Realtime, Storage privado/publicado, zonas horarias y bloqueo. Se corrigió una política RLS detectada al devolver filas recién creadas por la API.
- Cuentas, archivos y contenidos descartables retirados. Consulta final: cero cuentas smoke, perfiles, contenidos, Parties y objetos de prueba.
- Asesor Supabase: tres avisos INFO de tablas administrativas cerradas intencionalmente; sin ERROR/WARN.

## Repetir integración

Usar un proyecto de pruebas con estas migraciones y configurar .env.local. Ejecutar node scripts/prepare-smoke.mjs, aplicar el archivo privado .test-runtime/setup.sql desde administración, ejecutar node scripts/api-smoke.mjs y aplicar .test-runtime/cleanup.sql. El script no contiene claves administrativas; la preparación y limpieza de auth.users son administrativas. No correr contra una base de producción ni imprimir los fixtures: contienen contraseñas aleatorias descartables. Retirar los archivos locales al terminar. Las subidas se retiran en finally y las sesiones se cierran antes de eliminar usuarios.

## No verificado

- Entrega de email, confirmación y recuperación desde una bandeja real: requiere configuración SMTP/URLs del operador.
- Navegación visual de escritorio/móvil: el host de automatización de navegador no está disponible y la autorización para Chrome venció.
- Licencias de proveedores y reproducción: sin integraciones activadas.
- Rendimiento bajo carga, pentest, revisión legal y publicación en dominio final.

## Prueba manual recomendada

Crear y confirmar dos cuentas propias. Completar onboarding; hacer visibles sus tarjetas, solicitar y aceptar amistad; iniciar una conversación; agregar una ficha con enlace oficial; guardar favorito, reseña y colección; crear una Party de dos cupos; confirmar asistencia; enviar mensajes, proponer contenidos, votar e invitar. Cambiar fecha y comprobar la notificación. Bloquear una cuenta y comprobar que deja de acceder a chat/Party. Crear una obra como borrador, verificar privacidad y después publicarla. Repetir en teléfono y con teclado.
