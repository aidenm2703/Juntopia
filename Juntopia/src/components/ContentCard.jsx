import { categories, safeUrl } from "../lib/domain.js";
export function ContentCard({ item, onOpen }) {
  const category =
    categories.find((c) => c.name === item.category) || categories[0];
  return (
    <button
      className="content-card"
      onClick={() => onOpen(item.id)}
      style={{ "--accent": category.color }}
    >
      <div className="content-cover" aria-hidden="true">
        <span>{category.icon}</span>
        <i>{item.title.slice(0, 1)}</i>
      </div>
      <div className="content-info">
        <small>{item.category}</small>
        <h3>{item.title}</h3>
        <p>{item.author || "Aporte de la comunidad"}</p>
        <span>Ver ficha ↗</span>
      </div>
    </button>
  );
}
export function OfficialLink({ url, children = "Abrir en proveedor ↗" }) {
  const href = safeUrl(url);
  return href ? (
    <a
      className="external-link"
      href={href}
      target="_blank"
      rel="noopener noreferrer nofollow"
    >
      {children}
    </a>
  ) : null;
}
