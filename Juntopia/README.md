# Juntopia

Comunidad para descubrir y compartir planes. React + TypeScript + Vite y Supabase Auth/PostgreSQL. Desarrollo en la rama Aiden.

## Ejecutar

Desde la carpeta Juntopia:

```powershell
npm.cmd ci
Copy-Item .env.example .env.local
# Completar URL y clave publicable de Supabase.
npm.cmd run dev
```

La configuración local ya apunta al proyecto nuevo czdldzleooqoqerxmmkk. .env.local no se sube a Git. Nunca usar claves secretas/service_role en variables VITE_.

## Verificar

```powershell
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run build
```

La migración supabase/migrations/20261113160527_identity_profiles.sql ya se aplicó al proyecto remoto. No volver a aplicarla manualmente. La prueba supabase/tests/profile_isolation.sql verifica aislamiento entre usuarios, actualización propia y restricciones de avatar. Usa ROLLBACK y no deja cuentas de prueba.

## Implementado

- Landing pública sin datos privados ni contenido ficticio.
- Temas claro/oscuro/sistema persistidos localmente, foco visible y movimiento reducido.
- Supabase Auth: restauración de sesión, ingreso, solicitud de recuperación, cambio de contraseña y cierre de sesión.
- Acceso privado condicionado por sesión y onboarding.
- Seis avatares SVG parametrizados, color, nombre, identificador único, biografía, intereses y privacidad.
- Guardado de avance en cada paso para reanudar en otro dispositivo.
- Perfil PostgreSQL con restricciones y RLS por propietario.
- Inicio privado con estados vacíos y edición del perfil.

## Pendiente antes de usar con personas reales

El formulario y llamada de registro están preparados; el botón permanece deshabilitado hasta contar con términos/política y aceptación versionada. No se simula éxito. Para probar el onboarding mientras tanto, crear una cuenta de prueba en Supabase Auth con el correo de quien prueba y acceder desde Ingresar.

En Supabase Auth → URL Configuration establecer Site URL y Redirect URLs para http://127.0.0.1:5173 y posteriormente el dominio real. Revisar confirmación de correo, contraseña, SMTP y controles antiabuso antes del lanzamiento. Recuperación basada en la documentación oficial: https://supabase.com/docs/reference/javascript/auth-resetpasswordforemail

La privacidad de actividad se guarda como preferencia; aún no existe publicación de actividad. Catálogo, comunidad, Parties y pagos pertenecen a fases siguientes.

## Validación

TypeScript, lint y build ejecutados. Prueba SQL ejecutada contra el proyecto nuevo y asesor de seguridad sin alertas. Servidor local devuelve HTTP 200. Revisión visual pendiente: el host de automatización del navegador no está disponible. Entrega de correo y flujos autenticados completos pendientes de una cuenta de prueba; no se consideran verificados.

Auditoría npm: 10 avisos moderados de desarrollo por la cadena de minimatch; ninguno en producción. No se aplicó audit fix --force ni degradación automática.

Ver docs/ARQUITECTURA.md. Próximo bloque: terminar registro/consentimiento y validar Auth antes de ampliar el catálogo.
