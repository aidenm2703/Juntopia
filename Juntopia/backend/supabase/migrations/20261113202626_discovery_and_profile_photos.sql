-- Additive change: preserve every account, library entry and existing avatar.
alter table public.content_items alter column created_by drop not null;
alter table public.content_items add column image_url text
  check(image_url is null or (image_url ~ '^https://[^[:space:]]+$' and char_length(image_url)<=2000));

-- Existing owner-only insert/delete policies keep system seed rows immutable
-- to members. System entries have no account owner and stay readable via RLS.
alter table public.profiles add constraint profiles_photo_own check (
  not (avatar_options ? 'photo') or
  avatar_options->>'photo' ~ ('^' || id::text || '/[0-9a-f-]{36}\.(jpg|png|webp)$')
);
alter table public.member_cards add constraint cards_photo_own check (
  not (avatar_options ? 'photo') or
  avatar_options->>'photo' ~ ('^' || id::text || '/[0-9a-f-]{36}\.(jpg|png|webp)$')
);
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('profile-photos','profile-photos',false,2097152,array['image/jpeg','image/png','image/webp'])
on conflict(id) do nothing;
create policy profile_photos_upload on storage.objects for insert to authenticated
with check(bucket_id='profile-photos' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy profile_photos_delete on storage.objects for delete to authenticated
using(bucket_id='profile-photos' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy profile_photos_read on storage.objects for select to authenticated
using(bucket_id='profile-photos' and (
  (storage.foldername(name))[1]=(select auth.uid())::text or
  exists(select 1 from public.member_cards c where c.avatar_options->>'photo'=name)
));


-- Only this seed statement bypasses the per-member write throttle. RLS and
-- every other trigger remain in place; the migration is transactional.
alter table public.content_items disable trigger throttle_write;
insert into public.content_items(category,title,author,description,official_url,source,created_by) values
('Música','Gasolina','Daddy Yankee','Un clásico del reguetón para descubrir o volver a escuchar.','https://www.youtube.com/watch?v=CCF1_jI8Prk','Juntopia · selección inicial',null),
('Música','Un Verano Sin Ti','Bad Bunny','Un álbum que recorre sonidos caribeños y distintas formas de vivir el verano.','https://www.unveranosinti.com/','Juntopia · selección inicial',null),
('Música','El Mal Querer','ROSALÍA','Pop, flamenco y una historia contada por capítulos.','https://www.rosalia.com/','Juntopia · selección inicial',null),
('Música','Random Access Memories','Daft Punk','Electrónica, disco e instrumentos en vivo.','https://www.daftpunk.com/','Juntopia · selección inicial',null),
('Música','Abbey Road','The Beatles','Una puerta de entrada al universo de los Beatles.','https://www.thebeatles.com/abbey-road','Juntopia · selección inicial',null),
('Música','Hasta la Raíz','Natalia Lafourcade','Canciones sobre los vínculos, la memoria y las raíces.','https://www.lafourcade.com.mx/','Juntopia · selección inicial',null),
('Cine y series','Interstellar','Christopher Nolan','Una expedición espacial sobre el tiempo y los lazos familiares.','https://www.paramountmovies.com/movies/interstellar','Juntopia · selección inicial',null),
('Cine y series','Coco','Pixar','Música, familia y recuerdos en una aventura animada.','https://www.pixar.com/coco','Juntopia · selección inicial',null),
('Cine y series','Soul','Pixar','Una historia sobre la música y las pequeñas experiencias de cada día.','https://www.pixar.com/soul','Juntopia · selección inicial',null),
('Cine y series','Breaking Bad','Vince Gilligan','Un profesor toma decisiones que transforman su vida y su familia.','https://www.amc.com/shows/breaking-bad','Juntopia · selección inicial',null),
('Cine y series','Stranger Things','The Duffer Brothers','Amistad y misterios sobrenaturales en un pequeño pueblo.','https://www.netflix.com/title/80057281','Juntopia · selección inicial',null),
('Cine y series','The Lord of the Rings','Peter Jackson','Una aventura de fantasía sobre la amistad y una misión imposible.','https://www.lordoftherings.net/','Juntopia · selección inicial',null),
('Libros','Cien años de soledad','Gabriel García Márquez','La historia de una familia a lo largo de generaciones en Macondo.','https://www.penguinlibros.com/es/tematicas/227236-libro-cien-anos-de-soledad-9788439732471','Juntopia · selección inicial',null),
('Libros','El principito','Antoine de Saint-Exupéry','Un viaje breve que invita a mirar de nuevo lo cotidiano.','https://www.lepetitprince.com/','Juntopia · selección inicial',null),
('Libros','Don Quijote de la Mancha','Miguel de Cervantes','Un caballero y su compañero recorren caminos entre ideales y realidad.','https://www.cervantesvirtual.com/portales/miguel_de_cervantes/','Juntopia · selección inicial',null),
('Libros','Pride and Prejudice','Jane Austen','Una novela sobre primeras impresiones, familia y decisiones propias.','https://www.gutenberg.org/ebooks/1342','Juntopia · selección inicial',null),
('Libros','Frankenstein','Mary Shelley','Una historia sobre la creación, la responsabilidad y la soledad.','https://www.gutenberg.org/ebooks/84','Juntopia · selección inicial',null),
('Libros','The Hobbit','J. R. R. Tolkien','Un viaje inesperado fuera de la comodidad del hogar.','https://www.tolkienestate.com/writing/the-hobbit/','Juntopia · selección inicial',null),
('Videojuegos','Minecraft','Mojang Studios','Explorá, construí y creá tus propias aventuras.','https://www.minecraft.net/','Juntopia · selección inicial',null),
('Videojuegos','Stardew Valley','ConcernedApe','Una granja, una comunidad y un ritmo que podés hacer tuyo.','https://www.stardewvalley.net/','Juntopia · selección inicial',null),
('Videojuegos','Hollow Knight','Team Cherry','Exploración y desafíos en un reino subterráneo dibujado a mano.','https://www.hollowknight.com/','Juntopia · selección inicial',null),
('Videojuegos','Celeste','Maddy Makes Games','Plataformas y una montaña que es más que un desafío físico.','https://www.celestegame.com/','Juntopia · selección inicial',null),
('Videojuegos','Hades','Supergiant Games','Acción y mitología con una historia que avanza en cada intento.','https://www.supergiantgames.com/games/hades/','Juntopia · selección inicial',null),
('Videojuegos','The Legend of Zelda: Tears of the Kingdom','Nintendo','Explorá Hyrule y resolvé desafíos con creatividad.','https://www.zelda.com/tears-of-the-kingdom/','Juntopia · selección inicial',null),
('Anime y manga','ONE PIECE','Eiichiro Oda','Una tripulación persigue aventuras y un sueño compartido.','https://one-piece.com/','Juntopia · selección inicial',null),
('Anime y manga','NARUTO','Masashi Kishimoto','Un joven ninja busca su camino y el reconocimiento de su comunidad.','https://naruto-official.com/','Juntopia · selección inicial',null),
('Anime y manga','SPY×FAMILY','Tatsuya Endo','Una familia poco convencional reúne secretos, acción y comedia.','https://spy-family.net/','Juntopia · selección inicial',null),
('Anime y manga','Frieren: Beyond Journey''s End','Kanehito Yamada y Tsukasa Abe','Un viaje de fantasía sobre el tiempo y lo que dejamos en otras personas.','https://frieren-anime.jp/','Juntopia · selección inicial',null),
('Anime y manga','Demon Slayer','Koyoharu Gotouge','Una aventura sobre la familia y la determinación ante lo imposible.','https://demonslayer-anime.com/','Juntopia · selección inicial',null),
('Anime y manga','My Neighbor Totoro','Studio Ghibli','Dos hermanas descubren un mundo de asombro cerca de su nuevo hogar.','https://www.ghibli.jp/works/totoro/','Juntopia · selección inicial',null),
('Arte','The Starry Night','Vincent van Gogh','Una mirada al movimiento, el color y el cielo nocturno.','https://www.moma.org/collection/works/79802','Juntopia · selección inicial',null),
('Arte','Nighthawks','Edward Hopper','Una escena urbana que invita a imaginar historias.','https://www.artic.edu/artworks/111628/nighthawks','Juntopia · selección inicial',null),
('Arte','A Sunday on La Grande Jatte','Georges Seurat','Color y puntos construyen una escena junto al río.','https://www.artic.edu/artworks/27992/a-sunday-on-la-grande-jatte-1884','Juntopia · selección inicial',null),
('Arte','The Great Wave','Katsushika Hokusai','Un encuentro entre la fuerza del mar y la escala humana.','https://www.metmuseum.org/art/collection/search/45434','Juntopia · selección inicial',null),
('Arte','Girl with a Pearl Earring','Johannes Vermeer','Luz y una mirada que siguen invitando a la conversación.','https://www.mauritshuis.nl/en/our-collection/artworks/670-girl-with-a-pearl-earring/','Juntopia · selección inicial',null),
('Arte','The Persistence of Memory','Salvador Dalí','Una imagen surrealista para pensar cómo experimentamos el tiempo.','https://www.moma.org/collection/works/79018','Juntopia · selección inicial',null),
('Podcasts','Radio Ambulante','Radio Ambulante Studios','Historias de América Latina contadas con tiempo y escucha.','https://radioambulante.org/','Juntopia · selección inicial',null),
('Podcasts','El hilo','Radio Ambulante Studios','Periodismo para entender las noticias de América Latina.','https://elhilo.audio/','Juntopia · selección inicial',null),
('Podcasts','TED en Español','TED','Ideas y conversaciones que abren preguntas nuevas.','https://www.ted.com/podcasts/ted-en-espanol','Juntopia · selección inicial',null),
('Podcasts','Entiende Tu Mente','Entiende Tu Mente','Conversaciones para reflexionar sobre emociones y hábitos.','https://entiendetumente.info/','Juntopia · selección inicial',null),
('Podcasts','99% Invisible','Roman Mars','Historias sobre el diseño que suele pasar desapercibido.','https://99percentinvisible.org/','Juntopia · selección inicial',null),
('Podcasts','Science Vs','Gimlet','Preguntas cotidianas exploradas desde la evidencia científica.','https://gimletmedia.com/shows/science-vs','Juntopia · selección inicial',null),
('Documentales','Our Planet','Silverback Films','Un recorrido por la diversidad de la vida en la Tierra.','https://www.ourplanet.com/','Juntopia · selección inicial',null),
('Documentales','Free Solo','Jimmy Chin y Elizabeth Chai Vasarhelyi','Preparación y riesgo en una escalada extraordinaria.','https://films.nationalgeographic.com/free-solo','Juntopia · selección inicial',null),
('Documentales','My Octopus Teacher','Pippa Ehrlich y James Reed','Un encuentro bajo el agua que cambia una forma de mirar la naturaleza.','https://www.netflix.com/title/81045007','Juntopia · selección inicial',null),
('Documentales','13th','Ava DuVernay','Una exploración de la historia del encarcelamiento en Estados Unidos.','https://www.netflix.com/title/80091741','Juntopia · selección inicial',null),
('Documentales','The Social Dilemma','Jeff Orlowski','Preguntas sobre tecnología, atención y vida en redes.','https://www.thesocialdilemma.com/','Juntopia · selección inicial',null),
('Documentales','Cosmos: A Spacetime Odyssey','Ann Druyan','Un viaje por la ciencia y nuestra forma de entender el universo.','https://www.nationalgeographic.com/tv/shows/cosmos','Juntopia · selección inicial',null)
on conflict(category,official_url) do nothing;
alter table public.content_items enable trigger throttle_write;
