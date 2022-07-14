import express, { Request, Response } from "express";
import { body, param, query, validationResult } from "express-validator";
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
router.get(
  "/",
  [
    query("limit").escape().trim().isNumeric().isLength({ max: 10 }),
    query("cursor").escape().trim(),
  ],
  async (req: Request, res: Response) => {
    let { limit, cursor } = req.query;

    const decodedCursor = Buffer.from(<string>cursor, "base64").toString(
      "binary"
    );

    let sql = `
      SELECT * 
      FROM posts 
      WHERE date_trunc('second', created_at) > $2 ORDER BY created_at LIMIT $1
    `;
    let params = [limit, decodedCursor];

    if (!cursor || !decodedCursor) {
      sql = "SELECT * FROM posts ORDER BY created_at LIMIT $1";
      params = [limit];
    }

    pool.query(sql, params, (err, result) => {
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
  }
);

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

    // Check if user exists
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

/**
 * @route  DELETE api/posts/:slug
 * @desc   Delete a post
 * @access Private
 */
router.delete(
  "/:slug",
  [param("slug").escape().trim()],
  auth,
  async (req: Request, res: Response) => {
    const { slug } = req.params;
    const userId = req.session.user?.id;

    // Check if user exists
    const sql = "SELECT id FROM users WHERE id = $1 LIMIT 1";
    const author = await pool.query(sql, [userId]);

    if (author.rowCount === 0) {
      return res.status(400).json({ msg: "User doesnt exist" });
    }

    const query = {
      name: "delete-post",
      text: "DELETE FROM posts WHERE slug = $1 AND authorId = $2",
      values: [slug, userId],
    };

    pool.query(query, (err, result) => {
      if (err) {
        return res
          .status(400)
          .json({ msg: "Couldnt delete post", err: err.message });
      }

      if (result.rowCount === 0) {
        return res.status(404).json({ msg: "Post not found" });
      }

      return res.json({ msg: "Post deleted", slug });
    });
  }
);

module.exports = router;
