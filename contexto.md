

1. Visión del producto
Juntopia es un mundo digital acogedor para personas que, incluso estando lejos, quieren hacer cosas juntas: descubrir y compartir música, películas, series, anime, manga, libros, videojuegos, podcasts, arte, documentales y otras experiencias culturales. Su frase central es «¿Cuál es el plan de hoy?». La propuesta no es una red social basada principalmente en un feed infinito: es una comunidad de intereses y actividades compartidas, con catálogos, colecciones personales, reseñas, amistades, chats y Parties (encuentros organizados).

Eslogan sugerido: «Diferentes caminos, un lugar para encontrarnos». El producto debe transmitir compañía, pertenencia, exploración y diversión. Debe sentirse como un lugar real al que se vuelve, no como un prototipo con botones decorativos.
2. Referencia visual obligatoria: assets/juntopia
1. Buscar en el repositorio una imagen cuyo nombre base sea juntopia dentro de assets (por ejemplo assets/juntopia.png, .jpg, .jpeg, .webp; también revisar src/assets y public/assets). No asumir una extensión ni una ruta exacta sin comprobarla.
2. Abrir e inspeccionar visualmente la imagen antes de implementar o rediseñar. Si la IA no puede verla, solicitar al usuario que la adjunte o describir esa limitación; no inventar detalles supuestamente observados.
3. Usarla como referencia principal de identidad y composición. No pegar la imagen como fondo de una página y llamarlo implementación: reconstruir la interfaz mediante componentes reales, accesibles y responsive.
4. Mantener su estética Bosque premium y acogedor, con un toque singular, más creíble y cuidado que una interfaz genérica de IA: verdes profundos, musgo, oliva, salvia, luces cálidas, crema, fotografías/ilustraciones de contenido cuidadosamente integradas, texturas naturales discretas, paneles translúcidos moderados, esquinas redondeadas, sombras suaves, jerarquía tipográfica limpia y abundante aire visual.
5. Conservar, en la medida que se aprecien en la imagen: logotipo Juntopia, menú lateral, barra de búsqueda superior, avatar, notificaciones, mensajes, saludo «¡Hola, [nombre]! 👋», subtítulo «¿Cuál es el plan de hoy?», tarjetas de categorías, recomendaciones, Parties activas, amigos conectados, próximos planes, espacio de Juntopia Plus y reproductor musical inferior solo cuando haya una fuente autorizada reproducible.
6. El motivo del bosque representa estar juntos: un refugio o casa del árbol, un punto de encuentro, caminos que convergen, luces compartidas, pequeñas señales de vida y comunidad. Evitar ballenas, estética oceánica, saturación de hongos decorativos, neón exagerado, personajes artificiales repetidos, fondos recargados y efectos visuales que dificulten leer o usar la aplicación.
7. El diseño debe sentirse como un producto web profesional terminado. Priorizar tipografía consistente, espaciado, contraste, alineación, estados de interacción y contenido auténtico. La imagen es referencia de apariencia, no prueba de que sus ejemplos de contenido, puntuaciones o reproducciones existan en la base de datos.
8. Si el proyecto ya tiene componentes y lógica, preservarlos y adaptarlos. No sobrescribir funcionalidades ni eliminar datos para igualar la imagen.
2.1. Paleta base propuesta (ajustar tras observar la imagen)
Token	Modo oscuro	Modo claro	Uso
--bg	#101B14	#F7F6EE	Fondo de aplicación
--surface	#1B2B20	#FFFFFF	Tarjetas y paneles
--surface-alt	#26382A	#EEF2E6	Superficies secundarias
--primary	#A5C86A	#397344	Acciones principales
--primary-hover	#C0DE87	#285C35	Hover
--text	#F5F5EA	#17271B	Texto principal
--muted	#B5C2B0	#536454	Texto secundario
--border	#3D5140	#DCE5D6	Bordes
--warm	#F1C77D	#A56D22	Luces, detalles


