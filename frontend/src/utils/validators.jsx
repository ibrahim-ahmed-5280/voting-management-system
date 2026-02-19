export const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").toLowerCase());

export const validatePassword = (value) => ({
  valid: value?.length >= 6,
  message: value?.length >= 6 ? "Strong enough" : "Minimum 6 characters"
});

export const requireFields = (payload, keys) =>
  keys.filter((key) => !String(payload[key] ?? "").trim());

