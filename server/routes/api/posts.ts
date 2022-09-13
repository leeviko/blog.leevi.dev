import cors from "cors";
import express, { Request, Response } from "express";
import { body, param, query, validationResult } from "express-validator";
import pool from "../../config/db";
import { auth } from "../../middleware/auth";
import { convertToSlug } from "../../utils";

const router = express.Router();

router.use("/", cors());

interface pgError extends Error {
  code?: string;
}

/**
 * @route  GET api/posts
 * @desc   Get public posts
 * @access Public
 */
// TODO: Get author info also here
router.get(
  "/",
  [
    query("limit").escape().trim().isNumeric().isLength({ max: 10 }),
    query("cursor").escape().trim(),
  ],
  async (req: Request, res: Response) => {
    let { limit, cursor, page } = req.query;

    const decodedCursor = Buffer.from(<string>cursor, "base64").toString(
      "binary"
    );
    let sql;
    let params: any;
    params = [limit, decodedCursor];

    switch (page) {
      case "prev":
        sql = `
          SELECT slug, authorid, title, tags, private, created_at 
          FROM posts 
          WHERE created_at > $2 ORDER BY created_at DESC LIMIT $1
        `;
        break;
      case "next":
      default:
        sql = `
          SELECT slug, authorid, title, tags, private, created_at 
          FROM posts 
          WHERE created_at < $2 ORDER BY created_at DESC LIMIT $1
        `;
        break;
    }

    if (!cursor || !decodedCursor) {
      sql =
        "SELECT slug, authorid, title, tags, private, created_at FROM posts ORDER BY created_at DESC LIMIT $1";
      params = [limit];
    }

    pool.query(sql, params, (err, result) => {
      if (err) {
        return res.status(400).json({
          msg: "Something went wrong while loading posts",
          err: err.message,
        });
      }
      const { rowCount } = result;

      const nextCursor: any = result.rows[result.rows.length - 1].created_at;

      let encodedNextCursor: any = Buffer.from(
        JSON.stringify(nextCursor)
      ).toString("base64");

      if (rowCount < 10) {
        encodedNextCursor = null;
      } else {
        sql = `
          SELECT slug, authorid, title, tags, private, created_at 
          FROM posts 
          WHERE created_at < $2 ORDER BY created_at DESC LIMIT $1 + 1
        `;

        pool.query(sql, params, (err, result) => {
          if (err) {
            encodedNextCursor = null;
            return;
          }
          if (result.rowCount === 0) {
            encodedNextCursor = null;
            return;
          }
        });
      }

      return res.json({
        result: result.rows,
        cursor: { prev: cursor || null, next: encodedNextCursor },
      });
    });
  }
);

/**
 * @route  GET api/posts/:slug
 * @desc   Get post by slug
 * @access Public
 */

router.get(
  "/:slug",
  [param("slug").escape().trim()],
  (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const { slug } = req.params;

    if (!slug) {
      return res.status(400).json({ msg: "Id not specified" });
    }

    const query = {
      name: "get-post-by-slug",
      text: "SELECT * FROM posts WHERE slug = $1 LIMIT 1",
      values: [slug],
    };

    pool.query(query, (err, result) => {
      if (err) {
        return res
          .status(400)
          .json({ msg: "Something went wrong", err: err.message });
      }

      if (result.rowCount === 0) {
        return res.status(404).json({ msg: "Post not found" });
      }

      return res.json({
        result: result.rows,
      });
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