Colores de categoría, constantes en ambos temas pero ajustando tonos/contraste: Música violeta/lavanda #A78BFA; Cine y series coral #FB7185; Libros miel/dorado #F5B942; Videojuegos verde menta #34D399; Arte rosa/frambuesa #F472B6; Parties turquesa #35C6BE. Anime/manga puede usar índigo #818CF8; podcasts azul cielo #60A5FA; documentales ámbar #F59E0B; cursos/creación terracota #D99B75. Usar estos colores como acentos (iconos, chips, estados y bordes), no como fondos gigantes que compitan con el bosque.

Modo oscuro, claro y sistema: selector persistente por usuario, o localmente antes del inicio de sesión. Respetar prefers-reduced-motion, navegación por teclado, foco visible, contrastes WCAG y tamaños táctiles adecuados.
2.2. Estructura visual de la pantalla principal
- Escritorio: sidebar a la izquierda (Inicio, Descubrir, Parties, Biblioteca, Colecciones, Amigos, Mi perfil, Configuración); header con búsqueda, notificaciones, mensajes y menú del avatar; zona central con hero, categorías, recomendaciones y Parties; columna derecha con amigos y agenda si hay espacio; reproductor inferior contextual, no falso.
- Tableta: sidebar colapsable, tarjetas fluidas, columna secundaria reubicable.
- Móvil: navegación inferior o menú accesible, hero compacto, tarjetas desplazables o cuadrícula de dos columnas, agenda y amigos apilados; sin desbordamientos horizontales.
- Estados reales: loading, vacío, error, sin conexión, contenido no disponible, usuario sin amigos y Party sin participantes; nunca rellenar permanentemente con datos ficticios.
3. Entrada pública y acceso al mundo privado
3.1. Visitante sin sesión
Mostrar una landing pública separada del dashboard privado, inspirada en el estilo bosque: logo, breve explicación, ilustración/ambiente de un lugar de encuentro y texto sugerido:

«Bienvenido a Juntopia»

«El lugar donde podés divertirte, leer, descubrir música, jugar y encontrar personas con tus mismos gustos. Aunque estemos lejos, siempre podemos compartir un plan.»

Acciones claras: «Ingresar con mi cuenta» y «Crear cuenta». Opcional: secciones informativas públicas de cómo funciona, categorías y seguridad, sin exponer datos privados. No mostrar dashboard, chats o perfiles privados a usuarios sin autenticar.
3.2. Iniciar sesión
Supabase Auth con correo y contraseña, verificación de correo según configuración, recuperación de contraseña, cierre de sesión y manejo seguro de errores. OAuth con Google opcional si está configurado y permitido. No prometer proveedores no conectados. Redirigir según estado: onboarding pendiente o dashboard.
3.3. Crear cuenta y onboarding
Flujo por pasos con progreso, posibilidad de volver y guardado seguro:
1. Registro y aceptación de términos/política.
2. Elegir una de seis bases de avatar diferentes, visualmente consistentes con Juntopia; ofrecer diversidad de estilos sin imponer identidades.
3. Personalizar avatar (cabello, colores, accesorios, ropa, fondos y, si se implementa, expresiones). Crear y guardar representación propia; no depender de imágenes generadas en cada visita. Permitir editarlo después.
4. Elegir nombre visible, identificador único y descripción opcional; validar duplicados y reglas.
5. Seleccionar intereses y categorías (música, películas, series, libros, videojuegos, anime, manga, podcasts, arte, etc.), géneros y algunos favoritos; se pueden saltar pasos no esenciales.
6. Configurar privacidad básica y terminar con «Entrar a Juntopia».
Guardar estado del onboarding para reanudar si se interrumpe. Evitar bloquear a personas que todavía no saben sus gustos.
4. Navegación y funciones transversales
Todo contenido tiene una ficha normalizada con identificador, categoría, título, descripción, imagen con derechos/atribución, fuentes, identificadores externos, enlaces oficiales, disponibilidad y datos de autoría cuando proceda. Un usuario puede, según categoría:
- Buscar, filtrar y explorar.
- Guardar en favoritos y colecciones propias.
- Marcar estado: pendiente, en progreso, completado, abandonado o equivalente.
- Calificar y reseñar, con prevención de duplicados, edición y reportes.
- Añadir etiquetas emocionales personalizadas: «Me produce serotonina», «Para días difíciles», «Quiero compartirlo», etc.
- Compartir la ficha o una lista respetando privacidad.
- Ver coincidencias de gustos y sugerencias de personas, sin exponer datos privados.
- Crear una Party vinculada a esa ficha.
- Acceder a proveedores externos o reproductores autorizados cuando existan.
Regla fundamental: las funciones de comunidad, colecciones, reseñas y Parties deben funcionar aunque un proveedor de reproducción no esté disponible.
5. Módulos de contenido
5.1. Música
Catálogo de artistas, álbumes, canciones y géneros; búsqueda y fichas; calificaciones de canciones, álbumes y artistas; reseñas; playlists y colecciones emocionales; favoritos; compartir; recomendaciones; actividad de amigos si la privacidad lo permite. Si una canción no aparece, formulario «Solicitar/agregar canción» con título, artista, álbum opcional, enlaces y validación contra duplicados; revisión/moderación y trazabilidad de origen. No permitir que usuarios carguen audio comercial ajeno sin derechos.

