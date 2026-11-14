// Original, short descriptions and links to the publisher, creator or collection.
// This baseline stays available even when an external search provider is offline.
const groups = {
  Música: [
    [
      "Gasolina",
      "Daddy Yankee",
      "https://www.youtube.com/watch?v=CCF1_jI8Prk",
      "Un clásico del reguetón para descubrir o volver a escuchar.",
    ],
    [
      "Un Verano Sin Ti",
      "Bad Bunny",
      "https://www.unveranosinti.com/",
      "Un álbum que recorre sonidos caribeños y distintas formas de vivir el verano.",
    ],
    [
      "El Mal Querer",
      "ROSALÍA",
      "https://www.rosalia.com/",
      "Pop, flamenco y una historia contada por capítulos.",
    ],
    [
      "Random Access Memories",
      "Daft Punk",
      "https://www.daftpunk.com/",
      "Electrónica, disco e instrumentos en vivo.",
    ],
    [
      "Abbey Road",
      "The Beatles",
      "https://www.thebeatles.com/abbey-road",
      "Una puerta de entrada al universo de los Beatles.",
    ],
    [
      "Hasta la Raíz",
      "Natalia Lafourcade",
      "https://www.lafourcade.com.mx/",
      "Canciones sobre los vínculos, la memoria y las raíces.",
    ],
  ],
  "Cine y series": [
    [
      "Interstellar",
      "Christopher Nolan",
      "https://www.paramountmovies.com/movies/interstellar",
      "Una expedición espacial sobre el tiempo y los lazos familiares.",
    ],
    [
      "Coco",
      "Pixar",
      "https://www.pixar.com/coco",
      "Música, familia y recuerdos en una aventura animada.",
    ],
    [
      "Soul",
      "Pixar",
      "https://www.pixar.com/soul",
      "Una historia sobre la música y las pequeñas experiencias de cada día.",
    ],
    [
      "Breaking Bad",
      "Vince Gilligan",
      "https://www.amc.com/shows/breaking-bad",
      "Un profesor toma decisiones que transforman su vida y su familia.",
    ],
    [
      "Stranger Things",
      "The Duffer Brothers",
      "https://www.netflix.com/title/80057281",
      "Amistad y misterios sobrenaturales en un pequeño pueblo.",
    ],
    [
      "The Lord of the Rings",
      "Peter Jackson",
      "https://www.lordoftherings.net/",
      "Una aventura de fantasía sobre la amistad y una misión imposible.",
    ],
  ],
  Libros: [
    [
      "Cien años de soledad",
      "Gabriel García Márquez",
      "https://www.penguinlibros.com/es/tematicas/227236-libro-cien-anos-de-soledad-9788439732471",
      "La historia de una familia a lo largo de generaciones en Macondo.",
    ],
    [
      "El principito",
      "Antoine de Saint-Exupéry",
      "https://www.lepetitprince.com/",
      "Un viaje breve que invita a mirar de nuevo lo cotidiano.",
    ],
    [
      "Don Quijote de la Mancha",
      "Miguel de Cervantes",
      "https://www.cervantesvirtual.com/portales/miguel_de_cervantes/",
      "Un caballero y su compañero recorren caminos entre ideales y realidad.",
    ],
    [
      "Pride and Prejudice",
      "Jane Austen",
      "https://www.gutenberg.org/ebooks/1342",
      "Una novela sobre primeras impresiones, familia y decisiones propias.",
    ],
    [
      "Frankenstein",
      "Mary Shelley",
      "https://www.gutenberg.org/ebooks/84",
      "Una historia sobre la creación, la responsabilidad y la soledad.",
    ],
    [
      "The Hobbit",
      "J. R. R. Tolkien",
      "https://www.tolkienestate.com/writing/the-hobbit/",
      "Un viaje inesperado fuera de la comodidad del hogar.",
    ],
  ],
  Videojuegos: [
    [
      "Minecraft",
      "Mojang Studios",
      "https://www.minecraft.net/",
      "Explorá, construí y creá tus propias aventuras.",
    ],
    [
      "Stardew Valley",
      "ConcernedApe",
      "https://www.stardewvalley.net/",
      "Una granja, una comunidad y un ritmo que podés hacer tuyo.",
    ],
    [
      "Hollow Knight",
      "Team Cherry",
      "https://www.hollowknight.com/",
      "Exploración y desafíos en un reino subterráneo dibujado a mano.",
    ],
    [
      "Celeste",
      "Maddy Makes Games",
      "https://www.celestegame.com/",
      "Plataformas y una montaña que es más que un desafío físico.",
    ],
    [
      "Hades",
      "Supergiant Games",
      "https://www.supergiantgames.com/games/hades/",
      "Acción y mitología con una historia que avanza en cada intento.",
    ],
    [
      "The Legend of Zelda: Tears of the Kingdom",
      "Nintendo",
      "https://www.zelda.com/tears-of-the-kingdom/",
      "Explorá Hyrule y resolvé desafíos con creatividad.",
    ],
  ],
  "Anime y manga": [
    [
      "ONE PIECE",
      "Eiichiro Oda",
      "https://one-piece.com/",
      "Una tripulación persigue aventuras y un sueño compartido.",
    ],
    [
      "NARUTO",
      "Masashi Kishimoto",
      "https://naruto-official.com/",
      "Un joven ninja busca su camino y el reconocimiento de su comunidad.",
    ],
    [
      "SPY×FAMILY",
      "Tatsuya Endo",
      "https://spy-family.net/",
      "Una familia poco convencional reúne secretos, acción y comedia.",
    ],
    [
      "Frieren: Beyond Journey's End",
      "Kanehito Yamada y Tsukasa Abe",
      "https://frieren-anime.jp/",
      "Un viaje de fantasía sobre el tiempo y lo que dejamos en otras personas.",
    ],
    [
      "Demon Slayer",
      "Koyoharu Gotouge",
      "https://demonslayer-anime.com/",
      "Una aventura sobre la familia y la determinación ante lo imposible.",
    ],
    [
      "My Neighbor Totoro",
      "Studio Ghibli",
      "https://www.ghibli.jp/works/totoro/",
      "Dos hermanas descubren un mundo de asombro cerca de su nuevo hogar.",
    ],
  ],
  Arte: [
    [
      "The Starry Night",
      "Vincent van Gogh",
      "https://www.moma.org/collection/works/79802",
      "Una mirada al movimiento, el color y el cielo nocturno.",
    ],
    [
      "Nighthawks",
      "Edward Hopper",
      "https://www.artic.edu/artworks/111628/nighthawks",
      "Una escena urbana que invita a imaginar historias.",
    ],
    [
      "A Sunday on La Grande Jatte",
      "Georges Seurat",
      "https://www.artic.edu/artworks/27992/a-sunday-on-la-grande-jatte-1884",
      "Color y puntos construyen una escena junto al río.",
    ],
    [
      "The Great Wave",
      "Katsushika Hokusai",
      "https://www.metmuseum.org/art/collection/search/45434",
      "Un encuentro entre la fuerza del mar y la escala humana.",
    ],
    [
      "Girl with a Pearl Earring",
      "Johannes Vermeer",
      "https://www.mauritshuis.nl/en/our-collection/artworks/670-girl-with-a-pearl-earring/",
      "Luz y una mirada que siguen invitando a la conversación.",
    ],
    [
      "The Persistence of Memory",
      "Salvador Dalí",
      "https://www.moma.org/collection/works/79018",
      "Una imagen surrealista para pensar cómo experimentamos el tiempo.",
    ],
  ],
  Podcasts: [
    [
      "Radio Ambulante",
      "Radio Ambulante Studios",
      "https://radioambulante.org/",
      "Historias de América Latina contadas con tiempo y escucha.",
    ],
    [
      "El hilo",
      "Radio Ambulante Studios",
      "https://elhilo.audio/",
      "Periodismo para entender las noticias de América Latina.",
    ],
    [
      "TED en Español",
      "TED",
      "https://www.ted.com/podcasts/ted-en-espanol",
      "Ideas y conversaciones que abren preguntas nuevas.",
    ],
    [
      "Entiende Tu Mente",
      "Entiende Tu Mente",
      "https://entiendetumente.info/",
      "Conversaciones para reflexionar sobre emociones y hábitos.",
    ],
    [
      "99% Invisible",
      "Roman Mars",
      "https://99percentinvisible.org/",
      "Historias sobre el diseño que suele pasar desapercibido.",
    ],
    [
      "Science Vs",
      "Gimlet",
      "https://gimletmedia.com/shows/science-vs",
      "Preguntas cotidianas exploradas desde la evidencia científica.",
    ],
  ],
  Documentales: [
    [
      "Our Planet",
      "Silverback Films",
      "https://www.ourplanet.com/",
      "Un recorrido por la diversidad de la vida en la Tierra.",
    ],
    [
      "Free Solo",
      "Jimmy Chin y Elizabeth Chai Vasarhelyi",
      "https://films.nationalgeographic.com/free-solo",
      "Preparación y riesgo en una escalada extraordinaria.",
    ],
    [
      "My Octopus Teacher",
      "Pippa Ehrlich y James Reed",
      "https://www.netflix.com/title/81045007",
      "Un encuentro bajo el agua que cambia una forma de mirar la naturaleza.",
    ],
    [
      "13th",
      "Ava DuVernay",
      "https://www.netflix.com/title/80091741",
      "Una exploración de la historia del encarcelamiento en Estados Unidos.",
    ],
    [
      "The Social Dilemma",
      "Jeff Orlowski",
      "https://www.thesocialdilemma.com/",
      "Preguntas sobre tecnología, atención y vida en redes.",
    ],
    [
      "Cosmos: A Spacetime Odyssey",
      "Ann Druyan",
      "https://www.nationalgeographic.com/tv/shows/cosmos",
      "Un viaje por la ciencia y nuestra forma de entender el universo.",
    ],
  ],
};
export const initialCatalog = Object.entries(groups).flatMap(
  ([category, items]) =>
    items.map(([title, author, official_url, description]) => ({
      category,
      title,
      author,
      official_url,
      description,
      source: "Juntopia · selección inicial",
    })),
);
