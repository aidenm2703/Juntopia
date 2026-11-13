export const avatarNames = [
  "Sendero",
  "Brisa",
  "Cedro",
  "Aurora",
  "Musgo",
  "Lumbre",
];
export const interests = [
  "Música",
  "Cine y series",
  "Libros",
  "Videojuegos",
  "Anime y manga",
  "Arte",
  "Podcasts",
  "Documentales",
];
export const emptyProfile = (id) => ({
  id,
  display_name: "",
  username: "",
  bio: "",
  avatar_base: 0,
  avatar_color: "#a5c86a",
  avatar_options: { hair: "#302b27", outfit: "#485b37", accessory: "none" },
  interests: [],
  onboarding_step: 0,
  onboarding_complete: false,
  activity_visible: false,
});
