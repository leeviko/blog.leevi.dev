import cors from "cors";
import express, { Request, Response } from "express";
import { body, param, query, validationResult } from "express-validator";
import { nanoid } from "nanoid";
import pool from "../../config/db";
import { auth } from "../../middleware/auth";
import { convertToSlug } from "../../utils";
import { getUserById } from "../../utils/users";

const router = express.Router();
const corsOpts = cors({ origin: process.env.ORIGIN, credentials: true });

router.use("/", corsOpts);

interface pgError extends Error {
  code?: string;
}

interface IPostQuery {
  limit: number;
  cursor: string;
  page: "prev" | "next" | null;
  status: "draft" | "live" | "all" | null;
}

/**
 * @route  GET api/posts
 * @desc   Get posts
 * @access Public
 */
// TODO: Get author info also here
// TODO: Show private posts only to the author and admin
router.get(
  "/",
  [
    query("limit")
      .escape()
      .trim()
      .isNumeric()
      .isLength({ max: 10 })
      .default(10),
    query("cursor").escape().trim(),
    query("page").escape().trim(),
    query("status").escape().trim().default("live"),
  ],
  async (req: Request<{}, {}, {}, IPostQuery>, res: Response) => {
    let { limit, cursor, page, status } = req.query;
    const decodedCursor = Buffer.from(cursor, "base64").toString("binary");

    let user;
    const params: Array<any> = [limit];
    let sql = `
      SELECT slug, authorid, title, content, tags, private, status, created_at
      FROM posts
    `;

    if (decodedCursor) {
      params.push(decodedCursor);
      if (page === "prev") {
        sql += "WHERE created_at > $2";
      } else {
        sql += "WHERE created_at < $2";
      }
    }

    if (status === "draft") {
      user = req.session.user;
      if (user && !user.admin) {
        params.push(user.id);
        sql += decodedCursor ? " AND authorid = $3" : " WHERE authorid = $2";
      }
    } else {
      sql += decodedCursor ? " AND status = 'live'" : " WHERE status = 'live'";
    }

    sql += " ORDER BY created_at DESC LIMIT $1";

    pool.query(sql, params, (err, result) => {
      if (err) {
        return res.status(400).json({
          msg: "Something went wrong while loading posts",
          err: err.message,
        });
      }
      const { rowCount } = result;

      let nextCursor: any;
      let encodedNextCursor: any;
      if (rowCount >= limit) {
        nextCursor = result.rows[result.rows.length - 1].created_at;

        encodedNextCursor = Buffer.from(JSON.stringify(nextCursor)).toString(
          "base64"
        );
        const nextExistsQuery = `
          SELECT created_at 
          FROM posts
          WHERE created_at < $2 LIMIT $1 + 1
        `;

        pool.query(nextExistsQuery, params, (err, result) => {
          if (err || result.rowCount === 0) {
            encodedNextCursor = null;
            return;
          }
        });
      } else {
        encodedNextCursor = null;
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
    body("status").trim().escape().default("draft"),
  ],
  auth,
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const { title, content, tags, isPrivate, status } = req.body;
    const slug = convertToSlug(title);
    const postId = nanoid();
    const authorId = req.session.user?.id;
    const newPost = {
      postId,
      slug,
      authorId,
      title,
      content,
      tags,
      isPrivate,
      status,
    };

    let user = await getUserById(authorId);
    if (!user.ok || !user.result) {
      return res.status(400).json({ msg: "Something went wrong" });
    }
    user = user.result;

    const query = {
      name: "create-post",
      text: "INSERT INTO posts (postId, slug, authorId, title, content, tags, private, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
      values: [postId, slug, authorId, title, content, tags, isPrivate, status],
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
