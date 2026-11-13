import { avatarNames } from "../domain/profile.js";
import { useEffect, useState } from "react";
import { photos } from "../data/photos.js";
export function Avatar({ base = 0, color = "#a5c86a", options = {} }) {
  return options.mode === "photo" && options.photo ? (
    <PhotoAvatar
      path={options.photo}
      fallback={<Character base={base} color={color} options={options} />}
    />
  ) : (
    <Character base={base} color={color} options={options} />
  );
}
function PhotoAvatar({ path, fallback }) {
  const [photo, setPhoto] = useState(null);
  useEffect(() => {
    let active = true;
    const load = () =>
      photos
        .url(path)
        .then((url) => {
          if (active) setPhoto({ path, url });
        })
        .catch(() => {
          if (active) setPhoto(null);
        });
    load();
    const timer = setInterval(load, 240000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [path]);
  return photo?.path === path ? (
    <img
      className="profile-photo"
      src={photo.url}
      alt="Foto de perfil"
      onError={() => setPhoto(null)}
    />
  ) : (
    fallback
  );
}
function Character({ base: value, color, options }) {
  const base = Number.isInteger(value) && value >= 0 && value < 6 ? value : 0;
  const hair = options.hair || (base === 3 ? "#d9d3bf" : "#302b27");
  const outfit =
    options.outfit ||
    ["#485b37", "#805f75", "#c09a53", "#5d7b83", "#b26e55", "#655780"][base];
  const hairstyles = [
    "M25 37Q16 27 24 19Q24 9 35 10Q44 0 53 9Q69 1 74 14Q88 18 78 38L65 27L48 30L34 25Z",
    "M25 47Q15 5 52 11Q81 7 77 48L68 23Q52 44 25 47Z",
    "M23 42Q10 37 17 27Q9 17 23 12Q25 0 37 6Q48 -3 58 5Q73 -1 78 13Q92 15 84 29Q93 41 77 45L70 29Q50 22 30 31Z",
    "M25 39Q18 8 48 10Q79 5 76 40L59 28L42 39L35 29Z",
    "M26 33Q19 15 34 17L33 31M74 33Q81 15 66 17L67 31",
    "M33 28L35 10L45 15L51 2L58 14L68 9L67 30L52 23Z",
  ];
  return (
    <svg
      viewBox="0 0 100 100"
      role="img"
      aria-label={`Avatar ${avatarNames[base]}`}
    >
      <circle cx="50" cy="50" r="48" fill={color} />
      {[1, 3].includes(base) && (
        <path
          d={
            base === 1
              ? "M22 73V34Q18 4 50 8Q85 6 80 40L85 81L64 72L34 80Z"
              : "M23 68V31Q23 7 50 7Q79 8 78 34V68Z"
          }
          fill={hair}
        />
      )}
      <path
        d={
          base === 4
            ? "M10 100L22 77L41 67H59L78 77L90 100"
            : "M18 100Q20 65 50 66Q80 65 82 100"
        }
        fill={outfit}
      />
      <path
        d={base === 4 ? "M38 70L50 89L62 70" : "M36 72Q50 86 64 72"}
        fill="none"
        stroke="#fff"
        opacity=".6"
        strokeWidth="3"
      />
      <ellipse
        cx="50"
        cy="45"
        rx={base === 4 ? 25 : base === 1 ? 21 : 23}
        ry={base === 3 ? 24 : 27}
        fill={
          ["#e8b88d", "#9b6546", "#f1cfad", "#be8c67", "#79513f", "#d8a57f"][
            base
          ]
        }
      />
      <path d={hairstyles[base]} fill={hair} />
      <circle cx="41" cy="45" r="2" fill="#302b27" />
      <circle cx="59" cy="45" r="2" fill="#302b27" />
      {base === 4 && (
        <path
          d="M27 48Q31 75 50 77Q71 74 74 48L63 58L50 62L37 58Z"
          fill={hair}
        />
      )}
      {base === 0 && (
        <path d="M37 56Q42 52 50 55Q58 52 63 56L56 60H44Z" fill={hair} />
      )}
      <path
        d="M43 57Q50 63 57 57"
        fill="none"
        stroke={base === 4 ? "#e8b88d" : "#694633"}
        strokeWidth="2"
        strokeLinecap="round"
      />
      {base === 1 && (
        <g fill="#eac56f">
          <circle cx="28" cy="53" r="3" />
          <circle cx="72" cy="53" r="3" />
        </g>
      )}
      {base === 3 && (
        <path d="M34 56h5m22 0h5" stroke="#b16e69" strokeWidth="3" />
      )}
      {base === 5 && (
        <path d="M70 46h6m-52 0h6" stroke="#eac56f" strokeWidth="3" />
      )}
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
