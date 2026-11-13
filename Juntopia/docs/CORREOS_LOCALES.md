# Probar los correos de acceso en desarrollo local

## Correo abierto en un teléfono u otro equipo

localhost siempre se refiere al dispositivo que abre la dirección. Un enlace a http://localhost:3000 no puede mostrar la aplicación del computador desde el teléfono. Para usarla directamente en el teléfono hace falta una URL HTTPS accesible y configurada como retorno en Supabase.

Para probar sin publicar:

1. Dejá Juntopia abierto en el computador: http://localhost:3000.
2. En el formulario de ingreso o recuperación, abrí «¿El correo abre localhost en otro dispositivo?».
3. En el correo, copiá el enlace del botón sin abrirlo y pegalo en ese campo de Juntopia. El campo oculta el enlace; no lo envía a otras personas ni lo guarda en logs.
4. Si ya abriste el enlace y el navegador quedó en una página localhost que no carga, también podés copiar esa dirección completa y pegarla en el mismo campo.
5. Si es recuperación, Juntopia muestra el formulario para elegir la nueva contraseña. Si es confirmación y el correo ya quedó confirmado, también podés volver al computador e ingresar normalmente.

Un enlace puede vencer o ser de un solo uso. Si ya no funciona, pedí uno nuevo. No pegues esos enlaces en chats ni los compartas: contienen acceso a tu cuenta.

## Contraseña

Registro y cambio exigen al menos ocho caracteres y una mayúscula. No se exige un número o símbolo adicional. El ingreso conserva compatibilidad con contraseñas anteriores.

La política se comprueba en el formulario y en la API Node antes de crear o cambiar la contraseña. Una prueba descartable confirmó que una contraseña de ocho caracteres con mayúscula se guarda en Supabase y permite ingresar.

## Configuración remota de Supabase

VITE_AUTH_REDIRECT_URL permite fijar la dirección de retorno, pero esa dirección debe estar permitida en Supabase Auth. Para desarrollo en este computador usar http://localhost:3000/ y revisar Site URL y Redirect URLs. Esto no hace que localhost sea accesible desde el teléfono.

El proyecto remoto tiene además sus propios controles de longitud y caracteres de contraseña. La CLI de este equipo no tiene una sesión administrativa (AccessTokenRequiredError), así que no se modificaron sus ajustes globales. Para alinear también esos controles, un administrador debe revisar Auth → Email y establecer mínimo ocho y la regla de mayúscula, sin añadir requisitos que la aplicación no solicita. No es necesario compartir tokens administrativos en el chat ni colocarlos en el frontend.

Referencias oficiales: [URLs de retorno](https://supabase.com/docs/guides/auth/redirect-urls), [seguridad de contraseñas](https://supabase.com/docs/guides/auth/password-security).
Si el correo ya está confirmado, usar «Ya tengo cuenta» e ingresar con la contraseña elegida originalmente. Reiniciar los servidores o empezar en registro no elimina esa cuenta. Ante una contraseña olvidada, usar recuperación en lugar de intentar registrar de nuevo el mismo correo.
