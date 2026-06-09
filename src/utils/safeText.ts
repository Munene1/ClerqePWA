export const safeText = (value: unknown, fallback = ""): string => {
  if (typeof value !== "string") return fallback;
  const text = value.trim();
  return text || fallback;
};

