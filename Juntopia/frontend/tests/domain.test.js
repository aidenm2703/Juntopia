import { test } from "node:test";
import assert from "node:assert/strict";
import {
  safeUrl,
  calendarEvent,
  formatDate,
  errorMessage,
} from "../src/shared/domain/index.js";
test("external links reject executable schemes and embedded credentials", () => {
  for (const value of [
    "javascript:alert(1)",
    "data:text/html,test",
    "http://example.com",
    "https://user:password@example.com",
    "not a url",
  ])
    assert.equal(safeUrl(value), null);
  assert.equal(
    safeUrl("https://example.com/book?q=leer"),
    "https://example.com/book?q=leer",
  );
});
test("calendar exports UTC times, escapes text and preserves cancellation", () => {
  const result = calendarEvent({
    id: "test",
    title: "Libro, cine; charla",
    description: "Línea 1\nLínea 2",
    starts_at: "2026-11-14T20:00:00-06:00",
    duration_minutes: 90,
    status: "cancelled",
  });
  assert.match(result, /DTSTART:20261115T020000Z/);
  assert.match(result, /DTEND:20261115T033000Z/);
  assert.ok(result.includes("SUMMARY:Libro\\, cine\\; charla"));
  assert.ok(result.includes("DESCRIPTION:Línea 1\\nLínea 2"));
  assert.match(result, /STATUS:CANCELLED/);
  assert.ok(result.endsWith("END:VCALENDAR\r\n"));
});
test("date failures and database failures produce actionable Spanish feedback", () => {
  assert.equal(formatDate("invalid-date"), "Fecha no disponible");
  assert.match(errorMessage({ code: "42501" }), /permiso/);
  assert.match(errorMessage({ code: "23505" }), /existe/);
  assert.match(errorMessage({ status: 429 }), /solicitudes/);
});
