import { NextFunction, Request, Response } from "express";
import Redis from "ioredis";
import { RateLimiterRedis } from "rate-limiter-flexible";
const redisClient = new Redis(process.env.REDIS_URL, {
  enableOfflineQueue: false,
});
redisClient.on("error", (err) => {
  console.log(`Rate limiter error:  ${err}`);
  return new Error(err);
});

// Rate limiter points
// API
const maxPointsPerDay = 1000;
const maxPointsPerHour = 100;
const maxPointsPerMinute = 15;

// Login
export const maxWrongAttemptsByIPperDay = 15;
export const maxConsecutiveFailsByUsernameAndIP = 5;

// ******************
// API rate limiter
// ******************
const apiDayRateLimiterRedis = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "api__day_rate_limit",
  points: maxPointsPerDay,
  duration: 60 * 60 * 24, // 24 hour
});
const apiHourRateLimiterRedis = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "api__hour_rate_limit",
  points: maxPointsPerHour,
  duration: 60 * 60, // 1 hour
});
const apiMinuteRateLimiterRedis = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "api__minute_rate_limit",
  points: maxPointsPerMinute,
  duration: 60, // 1 minute
});

// Day
export const apiDayRateLimiter = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const key = req.ip;

  apiDayRateLimiterRedis
    .consume(key, 1)
    .then(() => {
      return next();
    })
    .catch((err) => {
      return res
        .status(429)
        .json({ msg: "You have done too many requests. Try again in one day" });
    });
};
// Hour
export const apiHourRateLimiter = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const key = req.ip;

  apiHourRateLimiterRedis
    .consume(key, 1) // TODO: Consume based on route
    .then(() => {
      return next();
    })
    .catch((err) => {
      return res
        .status(429)
        .json({ msg: "Too many requests. Try again in one hour" });
    });
};
// Minute
export const apiMinuteRateLimiter = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const key = req.ip;

  apiMinuteRateLimiterRedis
    .consume(key, 1) // TODO: Consume based on route
    .then(() => {
      return next();
    })
    .catch((err) => {
      return res
        .status(429)
        .json({ msg: "Too many requests. Try again in one minute" });
    });
};
// ******************

// ******************
// Login rate limiter
// ******************
export const limiterSlowBruteByIP = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "login__fail_ip_per_day",
  points: maxWrongAttemptsByIPperDay,
  duration: 60 * 60 * 24, // 1 day
  blockDuration: 60 * 60 * 24, // 1 day
});

export const limiterConsecutiveFailsByUsernameAndIP = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "login__fail_consecutive_username_and_ip",
  points: maxConsecutiveFailsByUsernameAndIP,
  duration: 60 * 60 * 24 * 90, // Store number for 90 days since first fail
  blockDuration: 60 * 60, // 1 hour
});

export const getUsernameIPkey = (username: string, ip: string) =>
  `${username}_${ip}`;
// ******************
