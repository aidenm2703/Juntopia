# Frontend · JavaScript + React

Este workspace contiene exclusivamente la aplicación del navegador. Ejecutar `npm ci` desde la carpeta Juntopia para instalar ambos workspaces con el lockfile compartido.

## Capas

- `src/app`: composición, rutas, entrada y layout general.
- `src/modules`: auth, home, catalog, library, collections, community, parties, creators, profile y moderation. Cada dominio expone un `index.js` y mantiene sus páginas y componentes específicos.
- `src/shared/components`: interfaz reutilizada entre dominios.
- `src/shared/hooks`: consultas, acciones y suscripciones.
- `src/shared/domain`: categorías, avatar, formatos y validaciones del cliente.
- `src/shared/data/client.js`: conexión pública con Supabase.
- `src/shared/data/repository.js`: transporte CRUD/RPC.
- `src/shared/data/storage.js`: cliente de archivos autorizados.
- `src/shared/data/accountExport.js`: descarga de datos propios.
- `src/shared/data/api.js`: fachada compatible para los módulos anteriores.

Las reglas de autorización y negocio se ejecutan en el backend. La validación del navegador mejora la experiencia, pero no concede permisos.

## Ejecutar desde Juntopia

```powershell
npm.cmd run dev --workspace @juntopia/frontend
npm.cmd run lint --workspace @juntopia/frontend
npm.cmd test --workspace @juntopia/frontend
npm.cmd run test:render --workspace @juntopia/frontend
npm.cmd run build --workspace @juntopia/frontend
```

Configuración local: `frontend/.env.local`, basada en `.env.example`. Las variables VITE_ se publican en el navegador; aquí sólo se admiten URL y clave publicable, nunca service_role, SMTP o secretos de proveedores.

Salida: `frontend/dist/`. Puerto de desarrollo: 3000. La configuración local anterior se conservó al moverla. Las pruebas de arquitectura impiden importar backend desde el navegador y mantienen shared independiente de módulos.
