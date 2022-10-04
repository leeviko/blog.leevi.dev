import rateLimit from "express-rate-limit";

export const apiLimiter = rateLimit({
  windowMs: 1000 * 60 * 10, // 10 minutes
  max: 100, // Limit each IP to 100 requests per `window` (windowMs)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: { msg: "Too many requests, slow down!" },
});

export const authLimiter = rateLimit({
  windowMs: 1000 * 60 * 5, // 5 minute,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { msg: "Too many requests, slow down!" },
});
