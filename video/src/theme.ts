import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

const f = (family: string, file: string, weight: string, style = "normal") =>
  loadFont({ family, url: staticFile(`fonts/${file}.woff2`), weight, style });
["500", "600", "700"].forEach((w) => f("Cormorant", `cg-${w}`, w));
f("Cormorant", "cg-500i", "500", "italic");
["400", "500", "600", "700"].forEach((w) => f("Montserrat", `ms-${w}`, w));

export const serif = "Cormorant, serif";
export const sans = "Montserrat, sans-serif";

export const C = {
  red: "#B3201F",
  redDeep: "#5E0F12",
  gold: "#D8B26A",
  ivory: "#F7F1E6",
  ink: "#0E0B0A",
};

export const FPS = 30;
export const s = (sec: number) => Math.round(sec * FPS);
