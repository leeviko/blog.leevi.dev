import express, { Request, Response, Router } from "express";
import { scrypt } from "crypto";
import { body, validationResult } from "express-validator";
import pool from "../../config/db";
import cors from "cors";
import { ORIGIN } from "../../utils/constants";
import {
  getUsernameIPkey,
  limiterConsecutiveFailsByUsernameAndIP,
  limiterSlowBruteByIP,
  maxConsecutiveFailsByUsernameAndIP,
  maxWrongAttemptsByIPperDay,
} from "../../middleware/rateLimiter";

const corsOpts = cors({ origin: ORIGIN, credentials: true });

const router: Router = express.Router();

router.use("/", corsOpts);

/**
 * @route  POST api/auth
 * @desc   Login user
 * @access Public
 */
router.post(
  "/",
  [
    body("username").escape().trim().isLength({ min: 3, max: 50 }),
    body("password").escape().trim(),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ msg: "Username or password cannot be empty" });
    }
    const usernameIPkey = getUsernameIPkey(username, req.ip);
    const [resUsernameAndIP, resSlowByIP] = await Promise.all([
      limiterConsecutiveFailsByUsernameAndIP.get(usernameIPkey),
      limiterSlowBruteByIP.get(req.ip),
    ]);

    let retrySecs = 0;

    // Check if IP or Username + IP is already blocked
    if (
      resSlowByIP !== null &&
      resSlowByIP.consumedPoints > maxWrongAttemptsByIPperDay
    ) {
      retrySecs = Math.round(resSlowByIP.msBeforeNext / 1000) || 1;
    } else if (
      resUsernameAndIP !== null &&
      resUsernameAndIP.consumedPoints > maxConsecutiveFailsByUsernameAndIP
    ) {
      retrySecs = Math.round(resUsernameAndIP.msBeforeNext / 1000) || 1;
    }

    if (retrySecs > 0) {
      res.set("Retry-After", String(retrySecs));
      return res.status(429).json({ msg: "Too many requests" });
    }

    const sql = "SELECT * FROM users WHERE username = $1 LIMIT 1";

    pool.query(sql, [username], async (err, result) => {
      if (err) {
        const promises = [limiterSlowBruteByIP.consume(req.ip)];
        await Promise.all(promises);
        return res.status(400).json({ msg: "Something went wrong" });
      }
      if (result.rowCount == 0) {
        const promises = [limiterSlowBruteByIP.consume(req.ip)];
        await Promise.all(promises);
        return res.status(400).json({ msg: "Wrong username or password" });
      }

      const user = result.rows[0];

      const [salt, key] = user.password.split(":");
      scrypt(password, salt, 32, async (err, derivedKey) => {
        if (err) {
          const promises = [
            limiterSlowBruteByIP.consume(req.ip),
            limiterConsecutiveFailsByUsernameAndIP.consume(usernameIPkey),
          ];
          await Promise.all(promises);
          return res.status(400).json({ msg: "Something went wrong" });
        }

        if (key !== derivedKey.toString("hex")) {
          const promises = [
            limiterSlowBruteByIP.consume(req.ip),
            limiterConsecutiveFailsByUsernameAndIP.consume(usernameIPkey),
          ];
          await Promise.all(promises);
          return res.status(400).json({ msg: "Wrong username or password" });
        }
        if (resUsernameAndIP !== null && resUsernameAndIP.consumedPoints > 0) {
          // Reset on successful login
          await limiterConsecutiveFailsByUsernameAndIP.delete(usernameIPkey);
        }

        const userObj = {
          id: user.id,
          username: user.username,
          admin: user.admin,
          created_at: user.created_at,
        };

        req.session.user = userObj;

        return res.json({ ...userObj, description: user.description });
      });
    });
  }
);

/**
 * @route  GET api/auth
 * @desc   Check if logged in & return cookie
 * @access Public
 */
router.get("/", (req, res) => {
  const sessUser = req.session.user;

  if (!sessUser) {
    return res.status(401).json({ msg: "Not logged in" });
  } else {
    return res.json({
      sessUser,
    });
  }
});

module.exports = router;
