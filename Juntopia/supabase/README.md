# Backend de Juntopia

Proyecto remoto: czdldzleooqoqerxmmkk. Región us-east-1.

Las cinco migraciones versionadas ya están aplicadas y sus marcas temporales coinciden con el historial remoto. No volver a aplicarlas manualmente. Para otro entorno, usar la CLI de Supabase autenticada con el flujo vigente de migraciones.

Las tablas expuestas tienen RLS. Las privadas no conceden acceso a clientes. SECURITY DEFINER se limita a funciones internas con permisos explícitos; las RPC públicas son invoker. Ver docs/SEGURIDAD.md.

La prueba profile_isolation valida el perfil privado; community_isolation valida el núcleo social y la presencia. Ambas terminan con rollback. Los scripts de integración usan cuentas temporales con preparación/limpieza administrativa y ninguna clave secreta en el código.

Para designar a un moderador, un administrador debe insertar el UUID correcto en private.moderators. El frontend no puede hacerlo ni editar esa tabla. El panel exige el rol y registra sus decisiones en private.moderation_log.

Storage utiliza el bucket privado creator-works. No eliminar objetos mediante SQL: usar la API de Storage para retirar también el archivo físico. Para eliminar una cuenta real hay que revocar sesiones, retirar archivos y después eliminar auth.users mediante administración.
