# Seguridad

- Todas las tablas expuestas tienen RLS y grants explícitos. El rol anónimo no puede consultar perfiles, biblioteca, chats ni creación privada.
- UPDATE de propiedad exige USING y WITH CHECK. No se puede reasignar contenido privado a otra persona. Columnas sensibles de amistades, Parties y notificaciones tienen grants limitados.
- Las funciones privilegiadas viven en private, con search_path vacío, sin ejecución por PUBLIC/anon y con validación de auth.uid. Nunca se usa user_metadata para asignar roles.
- La tarjeta comunitaria es opt-in. La presencia también lo es; sólo participantes pueden verla y caduca a los 70 segundos sin heartbeat. Los bloqueos cortan acceso a conversaciones y planes.
- Los cupos se comprueban transaccionalmente; el anfitrión ocupa un lugar. No es posible forzar RSVP con INSERT directo.
- Hay restricciones de longitud, unicidad, categorías, estados, progreso, avatar y enlaces HTTPS. React escapa textos; no se renderiza HTML de usuarios.
- Los enlaces rechazan esquemas ejecutables y credenciales embebidas; las pestañas externas usan noopener/noreferrer.
- Las escrituras sociales tienen un límite de 40 inserciones por usuario por minuto, serializado por bloqueo de transacción. Auth mantiene sus propios límites; CAPTCHA/SMTP requieren configuración del operador.
- Storage acepta JPG/PNG/WebP hasta 5 MB en carpetas propias. El bucket es privado, las subidas no permiten sobrescritura y las URLs firmadas duran un minuto. Una URL firmada ya emitida puede funcionar hasta que caduque aunque cambie la visibilidad.
- Las variables VITE_ son públicas. No colocar service_role, secretos de JWT, SMTP ni credenciales de proveedores en ellas. .env.local y fixtures de prueba están ignorados por Git.

## Revisión de Supabase

Sin alertas ERROR/WARN en el asesor de seguridad al revisar esta entrega. Hay tres avisos INFO intencionales: private.moderators, private.moderation_log y private.write_events tienen RLS sin políticas públicas, porque son de acceso administrativo o por funciones controladas. No añadir permisos públicos para silenciarlos. Referencia: https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy

La revisión no equivale a una auditoría de penetración. Antes del lanzamiento faltan correo, controles operativos de moderación, retención, eliminación de cuentas y pruebas de carga.

## Dependencias

La instalación detectó cuatro avisos moderados en dependencias de desarrollo de ESLint/minimatch; sin avisos de producción en la auditoría realizada. No se degradaron versiones ni se aplicó audit fix --force. Revisar el registro npm y actualizar de forma compatible antes del lanzamiento.
## Capa API independiente

El servidor Node valida cada token con Auth.getUser antes de consultar datos. Se utiliza un cliente Supabase nuevo por petición, con la clave publicable y la autorización del usuario, por lo que RLS sigue vigente. Las rutas no aceptan nombres arbitrarios de tablas/RPC, filtros sin validar ni actualizaciones sin filtro. La API limita cuerpos y solicitudes, comprueba firma de imágenes y no devuelve detalles internos o credenciales.

El SDK del navegador queda para Auth y Realtime. En producción la API debe exponerse mediante HTTPS con FRONTEND_ORIGINS exactos. No se usan cookies de sesión para las rutas API; cada llamada envía Authorization y las respuestas tienen Cache-Control: no-store.
