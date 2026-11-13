import { createHash } from "node:crypto";
export const categoryNames = [
  "Música",
  "Cine y series",
  "Libros",
  "Videojuegos",
  "Anime y manga",
  "Arte",
  "Podcasts",
  "Documentales",
];
const text = (value, max = 180) =>
  String(value || "")
    .replace(/<[^>]*>/g, "")
    .trim()
    .slice(0, max);
const https = (value) => {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password
      ? url.href
      : null;
  } catch {
    return null;
  }
};
function normalize(item) {
  const official_url = https(item.official_url);
  if (!official_url || !text(item.title)) return null;
  return {
    ...item,
    title: text(item.title),
    author: text(item.author),
    description: text(item.description, 1500),
    official_url,
    image_url: https(item.image_url),
    external_id: createHash("sha256")
      .update(item.category + official_url)
      .digest("hex")
      .slice(0, 32),
  };
}
export function createProviderSearch(fetcher = fetch) {
  const cache = new Map();
  async function json(address, params) {
    const url = new URL(address);
    for (const [key, value] of Object.entries(params))
      url.searchParams.set(key, value);
    const response = await fetcher(url, {
      headers: {
        "User-Agent": "Juntopia/1.0 (catalog discovery)",
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(6500),
    });
    if (!response.ok) throw new Error("PROVIDER_UNAVAILABLE");
    return response.json();
  }
  async function provider(category, q) {
    async function encyclopedia(suffix) {
      const body = await json(
        "https://en.wikipedia.org/w/rest.php/v1/search/page",
        { q: `${q} ${suffix}`, limit: 12 },
      );
      return (body.pages || [])
        .filter(
          (i) =>
            !i.description ||
            (category === "Documentales"
              ? /documentary|documental|docuseries/i.test(i.description) ||
                i.title.replace(/ \(.*\)$/, "").toLowerCase() ===
                  q.toLowerCase()
              : category === "Cine y series"
                ? /film|series|television|movie/i.test(i.description)
                : true),
        )
        .map((i) => ({
          category,
          title: i.title.replace(
            / \((film|painting|TV series|manga|anime)\)$/,
            "",
          ),
          author: "Ficha enciclopédica",
          description:
            i.description ||
            "Consultá la ficha y sus referencias para conocer más.",
          official_url: `https://en.wikipedia.org/wiki/${encodeURIComponent(i.key)}`,
          image_url: i.thumbnail?.url?.startsWith("//")
            ? `https:${i.thumbnail.url}`
            : i.thumbnail?.url,
          source: "Wikipedia · CC BY-SA",
        }));
    }
    if (
      ["Música", "Podcasts", "Cine y series", "Documentales"].includes(category)
    ) {
      const media =
        category === "Música"
          ? "music"
          : category === "Podcasts"
            ? "podcast"
            : "movie";
      const body = await json("https://itunes.apple.com/search", {
        term: q,
        media,
        limit: 18,
        country: "US",
        explicit: "No",
      });
      let items = body.results || [];
      if (category === "Documentales")
        items = items.filter((i) => /document/i.test(i.primaryGenreName || ""));
      const normalized = items.map((i) => ({
        category,
        title: i.trackName || i.collectionName,
        author: i.artistName,
        description:
          i.shortDescription ||
          i.longDescription ||
          `Disponible en Apple. Consultá el proveedor para conocer su disponibilidad.`,
        official_url: i.trackViewUrl || i.collectionViewUrl,
        source: "Apple · iTunes Search",
      }));
      if (category === "Documentales")
        return normalized.length ? normalized : encyclopedia("documentary");
      if (category !== "Cine y series") return normalized;
      const shows = await json("https://api.tvmaze.com/search/shows", {
        q,
      }).catch(() => []);
      const cinema = normalized.length
        ? normalized
        : await encyclopedia("film").catch(() => []);
      return [
        ...cinema,
        ...shows.slice(0, 10).map(({ show: s }) => ({
          category,
          title: s.name,
          author: s.network?.name || s.webChannel?.name,
          description: s.summary,
          official_url: s.url,
          image_url: s.image?.medium,
          source: "TVmaze · CC BY-SA",
        })),
      ];
    }
    if (category === "Libros") {
      const body = await json("https://openlibrary.org/search.json", {
        q,
        limit: 16,
        fields: "key,title,author_name,cover_i,first_publish_year",
        lang: "es",
      });
      return (body.docs || []).map((i) => ({
        category,
        title: i.title,
        author: i.author_name?.join(", "),
        description: i.first_publish_year
          ? `Primera publicación: ${i.first_publish_year}. Datos de Open Library.`
          : "Ficha bibliográfica de Open Library.",
        official_url: `https://openlibrary.org${i.key}`,
        image_url: i.cover_i
          ? `https://covers.openlibrary.org/b/id/${i.cover_i}-M.jpg`
          : null,
        source: "Open Library",
      }));
    }
    if (category === "Anime y manga") {
      const body = await json("https://api.jikan.moe/v4/anime", {
        q,
        limit: 16,
        sfw: true,
      }).catch(() => null);
      if (!body) {
        const kitsu = await json("https://kitsu.io/api/edge/anime", {
          "filter[text]": q,
          "page[limit]": 16,
        }).catch(() => null);
        if (!kitsu) return encyclopedia("anime manga");
        return (kitsu.data || [])
          .filter((i) => i.attributes?.ageRating !== "R18")
          .map((i) => ({
            category,
            title: i.attributes.canonicalTitle,
            author: "Kitsu",
            description: i.attributes.synopsis,
            official_url: `https://kitsu.io/anime/${i.attributes.slug}`,
            image_url: i.attributes.posterImage?.medium,
            source: "Kitsu",
          }));
      }
      return (body.data || []).map((i) => ({
        category,
        title: i.title_english || i.title,
        author: i.studios?.map((s) => s.name).join(", "),
        description: i.synopsis,
        official_url: i.url,
        image_url: i.images?.jpg?.image_url,
        source: "MyAnimeList · Jikan",
      }));
    }
    if (category === "Arte") {
      const body = await json("https://api.artic.edu/api/v1/artworks/search", {
        q,
        limit: 16,
        fields: "id,title,artist_title,date_display,image_id,is_public_domain",
      }).catch(() => null);
      if (!body) return encyclopedia("painting artwork");
      return (body.data || []).map((i) => ({
        category,
        title: i.title,
        author: i.artist_title,
        description: i.date_display,
        official_url: `https://www.artic.edu/artworks/${i.id}`,
        image_url:
          i.is_public_domain && i.image_id
            ? `https://www.artic.edu/iiif/2/${i.image_id}/full/400,/0/default.jpg`
            : null,
        source: "Art Institute of Chicago",
      }));
    }
    const body = await json("https://www.cheapshark.com/api/1.0/games", {
      title: q,
      limit: 16,
    });
    return body
      .filter((i) => /^\d+$/.test(i.steamAppID || ""))
      .map((i) => ({
        category,
        title: i.external,
        author: "Steam",
        description: "Consultá la ficha del juego en Steam.",
        official_url: `https://store.steampowered.com/app/${i.steamAppID}/`,
        image_url: i.thumb,
        source: "CheapShark · Steam",
      }));
  }
  return async function search(q, category = "") {
    const key = `${category}:${q.toLocaleLowerCase("es")}`;
    const existing = cache.get(key);
    if (existing && existing.until > Date.now()) return existing.promise;
    const promise = (async () => {
      const selected = category ? [category] : categoryNames;
      const results = await Promise.allSettled(
        selected.map((c) => provider(c, q)),
      );
      const items = [],
        unavailable = [];
      results.forEach((result, index) => {
        if (result.status === "rejected") {
          unavailable.push(selected[index]);
          return;
        }
        items.push(...result.value.map(normalize).filter(Boolean));
      });
      return {
        items: [
          ...new Map(items.map((i) => [i.external_id, i])).values(),
        ].slice(0, 80),
        unavailable,
      };
    })();
    cache.set(key, { until: Date.now() + 15 * 60000, promise });
    if (cache.size > 300) cache.delete(cache.keys().next().value);
    return promise;
  };
}
