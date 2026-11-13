# Arquitectura modular de Juntopia

El proyecto usa JavaScript y dos workspaces npm independientes: frontend y backend. El package.json de Juntopia sólo orquesta comandos; cada workspace declara sus dependencias y configuración. Un lockfile común permite npm ci desde Juntopia.

## Frontend

app compone la aplicación, navegación y layout. modules agrupa auth, home, catalog, library, collections, community, parties, creators, profile y moderation. Cada módulo tiene una entrada pública index.js y sus páginas/componentes. Parties separa listado, formulario, sala, cola, tarjeta y presencia.

shared contiene únicamente piezas reutilizables. Los componentes comunes no importan módulos. El transporte, la conexión Supabase, Storage y exportación están separados dentro de shared/data. Esa capa es un cliente de navegador, no un backend: no contiene secretos ni decide permisos.

## Backend

backend/supabase/migrations contiene tablas, restricciones, índices, RLS, funciones RPC, triggers, políticas Storage y publicación Realtime. El código se ejecuta en los servicios Supabase. backend/supabase/tests contiene pruebas SQL. backend/tests/integration contiene pruebas contra la API; backend/scripts prepara cuentas descartables.

Las reglas de propiedad y privacidad, RSVP con bloqueo de fila, moderación y acceso a archivos se mantienen en el servidor. No se duplican en un servidor Express. Las migraciones históricas son inmutables y conservan exactamente su contenido tras el movimiento.

## Dependencias permitidas

- app puede componer módulos y shared.
- modules puede usar shared y las interfaces de otros dominios.
- shared no puede depender de app/modules ni del backend.
- frontend no puede importar archivos de backend ni módulos node:.
- backend no puede importar React, Vite ni fuentes de frontend.

Estas fronteras se verifican en frontend/tests/architecture.test.js. GitHub Actions tiene trabajos separados para frontend y backend.

## Configuración

frontend/.env.local sólo contiene variables VITE_ publicables. backend/.env.local es independiente y usa SUPABASE_URL y SUPABASE_PUBLISHABLE_KEY para integración. Los secretos futuros de proveedores deben configurarse únicamente en backend/Edge Functions. Ambos archivos están ignorados por Git.

La referencia visual se conserva en frontend/src/shared/assets/Juntopia.png. La reorganización preserva los flujos existentes y no modifica el esquema ni los datos del proyecto Supabase.
