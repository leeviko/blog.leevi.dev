import express, { Express, Request, Response } from "express";
import session from "express-session";
import Redis from "ioredis";
import connectRedis from "connect-redis";
import dotenv from "dotenv";

dotenv.config();
const port = process.env.PORT || 5000;

const app: Express = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.set("trust proxy", 1);

const RedisStore = connectRedis(session);
const redis = new Redis(process.env.REDIS_URL);

//Configure session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
    store: new RedisStore({ client: redis }),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      httpOnly: false,
      maxAge: 1000 * 60 * 60 * 24 * 2, // 2 days,
    },
  })
);

app.use("/api/users", require("./routes/api/users"));
app.use("/api/posts", require("./routes/api/posts"));

app.listen(port, () => {
  console.log(`⚡️ Server is running on port ${port}`);
});
