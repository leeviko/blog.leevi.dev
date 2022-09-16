import express, { Request, Response, Router } from "express";
import { scrypt } from "crypto";
import { body, validationResult } from "express-validator";
import pool from "../../config/db";
import cors from "cors";

const corsOpts = cors({ origin: process.env.ORIGIN, credentials: true });

const router: Router = express.Router();

router.use("/", corsOpts);

interface pgError extends Error {
  code?: string;
}

/**
 * @route  POST api/users/login
 * @desc   Login user
 * @access Public
 */
router.post(
  "/",
  [
    body("username").escape().trim().isLength({ min: 3, max: 50 }),
    body("password").escape().trim(),
  ],
  (req: Request, res: Response) => {
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

    const query = {
      name: "get-user-by-username",
      text: "SELECT * FROM users WHERE username = $1",
      values: [username],
    };

    pool.query(query, (err, result) => {
      if (err) {
        return res.status(400).json({ msg: "Something went wrong" });
      }
      if (result.rowCount == 0) {
        return res.status(400).json({ msg: "Wrong email or password" });
      }

      const user = result.rows[0];

      const [salt, key] = user.password.split(":");
      scrypt(password, salt, 32, (err, derivedKey) => {
        if (err) {
          return res.status(400).json({ msg: "Something went wrong" });
        }

        if (key !== derivedKey.toString("hex")) {
          return res.status(400).json({ msg: "Wrong username or password" });
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
