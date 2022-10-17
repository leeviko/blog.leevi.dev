import express, { Express, NextFunction, Request, Response } from "express";
import session from "express-session";
import Redis from "ioredis";
import connectRedis from "connect-redis";
import morgan from "morgan";
import dotenv from "dotenv";
import helmet from "helmet";
import {
  apiHourRateLimiter,
  apiMinuteRateLimiter,
} from "./middleware/rateLimiter";

dotenv.config({
  path: process.env.NODE_ENV === "production" ? ".env" : ".env.local",
});
const port = process.env.PORT || 5000;

const app: Express = express();

app.use(morgan("tiny"));
app.disable("x-powered-by");
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.set("trust proxy", 1);

const RedisStore = connectRedis(session);
const redisClient = new Redis(process.env.REDIS_URL);

redisClient.on("error", (err) => {
  console.log(`Session Redis error:  ${err}`);
  return new Error(err);
});

//Configure session middleware
app.use(
  session({
    name: "user_sid",
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
    store: new RedisStore({ client: redisClient }),
    cookie: {
      secure: "auto",
      sameSite: "strict",
      httpOnly: false,
      maxAge: 1000 * 60 * 60 * 24 * 1, // 1 day,
    },
  })
);

app.use(apiHourRateLimiter);
app.use(apiMinuteRateLimiter);
app.use("/api/users", require("./routes/api/users"));
app.use("/api/posts", require("./routes/api/posts"));
app.use("/api/auth", require("./routes/api/auth"));

app.use((req, res, next) => {
  res.status(404).send({ msg: "Couldnt find the resource" });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send({ msg: "Something went wrong" });
});

app.listen(port, () => {
  console.log(`⚡️ Server is running on port ${port}`);
});