Integraciones: MusicBrainz para metadatos según condiciones y límites; evaluar Jamendo solo bajo licencia compatible; YouTube IFrame Player API para videos insertables conforme a sus reglas; enlaces oficiales a Spotify, YouTube Music u otros. Spotify no debe ser requisito para usar música. No fingir reproducción ni extraer audio de videos. Un reproductor persistente solo aparece cuando hay audio/video autorizado y controlable; si no, mostrar «Abrir en proveedor».

Party musical: participantes, chat, lista/cola compartida, moderador, votaciones y reproducción sincronizada solo si la licencia y API del proveedor lo permiten. Para otros casos, actividad social compartida con enlaces oficiales y acciones coordinadas sin afirmar sincronización real.
5.2. Cine y series
Buscar y explorar películas/series; fichas, reparto cuando esté licenciado, temporadas/episodios, seguimiento, puntuaciones, reseñas, listas y recomendaciones. TMDB es candidato para metadatos, pero su uso comercial requiere revisar/obtener permisos; no asumir que la API gratuita sirve para Juntopia con anuncios/Plus. Mostrar plataformas oficiales de disponibilidad cuando los datos estén licenciados y sean regionalmente pertinentes. Parties de cine con sala, chat, calendario, cuenta regresiva y enlaces oficiales; no incrustar ni retransmitir Netflix, Disney+, Prime Video, Max, etc. sin acuerdos.
5.3. Libros y lectura
Google Books y Open Library para descubrimiento y metadatos según condiciones; biblioteca personal, progreso, citas breves propias, reseñas, calificaciones, metas, clubes y sesiones. Lector EPUB/PDF para archivos propios o contenidos autorizados y obras de dominio público verificadas por jurisdicción. No distribuir libros comerciales protegidos sin autorización. Permitir publicaciones originales en Tinta Viva, con autoría, capítulos, borradores, privacidad, comentarios y moderación.
5.4. Videojuegos
IGDB como candidato de metadatos (requiere credenciales de Twitch y cumplimiento de condiciones); fichas, plataformas, géneros, puntuaciones, backlog, jugado/por jugar, juegos cooperativos, grupos para encontrar compañeros, sesiones y Parties de juego. No afirmar que los juegos se ejecutan dentro de Juntopia. Enlaces a tiendas oficiales cuando corresponda.
5.5. Anime y manga
Fichas, temporadas, episodios/capítulos, progreso, calificaciones, reseñas, colecciones, recomendaciones, grupos de fans y sesiones. Evaluar proveedores como AniList/Jikan solo después de comprobar políticas, límites, derechos y compatibilidad comercial; crear adaptadores reemplazables.
5.6. Podcasts y documentales
Descubrimiento y fichas; podcasts mediante RSS públicos/autorizados con respeto a derechos, alojamiento y restricciones; episodios, seguimiento, favoritos, reseñas y salas de conversación. Documentales con catálogo y enlaces a fuentes oficiales. No rehostear archivos ajenos sin permiso.
5.7. Arte, creadores y aprendizaje
Galería Viva: portafolios, obras originales, técnicas, colecciones, comentarios, talleres y eventos. Permitir imágenes propias o con licencia válida; registrar autoría y derechos. Wikimedia Commons solo con licencias/atribuciones compatibles. Talleres, cursos y proyectos colaborativos; no copiar cursos de terceros. Tinta Viva para escritura original. Permitir denuncias, moderación y configuración de visibilidad.
6. Parties: núcleo social de Juntopia
Una Party es una experiencia compartida, no necesariamente un video sincronizado. Tipos: escuchar música, ver películas por proveedor externo, leer, club de anime, jugar, dibujar, escribir, conversar, talleres y sesiones temáticas.

