// /src/utils/embed.ts
// console.log(import.meta.env.VITE_EMBED_ENABLED);

export const isEmbedded = (): boolean => {
  try {
    return window.self !== window.top;
  } catch {
    // cross-origin iframe access error = embedded แน่นอน
    return true;
  }
};

export const getAllowedEmbedOrigins = (): string[] => {
  const raw = import.meta.env.VITE_ALLOWED_EMBED_ORIGINS;
  if (!raw) return [];
  return raw.split(",").map((v: string) => v.trim());
};

export const isEmbedAllowedByEnv = (): boolean => {
  return import.meta.env.VITE_EMBED_ENABLED === "true";
};

export const isAllowedReferrer = (): boolean => {
  const allowed = getAllowedEmbedOrigins();
  if (allowed.length === 0) return false;
  if (!document.referrer) return false;

  return allowed.some(origin => {
    if (origin.includes("*")) {
      const regex = new RegExp(
        "^" + origin.replace(/\./g, "\\.").replace("*", ".*")
      );
      return regex.test(document.referrer);
    }
    return document.referrer.startsWith(origin);
  });
};
