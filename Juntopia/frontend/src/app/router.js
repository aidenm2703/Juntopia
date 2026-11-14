import { useEffect, useState } from "react";
function readRoute() {
  return window.location.hash.startsWith("#/")
    ? window.location.hash.slice(2)
    : "home";
}
export function navigate(route) {
  window.location.hash = `/${route}`;
}
export function useRoute() {
  const [route, setRoute] = useState(readRoute);
  useEffect(() => {
    const change = () => {
      setRoute(readRoute());
      window.scrollTo({ top: 0 });
    };
    window.addEventListener("hashchange", change);
    return () => window.removeEventListener("hashchange", change);
  }, []);
  return [route, navigate];
}
