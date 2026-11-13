import { avatarNames } from "../lib/profile.js";
export function Avatar({ base = 0, color = "#a5c86a", options = {} }) {
  const hair = options.hair || (base === 3 ? "#d9d3bf" : "#302b27");
  const outfit =
    options.outfit ||
    ["#485b37", "#805f75", "#c09a53", "#5d7b83", "#b26e55", "#655780"][base];
  return (
    <svg
      viewBox="0 0 100 100"
      role="img"
      aria-label={`Avatar ${avatarNames[base]}`}
    >
      <circle cx="50" cy="50" r="48" fill={color} />
      <path d="M18 100Q20 65 50 66Q80 65 82 100" fill={outfit} />
      <ellipse
        cx="50"
        cy="45"
        rx="23"
        ry="27"
        fill={
          ["#e8b88d", "#9b6546", "#f1cfad", "#be8c67", "#79513f", "#d8a57f"][
            base
          ]
        }
      />
      <path
        d={
          base % 2
            ? "M25 43Q17 5 52 15Q85 8 77 55L68 31Q42 46 25 43"
            : "M25 40Q20 7 51 13Q81 10 76 40L65 29L48 32L35 26Z"
        }
        fill={hair}
      />
      <circle cx="41" cy="45" r="2" fill="#302b27" />
      <circle cx="59" cy="45" r="2" fill="#302b27" />
      <path
        d="M43 57Q50 63 57 57"
        fill="none"
        stroke="#694633"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {base === 2 && <path d="M26 24L50 3L75 24Z" fill="#b2bb72" />}
      {options.accessory === "glasses" && (
        <g fill="none" stroke="#343833" strokeWidth="2">
          <circle cx="40" cy="45" r="8" />
          <circle cx="60" cy="45" r="8" />
          <path d="M48 45h4" />
        </g>
      )}
      {options.accessory === "leaf" && (
        <path d="M67 26Q85 8 88 24Q80 37 67 26" fill="#a5c86a" />
      )}
      {options.accessory === "headphones" && (
        <g fill="none" stroke="#eac56f" strokeWidth="5">
          <path d="M24 48V37a26 26 0 0152 0v11" />
          <path d="M24 43v14M76 43v14" strokeWidth="9" />
        </g>
      )}
    </svg>
  );
}
