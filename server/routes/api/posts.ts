import express, { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import pool from "../../config/db";
import { auth } from "../../middleware/auth";
import { convertToSlug } from "../../utils";

const router = express.Router();

interface pgError extends Error {
  code?: string;
}

/**
 * @route  GET api/posts
 * @desc   Get public posts
 * @access Public
 */
router.get("/", async (req, res) => {
  let { limit, cursor } = req.query;

  if (!cursor) {
    const sql = "SELECT * FROM posts ORDER BY created_at LIMIT $1";

    pool.query(sql, [limit], (err, result) => {
      if (err) {
        return res.status(400).json({
          msg: "Something went wrong while loading posts",
          err: err.message,
        });
      }

      return res.json(result.rows);
    });
  }

  const decodedCursor = Buffer.from(<string>cursor, "base64").toString(
    "binary"
  );

  const sql = `
    SELECT * 
    FROM posts 
    WHERE date_trunc('second', created_at) > $1 ORDER BY created_at LIMIT $2
  `;

  pool.query(sql, [decodedCursor, limit], (err, result) => {
    if (err) {
      return res.status(400).json({
        msg: "Something went wrong while loading posts",
        err: err.message,
      });
    }

    const cursor: any = result.rows[result.rows.length - 1].created_at;

    const encodedCursor: any = Buffer.from(JSON.stringify(cursor)).toString(
      "base64"
    );

    return res.json({ result: result.rows, cursor: encodedCursor });
  });
});

/**
 * @route  POST api/posts
 * @desc   Create new post
 * @access Private
 */
router.post(
  "/",
  [
    body("title")
      .notEmpty()
      .trim()
      .escape()
      .withMessage("Title cannot be empty"),
    body("content")
      .notEmpty()
      .trim()
      .escape()
      .withMessage("Content cannot be empty"),
    body("tags").isArray({ max: 20 }),
    body("isPrivate").isBoolean().trim().escape(),
  ],
  auth,
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const { title, content, tags, isPrivate } = req.body;
    const slug = convertToSlug(title);
    const authorId = req.session.user?.id;

    const newPost = {
      slug,
      authorId,
      title,
      content,
      tags,
      isPrivate,
    };

    const sql = "SELECT id FROM users WHERE id = $1 LIMIT 1";
    const author = await pool.query(sql, [newPost.authorId]);

    if (author.rowCount === 0) {
      return res.status(400).json({ msg: "User doesnt exist" });
    }

    const query = {
      name: "create-post",
      text: "INSERT INTO posts (slug, authorId, title, content, tags, private) VALUES ($1, $2, $3, $4, $5, $6)",
      values: [slug, authorId, title, content, tags, isPrivate],
    };

    pool.query(query, (err, result) => {
      if (err) {
        return res
          .status(400)
          .json({ msg: "Something went wrong", err: err.message });
      }
      if (result.rowCount === 0) {
        return res.status(400).json({ msg: "Something went wrong" });
      }

      res.json({ ...newPost, created_at: new Date() });
    });
  }
);

module.exports = router;
