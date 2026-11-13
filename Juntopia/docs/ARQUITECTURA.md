# Arquitectura modular de Juntopia

JavaScript con dos workspaces independientes. El frontend tiene su propio src y servidor de desarrollo; el backend tiene su propio src y API Node.js. El package.json raíz orquesta ambos procesos y un lockfile común hace reproducible la instalación.

## Frontend

frontend/src/app compone navegación y layout. frontend/src/modules agrupa las funciones del producto por dominio. frontend/src/shared contiene interfaz, hooks, dominio y clientes HTTP reutilizables.

El navegador sólo se comunica con rutas explícitas de la API para datos, perfiles, exportación y archivos. El SDK público de Supabase se conserva para iniciar/cerrar sesión y recibir eventos Realtime. Ningún archivo de backend se importa en frontend.

## Backend

backend/src/server.js inicia la API; app.js compone el manejo HTTP. config valida el entorno. middleware verifica las sesiones con Supabase Auth, CORS, tamaño de cuerpos y límites de solicitudes. routes registra las interfaces de los módulos account, catalog, library, community, parties, creators y moderation.

controllers interpreta solicitudes; services comprueba operaciones, filtros, propiedad explícita y campos permitidos; database/repositories realiza las consultas. Los servicios específicos de cuenta y creadores gestionan exportación y archivos.

Cada petición crea un cliente Supabase con el JWT del usuario verificado y la clave publicable, sin compartir sesiones ni usar service_role. RLS permanece como control de autorización de la base. La API no permite acceder a tablas o RPC fuera de sus módulos.

backend/supabase contiene las migraciones, restricciones, RLS, transacciones de RSVP, auditoría, Storage y Realtime que se ejecutan en Supabase. Las migraciones históricas se conservan sin cambios. Las pruebas se dividen en unitarias, HTTP, integración real y SQL.

## Comunicación

Navegador React → /api del backend → middleware de sesión → ruta/controlador → servicio → repositorio → Supabase con RLS.

En desarrollo Vite hace proxy desde localhost:3000/api al servidor Node 127.0.0.1:4000. En producción el operador configura un proxy HTTPS o una URL de API y CORS explícitos.

## Reglas de dependencias

app compone módulos; modules usa shared. shared no depende de módulos ni backend. backend no depende de React, Vite o archivos del frontend. Las pruebas de arquitectura verifican estas fronteras.

frontend/.env.local contiene sólo variables VITE_ publicables. backend/.env.local es independiente. Los secretos futuros pertenecen exclusivamente al backend o a funciones de servidor; nunca se transfieren al navegador.

La referencia visual se conserva en frontend/src/shared/assets/Juntopia.png. Esta reorganización añade una capa API real y no altera los datos ni el esquema remoto.
