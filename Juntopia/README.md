# Juntopia

Aplicación web full stack en **JavaScript + React + Vite + Supabase**, desarrollada en la rama `Aiden`. La instrucción actual de JavaScript sustituye la propuesta anterior de TypeScript.

## Arranque

Requiere Node.js 22.12 o superior (recomendado 24).

```powershell
cd Juntopia
npm.cmd ci
Copy-Item frontend/.env.example frontend/.env.local
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

## Estructura modular

```text
Juntopia/
??? frontend/                 # Navegador: React, CSS y cliente p?blico
?   ??? src/app/              # Entrada, rutas y layout
?   ??? src/modules/          # Funciones del producto por dominio
?   ??? src/shared/           # UI com?n, hooks, transporte y dominio
?   ??? tests/                # Pruebas de arquitectura, dominio y render
?   ??? .env.example          # S?lo variables VITE_ publicables
?   ??? package.json
??? backend/                  # Supabase: negocio, seguridad y persistencia
?   ??? supabase/migrations/  # Tablas, RLS, RPC, triggers y Storage
?   ??? supabase/tests/       # Pruebas SQL de aislamiento
?   ??? tests/integration/    # Pruebas reales de Auth/REST/Realtime/Storage
?   ??? scripts/              # Preparaci?n de fixtures descartables
?   ??? .env.example          # Configuraci?n del entorno backend
?   ??? package.json
??? docs/                     # Arquitectura, seguridad y verificaci?n
??? package.json              # Orquesta los dos workspaces
??? package-lock.json         # Un lockfile para instalaci?n reproducible
```

M?dulos del frontend: auth, home, catalog, library, collections, community, parties, creators, profile y moderation. Cada m?dulo tiene un index.js p?blico y sus p?ginas/componentes propios. La capa compartida no depende de m?dulos ni importa c?digo del backend; las pruebas verifican esos l?mites.

El backend se ejecuta en Supabase. La autorizaci?n, cupos, integridad, moderaci?n y archivos privados est?n en PostgreSQL/RLS/RPC/Storage. frontend/src/shared/data es un cliente de ese backend, no el lugar donde se conceden permisos. No hay un servidor Express adicional.

Comandos independientes desde Juntopia:

```powershell
npm.cmd run dev --workspace @juntopia/frontend
npm.cmd run build --workspace @juntopia/frontend
npm.cmd run lint --workspace @juntopia/backend
npm.cmd run check:backend
```

Ver [frontend](frontend/README.md), [backend](backend/README.md), [arquitectura](docs/ARQUITECTURA.md), [seguridad](docs/SEGURIDAD.md) y [verificaci?n](docs/VERIFICACION.md).
