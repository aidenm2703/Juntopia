import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import { Avatar } from "../src/shared/components/Avatar.jsx";
import { Auth } from "../src/modules/auth/pages/Auth.jsx";
import { Landing } from "../src/modules/home/pages/Landing.jsx";
import { OfficialLink } from "../src/modules/catalog/components/ContentCard.jsx";
import { ContentCard } from "../src/modules/catalog/components/ContentCard.jsx";
import { AvatarEditor } from "../src/shared/components/AvatarEditor.jsx";
import { CulturalChat } from "../src/modules/catalog/components/CulturalChat.jsx";
const avatars = Array.from({ length: 6 }, (_, base) =>
  renderToStaticMarkup(<Avatar base={base} />),
);
assert.equal(new Set(avatars).size, 6, "The six avatar bases must be distinct");
const customized = Array.from({ length: 6 }, (_, base) =>
  renderToStaticMarkup(
    <Avatar
      base={base}
      options={{ hair: "#805027", outfit: "#51358a", accessory: "glasses" }}
    />,
  ),
);
assert.equal(
  new Set(customized.map((html) => html.replace(/aria-label="[^"]*"/g, "")))
    .size,
  6,
  "Characters stay distinct even with identical user colors and accessories",
);
const editor = renderToStaticMarkup(
  <AvatarEditor
    profile={{ avatar_base: 0, avatar_color: "#a5c86a" }}
    change={() => {}}
  />,
);
assert.match(
  editor,
  /type="file"[^>]*accept="image\/jpeg,image\/png,image\/webp"/,
);
assert.match(editor, /Subir mi foto/);
assert.match(renderToStaticMarkup(<CulturalChat />), /Preguntale a Gemini/);
const card = renderToStaticMarkup(
  <ContentCard
    item={{
      title: "Obra real",
      category: "Libros",
      author: "Autor",
      image_url: "javascript:alert(1)",
    }}
    onOpen={() => {}}
  />,
);
assert.doesNotMatch(card, /javascript:/);
assert.match(card, /Guardar y calificar/);
const registration = renderToStaticMarkup(
  <Auth mode="register" close={() => {}} />,
);
assert.match(
  registration,
  /type="checkbox"[^>]*required/,
  "Registration requires explicit policy acceptance",
);
assert.match(
  registration,
  /minLength="8"/,
  "Registration enforces a password length",
);
assert.doesNotMatch(
  registration,
  /Crear cuenta · próximamente/,
  "Registration must be operational",
);
const recovery = renderToStaticMarkup(
  <Auth mode="password" close={() => {}} />,
);
assert.match(
  recovery,
  /name="confirm"/,
  "Password changes require confirmation",
);
assert.match(recovery, /autoComplete="new-password"/);
assert.match(recovery, /minLength="8"/);
assert.match(registration, /pattern=/);
assert.match(registration, /Usar enlace en este computador/);
const landing = renderToStaticMarkup(<Landing navigate={() => {}} />);
assert.match(landing, /<h1>/);
assert.doesNotMatch(
  landing,
  /Mis amigos|Notificaciones|Mi biblioteca/,
  "The public landing cannot show private dashboard modules",
);
assert.equal(
  renderToStaticMarkup(<OfficialLink url="javascript:alert(1)" />),
  "",
  "Unsafe external URLs must not render",
);
const external = renderToStaticMarkup(
  <OfficialLink url="https://example.com" />,
);
assert.match(external, /noopener noreferrer/);
console.log(
  "Render: 19 comprobaciones aprobadas; entrada pública, registro, contraseña, personajes, foto, Gemini y enlaces.",
);
