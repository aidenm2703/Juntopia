# Backend · Supabase

Este workspace contiene el backend real de Juntopia. PostgreSQL, Auth, Storage y Realtime se ejecutan en Supabase; no requiere levantar un servidor Express ni contiene componentes React.

## Responsabilidades

| Dominio | Implementación de backend |
| --- | --- |
| Perfil y acceso | `profiles`, `member_cards`, `policy_acceptances`, RPC `save_profile`, Auth |
| Catálogo y biblioteca | `categories`, `content_items`, `user_content_status`, `reviews`, colecciones |
| Comunidad | amistades, bloqueos, conversaciones, mensajes y notificaciones |
| Parties | agenda, invitaciones, RSVP transaccional, cupos, expulsiones, cola, votos y presencia |
| Creadores | obras, comentarios, atribución y bucket privado |
| Moderación | reportes, rol interno y auditoría de decisiones |

`supabase/migrations/` es la fuente versionada del esquema, RLS, funciones, triggers y políticas Storage. Las migraciones ya aplicadas se conservan sin modificaciones. Una nueva función de backend se introduce mediante una nueva migración o una función de servidor cuando necesite secretos externos.

## Organización

- `supabase/migrations/`: implementación y evolución de la base de datos.
- `supabase/tests/`: comprobaciones SQL con rollback para perfiles y comunidad.
- `tests/integration/api-smoke.mjs`: comprobaciones reales de Auth, REST, Realtime y Storage.
- `scripts/prepare-smoke.mjs`: fixtures descartables, sin claves administrativas en el código.
- `.env.example`: contrato de configuración backend; `.env.local` está ignorado.

## Comandos desde Juntopia

```powershell
npm.cmd run lint --workspace @juntopia/backend
npm.cmd run check:backend
npm.cmd run test:prepare --workspace @juntopia/backend
# Aplicar administrativamente backend/.test-runtime/setup.sql en un proyecto de pruebas.
npm.cmd run test:integration --workspace @juntopia/backend
# Aplicar backend/.test-runtime/cleanup.sql y retirar los fixtures al terminar.
```

El chequeo local valida sintaxis de scripts. No se presenta como una ejecución de pruebas SQL contra una base de datos. La integración requiere cuentas descartables preparadas y no se ejecuta automáticamente en CI ni contra producción.

## Seguridad

El frontend se comunica con este backend mediante la API pública de Supabase; RLS y las funciones de servidor deciden cada permiso. Los secretos de servidor pertenecen exclusivamente al entorno del backend/Supabase. No importar archivos de esta carpeta desde frontend.

La separación de carpetas no cambia la base remota ni su historial de migraciones. Ver [seguridad](../docs/SEGURIDAD.md) y [verificación](../docs/VERIFICACION.md).
