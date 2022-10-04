export const ORIGIN =
  process.env.NODE_ENV === "production"
    ? process.env.ORIGIN
    : "http://localhost:3000";
