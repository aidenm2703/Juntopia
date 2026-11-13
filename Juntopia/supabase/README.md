# Backend Juntopia

Proyecto: czdldzleooqoqerxmmkk, región us-east-1.

profiles sólo concede SELECT/INSERT/UPDATE al propietario. No hay lectura anónima ni borrado desde el navegador. El nombre único no es un directorio público. No se necesitan funciones SECURITY DEFINER ni secretos frontend para guardar el onboarding.

La migración local coincide con la versión registrada en el proyecto remoto. Las pruebas SQL deben ejecutarse administrativamente en un entorno de prueba; crean usuarios sintéticos en una transacción y terminan con rollback.
