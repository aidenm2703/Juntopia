import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import { Avatar } from "../src/shared/components/Avatar.jsx";
import { Auth } from "../src/modules/auth/pages/Auth.jsx";
import { Landing } from "../src/modules/home/pages/Landing.jsx";
import { OfficialLink } from "../src/modules/catalog/components/ContentCard.jsx";
const avatars = Array.from({ length: 6 }, (_, base) =>
  renderToStaticMarkup(<Avatar base={base} />),
);
assert.equal(new Set(avatars).size, 6, "The six avatar bases must be distinct");
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
  /minLength="12"/,
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
  "Render: 10 comprobaciones aprobadas; entrada pública, registro, contraseña, avatares y enlaces.",
);
