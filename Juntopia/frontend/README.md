# Frontend · JavaScript + React

Aplicación del navegador, independiente de `backend/src/`. Conserva su propia entrada, módulos, configuración, pruebas y variables de entorno.

## Capas

- `src/app`: composición, rutas, entrada y layout general.
- `src/modules`: auth, home, catalog, library, collections, community, parties, creators, profile y moderation.
- `src/shared/components` y `hooks`: interfaz y estado reutilizables.
- `src/shared/domain`: constantes, formatos y validaciones de experiencia de usuario.
- `src/shared/data/http.js`: cliente HTTP autenticado del backend.
- `repository.js`: llamadas REST/RPC a rutas explícitas; no consulta tablas directamente.
- `storage.js` y `accountExport.js`: llamadas a los servicios del backend, sin lógica de persistencia.
- `client.js`: SDK público exclusivamente para Auth y Realtime.

La seguridad y las validaciones de servidor pertenecen al backend y a RLS. El navegador no importa archivos del backend ni recibe sus variables de entorno.

## Ejecutar desde Juntopia

```powershell
npm.cmd run dev:frontend
npm.cmd run lint --workspace @juntopia/frontend
npm.cmd test --workspace @juntopia/frontend
npm.cmd run test:render --workspace @juntopia/frontend
npm.cmd run build --workspace @juntopia/frontend
```

También podés usar `npm.cmd run dev` desde Juntopia para iniciar ambos procesos. Si ya hay uno abierto, usá los comandos independientes o cerrá el proceso anterior antes de reiniciar.

Configuración: `frontend/.env.local`, basada en `.env.example`. Las variables VITE_ son públicas: sólo URL, clave publicable de Supabase y `VITE_API_BASE_URL`. Nunca service_role, SMTP ni secretos de proveedores.

Desarrollo: http://localhost:3000. Vite redirige `/api` al backend http://127.0.0.1:4000. Salida de compilación: `frontend/dist/`. En producción se necesita un proxy `/api` al backend o configurar la URL HTTPS de la API antes del build.
## Inicio limpio para las pruebas locales

Con VITE_AUTH_PERSIST_SESSION=false en frontend/.env.local, cada carga nueva elimina únicamente el token local de este proyecto, descarta una recuperación antigua y entra al registro. La sesión se mantiene en memoria mientras la página esté abierta; al recargar o abrir otra pestaña hay que ingresar de nuevo. No se borran cuentas, bibliotecas, progreso del onboarding ni preferencias de tema.

Las rutas públicas explícitas y los enlaces válidos de confirmación/recuperación conservan su destino. Para volver a recordar la sesión entre visitas, configurar VITE_AUTH_PERSIST_SESSION=true y reiniciar Vite.
