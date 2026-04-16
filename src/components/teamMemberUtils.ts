/** Resize + center-crop an image file to a square base64 JPEG. */
export function resizeAvatar(file: File, size = 60): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d")!;
        const min = Math.min(img.width, img.height);
        const sx = (img.width - min) / 2;
        const sy = (img.height - min) / 2;
        ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size);
        resolve(canvas.toDataURL("image/jpeg", 0.75));
      };
      img.src = e.target!.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/** Initials fallback for members without an avatar. */
export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("");
}

/**
 * Encode a member as "name::dataURL" (or just "name" if no avatar).
 * Uses the FIRST "::" as the separator — safe because data URLs contain
 * only a single ":" and base64 chars never include ":".
 */
export function encodeMember(name: string, avatar: string | null): string {
  return avatar ? `${name}::${avatar}` : name;
}

export function decodeMember(encoded: string): { name: string; avatar: string | null } {
  const sep = encoded.indexOf("::");
  if (sep === -1) return { name: encoded, avatar: null };
  return { name: encoded.slice(0, sep), avatar: encoded.slice(sep + 2) };
}