Cada Party requiere: título, descripción, anfitrión, categoría, contenido opcional, modalidad, fecha/hora/zona horaria, duración, cupos, privacidad (pública/amigos/invitación), invitaciones, RSVP (voy/tal vez/no voy), lista de espera opcional, reglas, participantes, chat, moderación, reportes, recordatorios y estado (programada/en vivo/finalizada/cancelada). La agenda personal y las notificaciones deben reflejar los cambios.

Modalidades técnicas:
1. Integrada autorizada: reproductor y controles cuando el proveedor y la licencia lo permitan.
2. Externa coordinada: cada usuario abre el proveedor oficial; Juntopia ofrece chat, enlace, temporizador y coordinación sin eludir DRM ni afirmar reproducción sincronizada.
3. Actividad interna: chat, lectura autorizada, discusión, votaciones, dinámicas y colaboración sin medios externos.
Implementar en tiempo real presencia, mensajes y cambios de estado mediante Supabase Realtime donde sea apropiado. Manejar reconexiones, expulsiones, permisos y fallos de red.
7. Comunidad y perfiles
Perfiles con avatar, biografía, intereses, colecciones públicas, reseñas y actividad según configuración. Solicitudes de amistad o seguimiento según el modelo elegido, bloqueo, reportes, chats 1:1 y grupales, notificaciones y recomendaciones por gustos en común. Privacidad por defecto: no revelar bibliotecas privadas, presencia, ubicación precisa ni conversaciones. Permitir desactivar visibilidad de actividad. Controles antiacoso y herramientas de moderación.

No hacer que el feed infinito sea el centro de la experiencia; priorizar «qué hacer», «con quién» y «qué descubrir».
8. Monetización prevista (no implementar cobros ficticios)
Modelo freemium: funciones esenciales gratuitas. Juntopia Plus como propuesta inicial de USD 5.99/mes (precio sujeto a validación), con personalización adicional y ventajas no esenciales. Si se habilita publicidad, objetivo de máximo dos anuncios al día, nunca durante lectura, reproducción o Parties. Propinas voluntarias a creadores con reparto objetivo 75 % creador / 25 % plataforma, sujeto a pasarelas, comisiones, impuestos y reglas aplicables. No habilitar pagos, propinas o anuncios reales hasta definir proveedor, obligaciones legales, consentimiento y permisos. Evitar paywalls que impidan la función social básica.
9. Arquitectura y stack
- Primera fase: web responsive con React + TypeScript. Preferir Vite si el repositorio no tiene framework ya definido; conservar la base existente si está bien configurada. No migrar de framework sin autorización.
- UI: componentes reutilizables, diseño por tokens CSS, estados accesibles, iconografía coherente y animaciones sutiles. Tailwind opcional según proyecto.
- Backend: Supabase para PostgreSQL, Auth, Storage, Realtime y Edge Functions cuando corresponda.
- Futuro: aplicación nativa Android/iOS en una fase posterior (por ejemplo React Native) reutilizando contratos de API y lógica; no desviar el alcance inicial hacia una app nativa.
- Integraciones: capa de adaptadores por proveedor, sin acoplar las fichas a una sola API. Validación y normalización de datos, caché conforme a licencias, límites de uso, backoff, observabilidad y fallbacks.
- Seguridad: claves secretas únicamente en servidor/Edge Functions; variables públicas limitadas a valores publicables; Row Level Security en tablas de usuario; permisos por rol; validación server-side; políticas de Storage; rate limiting; sanitización de contenido y protección ante abuso.
- Desarrollo: migraciones versionadas, seed opcional identificado como demo, tipos generados, pruebas y documentación de configuración.
9.1. Entidades de base de datos orientativas
profiles, avatar_presets, avatar_customizations, user_interests, categories, content_items, content_external_ids, content_sources, artists, content_creators, collections, collection_items, user_content_status, ratings, reviews, review_reactions, tags, user_content_tags, friendships, follows (si aplica), blocks, conversations, conversation_members, messages, parties, party_invites, party_attendees, party_waitlist, party_messages, notifications, reports, moderation_actions, creator_posts, creator_works, chapters, playlists, playlist_items, integration_jobs, content_submissions, user_settings.

