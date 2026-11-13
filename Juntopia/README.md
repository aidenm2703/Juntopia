# Juntopia

Aplicación web en JavaScript con dos proyectos separados: frontend React/Vite y backend Node.js/Supabase. Desarrollo en la rama Aiden.

## Estructura

```text
Juntopia/
├── frontend/
│   ├── src/
│   │   ├── app/             # Entrada, rutas y layout
│   │   ├── modules/         # Funciones del producto
│   │   └── shared/          # UI, hooks y cliente HTTP
│   ├── tests/
│   ├── .env.example
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── server.js        # Inicio del servidor
│   │   ├── app.js           # Composición de la API
│   │   ├── config/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── database/        # Cliente y repositorios
│   │   ├── middleware/
│   │   ├── modules/         # Dominios de la API
│   │   └── shared/
│   ├── supabase/            # Migraciones, RLS y pruebas SQL
│   ├── tests/               # Unitarias, HTTP e integración
│   ├── scripts/
│   ├── .env.example
│   └── package.json
├── docs/
├── scripts/dev.mjs          # Arranca ambos procesos
├── package.json            # Orquesta los workspaces
└── package-lock.json
```

El flujo de datos es frontend → API Node → controlador → servicio → repositorio → Supabase con RLS. Auth y Realtime conservan el SDK público de Supabase en el navegador. El frontend no importa archivos del backend ni consulta tablas, RPC o Storage directamente.

## Ejecutar

Requiere Node.js 22.12 o superior; recomendado 24.

```powershell
cd Juntopia
npm.cmd ci
Copy-Item frontend/.env.example frontend/.env.local
Copy-Item backend/.env.example backend/.env.local
# Completar la URL y clave publicable en cada entorno.
npm.cmd run dev
```

Si los archivos locales ya están configurados, conservarlos y omitir Copy-Item. En este equipo se conservó el proyecto Juntopia czdldzleooqoqerxmmkk. Los archivos locales no se suben a Git.

Frontend: http://localhost:3000. Backend: http://127.0.0.1:4000. Vite redirige /api al backend. Si alguno ya está abierto, cerrarlo antes de reiniciar o usar los comandos independientes:

```powershell
npm.cmd run dev:frontend
npm.cmd run dev:backend
```

## Verificar

```powershell
npm.cmd run lint
npm.cmd test
npm.cmd run check:backend
npm.cmd run test:render
npm.cmd run build
```

GitHub Actions tiene trabajos separados para frontend y backend. El build genera frontend/dist. En producción se necesita un proxy HTTPS /api al backend o configurar VITE_API_BASE_URL al compilar.

## Funciones conectadas

Registro y acceso, onboarding reanudable, seis avatares personalizables, temas, catálogo comunitario con enlaces oficiales, biblioteca privada, favoritos, progreso, etiquetas, colecciones y reseñas. Comunidad con tarjeta opcional, amistades, bloqueos, mensajes, notificaciones, Parties, agenda, RSVP, cupos transaccionales, invitaciones, chat, cola, votos y presencia opt-in. Tinta Viva y Galería Viva incluyen borradores, obras, comentarios, imágenes privadas y reportes. Moderación utiliza roles internos y auditoría.

No se rellenan permanentemente las cuentas nuevas con usuarios, obras o reproducciones ficticias.

## Límites de lanzamiento

- Configurar URLs permitidas, SMTP, remitente y controles antiabuso de Auth. No se verificó entrega de correos a una bandeja real.
- Designar moderadores desde administración; el cliente no puede otorgarse roles.
- Completar contacto del responsable, retención y revisión de las reglas de la beta antes de publicación pública.
- La eliminación completa de cuentas sigue siendo administrativa: requiere revocar sesiones y retirar sus archivos.
- Catálogos de terceros, reproducción autorizada, lectores EPUB/PDF, grupos independientes de Parties, push, cobros y anuncios no están integrados.
- La búsqueda lista hasta 200 fichas recientes; otros listados 100/200 registros y chats los últimos 100 mensajes. El crecimiento requiere paginación adicional y pruebas de carga.
- Revisión visual interactiva pendiente por indisponibilidad del host de navegador. Se comprobaron compilación, render, API y permisos.

Ver [frontend](frontend/README.md), [backend](backend/README.md), [arquitectura](docs/ARQUITECTURA.md), [seguridad](docs/SEGURIDAD.md) y [verificación](docs/VERIFICACION.md).
