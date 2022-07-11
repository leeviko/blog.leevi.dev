import express, { Request, Response, Router } from "express";
import { scrypt, randomBytes } from "crypto";
import { nanoid } from "nanoid";
import { body, validationResult } from "express-validator";
import pool from "../../config/db";

const router: Router = express.Router();

interface pgError extends Error {
  code?: string;
}

/**
 * @route  POST api/users
 * @desc   Create new user
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

    // Check if user already exists
    const sql = "SELECT name FROM users WHERE name = $1 LIMIT 1";

    const userExists = await pool.query(sql, [username]);
    if (userExists.rowCount === 1) {
      return res.status(400).json({ msg: "Username is already in use" });
    }

    // generate random 16 bytes long salt
    const salt = randomBytes(16).toString("hex");

    scrypt(password, salt, 32, (err, derivedKey) => {
      if (err)
        return res
          .status(400)
          .json({ msg: "Something went wrong while registering" });

      const hash = salt + ":" + derivedKey.toString("hex");
      const id = nanoid();

      const query = {
        name: "create-user",
        text: "INSERT INTO users (id, name, password) VALUES ($1, $2, $3)",
        values: [id, username, hash],
      };

      pool.query(query, (err: pgError, result) => {
        if (err) {
          switch (err.code) {
            case "23505":
              return res.status(400).json({ msg: "Username already in use" });
            default:
              return res
                .status(400)
                .json({ msg: "Something went wrong while registering" });
          }
        }
        if (result.rowCount === 0) {
          return res
            .status(400)
            .json({ msg: "Something went wrong while registering" });
        }

        const user = {
          id,
          username,
          createdat: new Date(),
        };

        req.session.user = user;

        return res.json(user);
      });
    });
  }
);

/**
 * @route  POST api/users/login
 * @desc   Login user
 * @access Public
 */
router.post(
  "/login",
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
      text: "SELECT * FROM users WHERE name = $1",
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
          username: user.name,
          createdat: user.createdat,
        };

        req.session.user = userObj;

        return res.json({ ...userObj, description: user.description });
      });
    });
  }
);

/**
 * @route  POST api/users/logout
 * @desc   Logout user
 * @access Public
 */
router.delete("/logout", (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      return res
        .status(400)
        .json({ msg: "Something went wrong while logging out" });
    }
    res.json({ msg: "Logged out" });
  });
});

module.exports = router;
