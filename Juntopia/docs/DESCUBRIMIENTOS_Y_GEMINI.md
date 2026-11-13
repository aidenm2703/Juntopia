# Catálogo, Gemini y fotos de perfil

El catálogo arranca con 48 fichas, seis por categoría: Música, Cine y series, Libros, Videojuegos, Anime y manga, Arte, Podcasts y Documentales. Son títulos reales con descripciones originales breves y enlaces a sus fuentes. La precarga tiene propietario nulo, queda disponible a miembros autenticados y no depende de una cuenta de usuario. Las políticas existentes impiden que un miembro la borre. No se modificaron cuentas ni bibliotecas existentes.

## Buscar, guardar y calificar

Descubrir filtra las fichas guardadas y, tras 650 ms sin escribir, busca también en proveedores externos. Se pueden buscar títulos y artistas, por ejemplo Daddy Yankee. Los conectores usan Apple iTunes Search, TVmaze, Open Library, Jikan/Kitsu, Art Institute of Chicago y CheapShark. Wikipedia sirve como alternativa enciclopédica para cine, documentales, anime y arte cuando no responde la fuente principal o no ofrece coincidencias. Cada ficha indica su fuente; TVmaze y Wikipedia mantienen la atribución CC BY-SA. Las imágenes se enlazan desde sus fuentes, sin alojar las obras ni reproducirlas. Las respuestas de Apple se usan sólo como metadatos y enlaces a la tienda.

Al elegir un resultado externo, el backend lo importa a content_items y abre su ficha. Sólo acepta identificadores de resultados que obtuvo el propio servidor; no acepta una URL o metadatos inventados por el navegador. La clave única de categoría y URL evita duplicados. En la ficha se puede marcar pendiente, en progreso, completado o abandonado, guardar favoritos y progreso, y publicar una calificación de 1 a 5. La etiqueta de completado cambia a «Ya lo escuché», «Ya lo leí», «Ya lo jugué», «Ya lo conozco» o «Ya lo vi» según la categoría.

## Gemini

GEMINI_API_KEY vive exclusivamente en backend/.env.local, ignorado por Git. No se agrega a una variable VITE_, al frontend, a URLs de consulta ni a logs. El backend llama por REST a Google con x-goog-api-key. GEMINI_MODEL permite cambiar el modelo; se verificó gemini-3.5-flash-lite con una consulta real. Configuración de ejemplo en backend/.env.example, sin clave.

«Preguntale a Gemini» abre un chat desde cualquier pantalla privada. El chat explica que el mensaje, los intereses y los títulos favoritos o bien calificados se envían a Google. No se envían contraseñas, correo, nombre, foto, tokens, mensajes privados ni la clave como parte del prompt. El historial se mantiene sólo en memoria del componente y puede limpiarse; las respuestas de recomendación se cachean en memoria del servidor durante diez minutos. No se escriben conversaciones en la base de datos.

Inicio y cada categoría solicitan recomendaciones al abrirse. Gemini elige IDs existentes y propone hasta tres títulos nuevos. El servidor busca esos títulos en APIs reales antes de importarlos; no utiliza enlaces generados por el modelo. Los elementos completados o abandonados se excluyen, y las categorías de interés y los autores bien calificados tienen prioridad. Si la IA falla o agota cuota, el usuario ve el aviso y conserva recomendaciones del catálogo.

Las recomendaciones crecen al llegar al final de la selección y con «Descubrir más con Gemini». Hay hasta tres lotes automáticos al desplazarse con la página visible, hasta diez lotes solicitados y 60 tarjetas por vista. Las fichas que se verifican se guardan en el catálogo para futuras visitas. Se evita repetir las IDs ya mostradas.

No hay un proceso permanente que consuma la API en segundo plano con la aplicación cerrada. El backend agrupa solicitudes simultáneas, cachea búsquedas quince minutos, limita la IA a 12 solicitudes por minuto por usuario y 60 generaciones por hora por proceso, y pausa temporalmente las llamadas ante fallos o cuota. Son límites de desarrollo en memoria; para múltiples instancias haría falta almacenamiento compartido. Una cuota de Google o un proveedor caído puede reducir los resultados nuevos sin vaciar las categorías.

## Foto o personaje

Los seis personajes tienen siluetas, peinados y rasgos distintos incluso con iguales colores y accesorios. Perfil y bienvenida también permiten subir JPG, PNG o WebP, alternar entre personaje y foto y guardar la elección. El navegador recorta el centro y exporta una imagen JPEG de 512×512 para retirar los metadatos de cámara y reducir el tamaño. La API comprueba formato y límite de dos MB; el selector acepta originales de hasta diez MB para procesarlos.

Las fotos se guardan en el bucket privado profile-photos. Cada persona escribe y borra únicamente su carpeta. La foto sólo puede leerse por su propietario o por miembros autorizados a ver su tarjeta mediante RLS. Las URLs firmadas duran cinco minutos y se renuevan durante la visualización. Ocultar una tarjeta evita emitir nuevos enlaces a otras personas sin acceso; un enlace firmado previamente puede seguir vigente hasta vencer. La base rechaza que un perfil asocie una ruta de foto de otro propietario.

## Verificación

- Lint de ambos workspaces, pruebas unitarias/HTTP y compilación de producción.
- Prueba real de Gemini con JSON estructurado y prueba de búsqueda por categoría con fuentes alternativas.
- Prueba integral con cuentas descartables: ocho categorías, subida y descarga de foto, visibilidad y ocultamiento entre cuentas, rechazo de foto de otro dueño, guardado de estado y calificación, búsqueda de Daddy Yankee, importación sin duplicados, chat Gemini y segundo lote sin repetir.
- Las fotos, sesiones, cuentas y archivos de credenciales de prueba se retiraron al terminar. No se usó la cuenta del usuario.
- Migración aplicada: 20261113202626_discovery_and_profile_photos.sql. Confirmados bucket privado, seis fichas por categoría y throttle de escrituras habilitado tras la precarga. Sin nuevos hallazgos en el asesor de seguridad; siguen los avisos previos de tablas privadas sin políticas públicas y protección de contraseñas filtradas pendiente en Auth.

Documentación: [Gemini REST](https://ai.google.dev/api/generate-content), [salidas estructuradas](https://ai.google.dev/gemini-api/docs/structured-output), [buckets privados](https://supabase.com/docs/guides/storage/buckets/fundamentals), [Apple Search](https://performance-partners.apple.com/search-api), [TVmaze](https://www.tvmaze.com/api), [Open Library](https://openlibrary.org/dev/docs/api/search), [Jikan](https://docs.api.jikan.moe/), [Kitsu](https://kitsu.docs.apiary.io/), [Art Institute](https://api.artic.edu/docs/), [CheapShark](https://apidocs.cheapshark.com/).
