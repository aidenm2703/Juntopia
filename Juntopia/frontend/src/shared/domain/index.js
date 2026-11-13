export const categories = [
  { name: "Música", icon: "♫", color: "#a78bfa" },
  { name: "Cine y series", icon: "▤", color: "#fb7185" },
  { name: "Libros", icon: "▥", color: "#f5b942" },
  { name: "Videojuegos", icon: "✣", color: "#34d399" },
  { name: "Anime y manga", icon: "✧", color: "#818cf8" },
  { name: "Arte", icon: "◈", color: "#f472b6" },
  { name: "Podcasts", icon: "◉", color: "#60a5fa" },
  { name: "Documentales", icon: "◎", color: "#f59e0b" },
];
export const readingStates = {
  pending: "Pendiente",
  in_progress: "En progreso",
  completed: "Completado",
  abandoned: "Abandonado",
};
export const partyStates = {
  scheduled: "Programada",
  live: "En vivo",
  ended: "Finalizada",
  cancelled: "Cancelada",
};
export const rsvpLabels = {
  going: "Voy",
  maybe: "Tal vez",
  declined: "No voy",
  waitlist: "Lista de espera",
};
export const policyVersion = "2026-11-13-beta";
export function safeUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password
      ? url.href
      : null;
  } catch {
    return null;
  }
}
export function errorMessage(error) {
  if (!navigatorOnline())
    return "Estás sin conexión. Tus cambios no se guardaron; intentá cuando vuelvas a conectarte.";
  if (error?.code === "23505")
    return "Ya existe un registro con esos datos. Revisá tu biblioteca o elegí otro identificador.";
  if (error?.code === "42501")
    return "No tenés permiso para esta acción o el contenido ya no está disponible.";
  if (error?.code === "23514" || error?.code === "22023")
    return "Revisá los campos: hay un valor fuera de los límites permitidos.";
  if (error?.message?.includes("Demasiadas acciones"))
    return "Demasiadas acciones. Esperá un minuto e intentá de nuevo.";
  if (error?.status === 429)
    return "Hay demasiadas solicitudes. Esperá un momento antes de volver a intentar.";
  return "No pudimos completar la acción. Revisá tu conexión y volvé a intentar.";
}
function navigatorOnline() {
  return typeof navigator === "undefined" || navigator.onLine !== false;
}
export function formatDate(value, timezone) {
  try {
    return new Intl.DateTimeFormat("es-CR", {
      dateStyle: "medium",
      timeStyle: "short",
      ...(timezone ? { timeZone: timezone } : {}),
    }).format(new Date(value));
  } catch {
    return "Fecha no disponible";
  }
}
export function calendarEvent(party) {
  const stamp = (date) =>
    new Date(date)
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}Z$/, "Z");
  const escape = (text) =>
    String(text)
      .replace(/\\/g, "\\\\")
      .replace(/\r?\n/g, "\\n")
      .replace(/;/g, "\\;")
      .replace(/,/g, "\\,");
  return (
    [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Juntopia//Planes//ES",
      "BEGIN:VEVENT",
      `UID:${party.id}@juntopia`,
      `DTSTAMP:${stamp(new Date())}`,
      `DTSTART:${stamp(party.starts_at)}`,
      `DTEND:${stamp(new Date(new Date(party.starts_at).getTime() + party.duration_minutes * 60000))}`,
      `SUMMARY:${escape(party.title)}`,
      `DESCRIPTION:${escape(party.description)}`,
      `STATUS:${party.status === "cancelled" ? "CANCELLED" : "CONFIRMED"}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n") + "\r\n"
  );
}
export function downloadCalendar(party) {
  const url = URL.createObjectURL(
    new Blob([calendarEvent(party)], { type: "text/calendar;charset=utf-8" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = "juntopia-plan.ics";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function localDateInput(value) {
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
}
