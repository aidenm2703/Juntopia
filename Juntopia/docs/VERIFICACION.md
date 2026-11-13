# Verificación

## Etapa actual: backend con src propio

- Lint de frontend y backend aprobado.
- Ocho pruebas de frontend: arquitectura, separación entre proyectos, acceso a datos únicamente por la API, URLs, agenda y errores.
- Nueve pruebas de backend: configuración, sesiones, aislamiento de clientes, asignación de propietario, consultas peligrosas, cuerpos grandes, CORS, imágenes, límites y sanitización de errores. Incluyen solicitudes HTTP reales a un servidor local con dependencias de datos aisladas.
- Diez comprobaciones de render estático: entrada pública, registro, contraseñas, seis avatares distintos y enlaces.
- Compilación de frontend aprobada y sintaxis de servidor/scripts comprobada.
- Doce comprobaciones reales a través de la API Node y Supabase: autenticación, perfil propio/ajeno, colección privada, escritura ajena, RSVP concurrente, exportación por usuario, subida/firma/retirada de imágenes y rechazo de privilegios de moderación.
- Backend /api/health y proxy desde localhost:3000/api responden HTTP 200.
- Las cuentas y archivos descartables se retiraron; la consulta final confirmó cero cuentas smoke.

La nueva API utiliza el JWT del usuario y la clave publicable, sin service_role. Las pruebas reales comprueban que la capa Node conserva RLS; los tests con dobles no se presentan como prueba de permisos de la base.

## Evidencia previa conservada

Las pruebas SQL de perfiles y comunidad se ejecutaron con rollback. La integración directa de Supabase pasó treinta comprobaciones de Auth, REST, RLS, Realtime y Storage. No se modificaron las cinco migraciones durante esta etapa. Tres avisos INFO de tablas administrativas sin políticas son intencionales; no se abrieron sus permisos.

## Repetir integración

Configurar backend/.env.local según backend/.env.example y usar un proyecto de pruebas con las migraciones aplicadas.

```powershell
npm.cmd run test:prepare --workspace @juntopia/backend
# Aplicar backend/.test-runtime/setup.sql desde administración.
npm.cmd run test:http:integration --workspace @juntopia/backend
# Opcional, integración directa de Supabase:
npm.cmd run test:integration --workspace @juntopia/backend
# Aplicar backend/.test-runtime/cleanup.sql desde administración.
```

Los fixtures contienen contraseñas aleatorias descartables: no imprimirlos ni subirlos. Retirar los archivos locales al terminar. No ejecutar estas preparaciones contra producción. Los scripts no contienen claves administrativas.

## Pendiente

Revisión visual de escritorio/móvil, entrega real de correo y recuperación desde bandeja, carga, pentest, revisión legal y despliegue público. No se dan por verificadas las integraciones externas o la reproducción que no están habilitadas.
