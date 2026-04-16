export const TAG_COLORS = {
  red:    { bg: "#fee2e2", text: "#dc2626", border: "#fca5a5", label: "Red" },
  orange: { bg: "#fff7ed", text: "#ea580c", border: "#fdba74", label: "Orange" },
  yellow: { bg: "#fefce8", text: "#ca8a04", border: "#fde047", label: "Yellow" },
  green:  { bg: "#f0fdf4", text: "#16a34a", border: "#86efac", label: "Green" },
  teal:   { bg: "#f0fdfa", text: "#0d9488", border: "#5eead4", label: "Teal" },
  blue:   { bg: "#eff6ff", text: "#2563eb", border: "#93c5fd", label: "Blue" },
  indigo: { bg: "#eef2ff", text: "#4338ca", border: "#a5b4fc", label: "Indigo" },
  purple: { bg: "#faf5ff", text: "#7c3aed", border: "#c084fc", label: "Purple" },
  pink:   { bg: "#fdf2f8", text: "#db2777", border: "#f9a8d4", label: "Pink" },
  gray:   { bg: "#f8fafc", text: "#475569", border: "#cbd5e1", label: "Gray" },
} as const;

export type ColorKey = keyof typeof TAG_COLORS;

export const COLOR_KEYS = Object.keys(TAG_COLORS) as ColorKey[];

export const DEFAULT_COLOR: ColorKey = "purple";

const SEP = "::";

export function encodeTag(name: string, color: ColorKey): string {
  return `${name}${SEP}${color}`;
}

export function decodeTag(encoded: string): { name: string; color: ColorKey } {
  const idx = encoded.lastIndexOf(SEP);
  if (idx === -1) return { name: encoded, color: DEFAULT_COLOR };
  const colorKey = encoded.slice(idx + SEP.length) as ColorKey;
  const color = TAG_COLORS[colorKey] ? colorKey : DEFAULT_COLOR;
  return { name: encoded.slice(0, idx), color };
}
