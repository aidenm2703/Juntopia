# Juntopia · auditoría y plan

La base recibida es React con Vite en JavaScript, sin backend, pruebas ni rutas. App.jsx importa tres imágenes ausentes. Se preserva Vite y la referencia src/assets/Juntopia.png, inspeccionada antes de implementar. Identidad: bosque profundo, crema, oliva, luz cálida y paneles redondeados. La referencia no se utiliza como fondo ni como catálogo real.

## Arquitectura

React + TypeScript; componentes compartidos en components, flujos en features, acceso a Supabase en lib. PostgreSQL y Auth aplican permisos reales con RLS; el navegador utiliza exclusivamente una clave publicable. Sin proyecto confirmado no se altera ninguna base remota. El perfil privado contiene nombre, identificador único, avatar estructurado, intereses, privacidad y avance del onboarding.

## Modelo incremental

Fase 1: auth.users → profiles (1:1, propietario exclusivamente). Avatar persistido como parámetros, no una URL generada. Identificador único normalizado. Intereses inicialmente como lista validada.

Fase 3: categories → content_items → content_sources/external_ids; profiles → collections → collection_items; estados y reseñas con unicidad usuario/contenido. Separar metadatos globales de interacciones privadas.

Fases 5–6: amistades, bloqueos, conversaciones y miembros; parties, invitaciones, participantes y mensajes. Acceso según membresía, privacidad y bloqueos; nunca habilitar lectura global de conversaciones.

## Fases verificables

1. Entrada pública, temas, autenticación y onboarding con seis avatares; esquema privado con RLS.
2. Dashboard conectado y estados vacíos; sin amigos, puntuaciones o reproductor ficticios.
3. Catálogo, colecciones, reseñas y pruebas de aislamiento entre usuarios.
4. Adaptadores de proveedores tras validar sus términos vigentes.
5. Comunidad y moderación.
6. Parties y Realtime con pruebas de permisos y reconexión.
7. Creación original y extras.
8. Accesibilidad, rendimiento, revisión legal y despliegue.

## Límites

No se habilitan pagos ni reproducción. Antes del lanzamiento se requieren textos legales definitivos, SMTP, configuración de URLs permitidas, controles antiabuso y pruebas reales entre dos usuarios. El backend no se considera verificado hasta ejecutar su SQL y los flujos contra el proyecto correcto.
