import cors from "cors";
import express, { Request, Response } from "express";
import { body, param, query, validationResult } from "express-validator";
import { nanoid } from "nanoid";
import pool from "../../config/db";
import { pg as named } from "yesql";
import { auth } from "../../middleware/auth";
import { convertToSlug } from "../../utils/convertToSlug";
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
    query("status").escape().trim().isIn(["live", "draft"]).default("live"),
  ],
  async (req: Request<{}, {}, {}, IPostQuery>, res: Response) => {
    let { limit, cursor, page, status } = req.query;
    limit = Number(limit);
    const decodedCursor = Buffer.from(cursor, "base64").toString("binary");

    const user = req.session.user || null;
    const params: any = { limit, decodedCursor, userId: "" };
    let sql = `
      SELECT 
        slug, 
        posts.authorid, 
        json_build_object('userId', users.id, 'username', users.username, 'created_at', users.created_at) AS author, 
        title, content, tags, private, status, posts.created_at
      FROM posts 
      INNER JOIN users ON posts.authorid = users.id WHERE 1=1
    `;

    if (decodedCursor) {
      if (page === "prev") {
        sql += " AND posts.created_at > :decodedCursor";
      } else {
        sql += " AND posts.created_at < :decodedCursor";
      }
    }

    if (user) {
      params.userId = user.id;
      if (!user.admin) {
        sql +=
          " AND CASE WHEN private = true THEN posts.authorid = :userId ELSE true END";
      }
      if (status === "draft") {
        sql += " AND posts.authorid = :userId";
      } else {
        sql += " AND status = 'live'";
      }
    } else {
      sql += " AND private = false";
    }

    sql += " ORDER BY posts.created_at DESC LIMIT :limit";

    pool.query(
      named(sql, { useNullForMissing: true })(params),
      (err, result) => {
        if (err) {
          return res.status(400).json({
            msg: "Something went wrong while loading posts",
            err: err.message,
          });
        }
        const { rowCount } = result;

        let nextCursor: any;
        let encodedNextCursor: any;
        if (rowCount === limit) {
          nextCursor = result.rows[result.rows.length - 1].created_at;

          encodedNextCursor = Buffer.from(JSON.stringify(nextCursor)).toString(
            "base64"
          );

          params[0] += 1;
          pool.query(sql, params, (err, result) => {
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
      }
    );
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
    const user = req.session.user || null;

    if (!slug) {
      return res.status(400).json({ msg: "Id not specified" });
    }
    let sql = `
      SELECT 
        slug, 
        posts.authorid, 
        json_build_object('userId', users.id, 'username', users.username, 'created_at', users.created_at) AS author, 
        title, content, tags, private, status, posts.created_at
      FROM posts 
      INNER JOIN users ON posts.authorid = users.id WHERE slug = :slug
    `;
    const params = { slug, userId: "" };

    if (user) {
      if (!user.admin) {
        params.userId = user.id;
        sql +=
          " AND CASE WHEN private = true THEN authorid = :userId ELSE true END";
      }
    } else {
      sql += " AND private = false";
    }
    sql += " LIMIT 1";

    pool.query(
      named(sql, { useNullForMissing: true })(params),
      (err, result) => {
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
      }
    );
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
      .isLength({ min: 5 })
      .withMessage("Title cannot less than 5 characters long"),
    body("content").trim().escape(),
    body("tags").isArray({ max: 10 }),
    body("isPrivate").isBoolean().trim().escape(),
    body("status").trim().escape().isIn(["live", "draft"]).default("draft"),
  ],
  auth,
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const { title, content, tags, isPrivate, status } = req.body;
    let slug = convertToSlug(title);
    const postId = nanoid();
    const authorId = req.session.user?.id;

    let user = await getUserById(authorId);
    if (!user.ok || !user.result) {
      return res.status(400).json({ msg: "Something went wrong" });
    }
    user = user.result;

    if (status === "draft") {
      slug += `--draft-${new Date().getTime()}`;
    }

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

    const sql = `
      INSERT INTO posts (postId, slug, authorId, title, content, tags, private, status) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `;
    const params = [
      postId,
      newPost.slug,
      authorId,
      title,
      content,
      tags,
      isPrivate,
      status,
    ];

    pool.query(sql, params, (err, result) => {
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
