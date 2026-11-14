# Backend · API Node.js + Supabase

Servidor JavaScript independiente. `src/` contiene la API HTTP y sus módulos; `supabase/` contiene la persistencia, las funciones transaccionales y las políticas que se ejecutan en Supabase.

```text
backend/
├── src/
│   ├── server.js                 # Inicio, entorno y cierre del servidor
│   ├── app.js                    # Composición de la API
│   ├── config/                   # Configuración validada
│   ├── routes/                   # Registro de rutas por dominio
│   ├── controllers/              # Entrada HTTP y RPC
│   ├── services/                 # Operaciones y validación
│   ├── database/
│   │   ├── supabase.js            # Cliente aislado por usuario
│   │   └── repositories/         # Consultas y escritura
│   ├── middleware/               # Autenticación, CORS y límites
│   ├── modules/                  # account, catalog, library, community,
│   │                             # parties, creators y moderation
│   └── shared/                   # Errores y contratos de recursos
├── supabase/migrations/           # Esquema, RLS, RPC y Storage
├── supabase/tests/                # Pruebas SQL
├── tests/unit/                    # Seguridad y validación
├── tests/http/                    # API con servicios aislados
├── tests/integration/             # API real + Supabase y pruebas directas
├── scripts/                      # Fixtures descartables
├── .env.example
└── package.json
```

## Ejecutar

Desde Juntopia, instalar ambos workspaces con `npm ci`. Configurar `backend/.env.local` según `.env.example`. Se conserva la configuración local existente.

```powershell
npm.cmd run dev:backend
# Alternativa sin watcher:
npm.cmd run start --workspace @juntopia/backend
```

Puerto predeterminado 4000, host 127.0.0.1. Salud del proceso: GET http://127.0.0.1:4000/api/health. No afirma que la base esté disponible; sólo confirma que el servidor responde.

```powershell
npm.cmd run lint --workspace @juntopia/backend
npm.cmd run check:backend
npm.cmd test --workspace @juntopia/backend
```

## Rutas y capas

- `/api/account/profiles`, `/api/account/user_settings`, `/api/account/export` y RPC de perfil/consentimiento.
- `/api/catalog/content_items`, `/api/catalog/categories`.
- `/api/library/collections`, `/api/library/collection_items`, `/api/library/reviews`, `/api/library/user_content_status`.
- `/api/community/*`: tarjetas, amistades, bloqueos, conversaciones, mensajes y notificaciones.
- `/api/parties/*`: encuentros, participantes, invitaciones, expulsiones, mensajes, cola, votos y presencia; RPC de RSVP y heartbeat.
- `/api/creators/*`: obras, comentarios y archivos; subida binaria a `/files`, firma a `/files/signed` y retirada a `/files`.
- `/api/moderation/reports` y RPC de moderación.

Las rutas son explícitas. No hay un proxy abierto que permita elegir tablas o funciones arbitrarias. Cada módulo declara sus operaciones, columnas editables, filtros, relaciones permitidas y claves de conflicto. El flujo es ruta → controlador → servicio → repositorio → Supabase.

Toda ruta de datos exige `Authorization: Bearer <sesión>`. La API verifica el token mediante Supabase Auth y crea un cliente diferente para cada solicitud. Usa la clave publicable y el JWT del usuario: las consultas siguen sujetas a RLS. No usa service_role ni modifica los permisos de la base.

La exportación toma el usuario de la sesión, no del cuerpo. Los archivos se asignan a la carpeta del usuario autenticado, se limitan a 5 MB y se comprueba su firma PNG/JPEG/WebP. Storage continúa siendo privado y las URLs firmadas duran 60 segundos.

## Configuración y despliegue

`SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `HOST`, `PORT` y `FRONTEND_ORIGINS` pertenecen al backend. Nunca importar estos archivos desde frontend. No se registran tokens, contraseñas, cuerpos o errores internos en las respuestas.

En producción colocar la API detrás de HTTPS, configurar los orígenes exactos y hacer que `/api` llegue a este servidor. La aplicación del navegador puede alojarse por separado definiendo `VITE_API_BASE_URL` antes de compilarla. Auth y Realtime conservan conexiones directas del SDK con Supabase; datos, exportación y archivos pasan por esta API.

## Integración descartable

```powershell
npm.cmd run test:prepare --workspace @juntopia/backend
# Aplicar administrativamente backend/.test-runtime/setup.sql en un entorno de pruebas.
npm.cmd run test:http:integration --workspace @juntopia/backend
# Pruebas directas de Supabase, opcionales:
npm.cmd run test:integration --workspace @juntopia/backend
# Aplicar backend/.test-runtime/cleanup.sql y retirar los fixtures locales.
```

Las pruebas reales no se ejecutan contra producción ni usan secretos administrativos en código. Ver [verificación](../docs/VERIFICACION.md).
## Nuevas rutas de acceso

POST /api/auth/register valida correo, aceptación, URL de retorno y contraseña antes de llamar a Supabase Auth. POST /api/auth/password exige sesión válida y la política de ocho caracteres con mayúscula antes de actualizarla. Las contraseñas se mantienen sólo en la solicitud y no se registran.

Las rutas de registro están limitadas por dirección de conexión; Supabase mantiene sus propios controles adicionales. Los ajustes globales de Auth requieren una sesión administrativa y no se modificaron desde este equipo. Ver ../docs/CORREOS_LOCALES.md.