Estas son sugerencias: diseñar relaciones, claves foráneas, índices, unicidad, integridad, auditoría y RLS antes de crear tablas. No duplicar modelos si ya existen. Separar contenido global de las interacciones personales. Guardar identificadores externos y procedencia para evitar duplicados. Respetar términos de retención de cada proveedor.
10. Integraciones y permisos: decisiones obligatorias
Proveedor	Uso deseado	Riesgo/restricción	Estrategia inicial
Spotify	Música y cuentas	Reproducción, Premium, acceso ampliado y usos comerciales restringidos	Enlaces oficiales; no dependencia central
YouTube	Videos y música audiovisual	IFrame y políticas de reproductor, contenido no insertable	Embed oficial donde sea permitido
YouTube Music	Música	Sin API pública general equivalente para reproductor social propio	Enlaces oficiales / YouTube permitido
Netflix/Disney+/Prime Video/Max/Apple TV	Películas/series	Sin permiso general para retransmisión integrada	Fichas + Party externa con chat
MusicBrainz	Metadatos musicales	Límites y condiciones para uso comercial	Consultar licencias antes del lanzamiento
Jamendo	Música autorizada	Licencia según uso y monetización	Evaluar acuerdo comercial si aplica
Google Books	Libros/metadatos	No concede automáticamente texto completo	Catálogo + enlaces; lectura autorizada aparte
Open Library	Libros/metadatos	Límites, uso responsable y disponibilidad	Catálogo y fallback con caché permitida
IGDB	Videojuegos	Credenciales y términos de API	Integrar con backend seguro
TMDB	Cine/series	API gratuita no comercial; atribución/licencia comercial	Evaluar licencia antes de monetizar
AniList/Jikan u otros	Anime/manga	Términos y límites variables	Investigar antes de implementar
Wikimedia Commons	Arte/medios	Licencia específica por archivo	Mostrar atribución y derechos
RSS podcasts	Podcasts	Derechos y políticas de cada feed	Solo reproducción/enlaces permitidos


Antes de programar una integración: revisar documentación oficial vigente, condiciones de uso comercial, país, cuota, atribución, permisos de reproducción y restricciones de almacenamiento. Si no se puede verificar, marcar como pendiente de validación, construir interfaz y lógica de fallback y explicar al usuario qué falta. Nunca prometer streaming conjunto universal ni evadir DRM.
11. Experiencia y calidad
- Búsqueda global con resultados por categoría, filtros y estados vacíos útiles.
- Recomendaciones basadas inicialmente en intereses, favoritos y popularidad real; evitar inventar un motor de IA avanzado. Explicar por qué se recomienda algo.
- Preferencias de idioma, tema y accesibilidad.
- Horarios localizados por zona horaria del usuario.
- Diseño inclusivo, mensajes de error comprensibles, botones operativos, feedback al guardar, formularios validados.
- Imágenes con alt, lazy loading, optimización, placeholders y atribución cuando aplique.
- Rendimiento razonable en teléfonos de gama media.
- No usar datos reales de usuarios como contenido de demostración sin consentimiento.
- Si una función aún no existe, ocultarla o mostrar claramente «Próximamente»; nunca hacer que parezca activa.
12. Plan de implementación por fases
Fase 0 — Auditoría: inspeccionar repositorio, tecnologías, archivos, imagen assets/juntopia, componentes existentes, Supabase y configuración. Presentar hallazgos y riesgos sin borrar trabajo.

Fase 1 — Identidad y entrada: tokens Bosque, temas claro/oscuro/sistema, landing, login, registro, recuperación de cuenta, rutas protegidas, seis avatares y onboarding.

