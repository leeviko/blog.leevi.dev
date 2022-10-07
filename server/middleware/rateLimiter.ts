import { NextFunction, Request, Response } from "express";
import Redis from "ioredis";
import { RateLimiterRedis } from "rate-limiter-flexible";
const redisClient = new Redis(process.env.REDIS_URL, {
  enableOfflineQueue: false,
});
redisClient.on("error", (err) => {
  console.log(`Redis rate limiter error:  ${err}`);
  return new Error(err);
});

// Rate limiter points
// API
const maxPointsPerHour = 150;
// Login
export const maxWrongAttemptsByIPperDay = 50;
export const maxConsecutiveFailsByUsernameAndIP = 5;

// ******************
// API rate limiter
// ******************
const apiRateLimiterRedis = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "api_rate_limit",
  points: maxPointsPerHour,
  duration: 60 * 60, // 1 hour
});

export const apiRateLimiter = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const key = req.ip;

  apiRateLimiterRedis
    .consume(key, 1) // TODO: Consume based on route
    .then(() => {
      return next();
    })
    .catch((err) => {
      return res.status(429).json({ msg: "Too many requests" });
    });
};
// ******************

// ******************
// Login rate limiter
// ******************
export const limiterSlowBruteByIP = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "login_fail_ip_per_day",
  points: maxWrongAttemptsByIPperDay,
  duration: 60 * 60 * 24, // 1 day
  blockDuration: 60 * 60 * 24, // 1 day
});

export const limiterConsecutiveFailsByUsernameAndIP = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "login_fail_consecutive_username_and_ip",
  points: maxConsecutiveFailsByUsernameAndIP,
  duration: 60 * 60 * 24 * 90, // Store number for 90 days since first fail
  blockDuration: 60 * 60, // 1 hour
});

export const getUsernameIPkey = (username: string, ip: string) =>
  `${username}_${ip}`;
// ******************
