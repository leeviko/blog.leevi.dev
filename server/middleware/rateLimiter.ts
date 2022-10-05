import Redis from "ioredis";
import { RateLimiterRedis } from "rate-limiter-flexible";
const redisClient = new Redis(process.env.REDIS_URL, {
  enableOfflineQueue: false,
});
redisClient.on("error", (err) => {
  return new Error(err);
});
export const maxWrongAttemptsByIPperDay = 100;
export const maxConsecutiveFailsByUsernameAndIP = 5;

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
  blockDuration: 60 * 60, // Block for 1 hour
});

export const getUsernameIPkey = (username: string, ip: string) =>
  `${username}_${ip}`;