Fase 2 — Interior visual: dashboard inspirado fielmente en la imagen, sidebar, búsqueda, categorías, recomendaciones, agenda, perfil, estados responsive; conectar a datos reales o seed claramente de demostración.

Fase 3 — Núcleo de contenido: esquema y RLS, fichas, búsqueda, categorías, bibliotecas, colecciones, estados, calificaciones, reseñas, etiquetas emocionales.

Fase 4 — Integraciones de catálogo: proveedores viables (por ejemplo MusicBrainz, Google Books/Open Library, IGDB), normalización, errores, fuentes y permisos; audiovisuales solo tras validar licencia.

Fase 5 — Comunidad: perfiles, amistades, privacidad, chat, notificaciones, bloqueos, reportes y moderación.

Fase 6 — Parties: creación, RSVP, agenda, chat en tiempo real, presencia, recordatorios, enlaces oficiales y modalidades autorizadas.

Fase 7 — Creadores y extras: Tinta Viva, Galería Viva, clubs, propuestas de contenido, playlists, recomendaciones mejoradas y herramientas de colaboración.

Fase 8 — Lanzamiento: pruebas, rendimiento, accesibilidad, seguridad, revisión legal de APIs y contenido, despliegue, documentación y monitoreo. Monetización solo cuando esté correctamente autorizada.

Cada fase debe producir algo usable, probado y verificable, no solamente pantallas.
13. Forma de trabajar de la IA desarrolladora
1. Leer este archivo completo y la imagen assets/juntopia antes de tocar código.
2. Auditar el proyecto y explicar qué ya existe, qué falta y qué puede reutilizarse.
3. Proponer arquitectura, diseño de datos y plan incremental. Pedir credenciales solo cuando sean imprescindibles, explicando dónde configurarlas; jamás solicitar claves secretas para pegarlas en el código frontend o en el chat público.
4. Empezar por la fase más pequeña que entregue valor; preservar archivos, datos y decisiones anteriores.
5. Implementar componentes reales y reutilizables, navegación funcional, backend y estados de carga/error/vacío.
6. No utilizar imágenes generadas arbitrariamente para sustituir la referencia de diseño; no copiar contenido protegido sin permiso.
7. Probar compilación, lint, tipos y flujos críticos según herramientas del repositorio. No afirmar que se ejecutaron pruebas si no se ejecutaron.
8. Al finalizar cada etapa, entregar: archivos cambiados, funciones operativas, pasos para probar, variables de entorno, migraciones necesarias, limitaciones, permisos pendientes y siguiente fase.
9. Si algo es técnicamente o legalmente inviable, explicarlo y ofrecer una alternativa funcional en vez de simularlo.
10. Priorizar que Juntopia se sienta como una comunidad real para hacer cosas juntos, con la estética Bosque de la imagen como identidad visual permanente.
Instrucción de arranque lista para la IA
Leé contexto.md completo y buscá en assets la imagen llamada juntopia (confirmá su ruta y extensión). Inspeccioná la imagen: es la referencia visual principal y obligatoria para el estilo Bosque de la aplicación. Revisá el proyecto existente antes de modificarlo. Quiero una plataforma React + TypeScript + Supabase completa, con landing pública, registro, seis avatares personalizables y dashboard privado que reproduzca la estética de la imagen mediante componentes funcionales y responsive. Todas las categorías deben conectarse con perfiles, colecciones, reseñas, amistades y Parties. Priorizá integraciones legales y alternativas gratuitas sin inventar reproducción ni permisos. Primero mostrame la auditoría, arquitectura, modelo de datos y plan de fases; luego implementá la fase 1, verificando cada resultado. Conservá lo ya desarrollado y avisame de cualquier credencial, licencia o limitación antes de depender de ella.




algo importante es que todo el backend funcione porque este proyecto le van a poner mucho enfasis a eso, sin embargo es full stack y tiene que tener su parte de frontend todo tiene que estar bien modulado y divido y donde dve ir cada cosa, las cosas pligrosas o contrasen los archivos necesarios y demas, y siempre haz commits automatico en github despues de cada cambio explicando cortamente que hiciste, obviamente tiene que ser estetico tambien pero es fullstack sin  embargo todo la parte de backend tiene que estar seguro de que hace y que todo funcione.

