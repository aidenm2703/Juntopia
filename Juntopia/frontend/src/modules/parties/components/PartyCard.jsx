import {
  categories,
  formatDate,
  partyStates,
  rsvpLabels,
} from "../../../shared/domain/index.js";
export function PartyCard({ party, rsvp }) {
  const category = categories.find((c) => c.name === party.category);
  return (
    <a
      href={`#/parties/${party.id}`}
      className="party-card panel"
      style={{ "--accent": category?.color }}
    >
      <div className="party-card-art" aria-hidden="true">
        {category?.icon}
      </div>
      <div className="party-card-body">
        <div className="tag-list">
          <span>{partyStates[party.status]}</span>
          <span>{party.category}</span>
        </div>
        <h2>{party.title}</h2>
        <p>{formatDate(party.starts_at)}</p>
        <small>
          {party.duration_minutes} min · {party.capacity} lugares ·{" "}
          {party.privacy === "public"
            ? "Pública"
            : party.privacy === "friends"
              ? "Amigos"
              : "Por invitación"}
        </small>
        {rsvp && <p className="badge">{rsvpLabels[rsvp]}</p>}
        <strong>Ver el plan →</strong>
      </div>
    </a>
  );
}
