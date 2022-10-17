import express, { Request, Response, Router } from "express";
import { scrypt, randomBytes } from "crypto";
import { nanoid } from "nanoid";
import { body, param, validationResult } from "express-validator";
import pool from "../../config/db";
import cors from "cors";
import { ORIGIN } from "../../utils/constants";

const corsOpts = cors({ origin: ORIGIN });

const router: Router = express.Router();

router.use("/:id", corsOpts);

interface pgError extends Error {
  code?: string;
}

export type TUserResult = {
  id: string;
  username: string;
  admin: boolean | null;
  description: string | null;
  created_at: Date;
};

/**
 * @route  POST api/users
 * @desc   Create new user
 * @access Public
 */
if (process.env.NODE_ENV !== "production") {
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
      const sql = "SELECT username FROM users WHERE username = $1 LIMIT 1";

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
          text: "INSERT INTO users (id, username, password) VALUES ($1, $2, $3)",
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
            admin: null,
            created_at: new Date(),
          };

          req.session.user = user;

          return res.json(user);
        });
      });
    }
  );
}

/**
 * @route  GET api/users/:id
 * @desc   Get user
 * @access Public
 */
router.get(
  "/:id",
  [param("id").escape().trim()],
  (req: Request, res: Response) => {
    const id = req.params.id;

    if (!id) {
      return res.status(400).json({ msg: "Something went wrong" });
    }

    const query = {
      name: "get-user-by-id",
      text: `
        SELECT id, username, description, created_at 
        FROM users WHERE id = $1 LIMIT 1
      `,
      values: [id],
    };

    pool.query(query, (err, result) => {
      if (err) {
        return res.status(400).json({ msg: "Something went wrong" });
      }

      if (result.rowCount === 0) {
        return res.status(404).json({ msg: "User not found" });
      }

      return res.json({ result: result.rows[0] });
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
