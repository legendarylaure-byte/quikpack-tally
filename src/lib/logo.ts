export const MAX_LOGO_BYTES = 150 * 1024;

export const ALLOWED_LOGO_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
] as const;

export function validateLogoFile(file: { type: string; size: number }) {
  if (!ALLOWED_LOGO_TYPES.some((type) => type === file.type)) {
    return "Use a PNG, JPEG or WebP logo.";
  }

  if (file.size === 0) {
    return "The logo file is empty.";
  }

  if (file.size > MAX_LOGO_BYTES) {
    return `Logo must be ${MAX_LOGO_BYTES / 1024}KB or smaller.`;
  }

  return null;
}

export function readSmallLogo(file: File) {
  const error = validateLogoFile(file);
  if (error) {
    return Promise.reject(new Error(error));
  }

  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read the logo file."));
    reader.readAsDataURL(file);
  });
}
