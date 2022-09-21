import cors from "cors";
import express, { Request, Response } from "express";
import { body, param, query, validationResult } from "express-validator";
import { nanoid } from "nanoid";
import pool from "../../config/db";
import { pg as named } from "yesql";
import { auth } from "../../middleware/auth";
import { convertToSlug } from "../../utils/convertToSlug";
import { getUserById } from "../../utils/users";
import { TUserResult } from "./users";

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
        postid,
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
      sql += " AND private = false AND status = 'live'";
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
        postid,
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
    body("content").trim(),
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
    const postid = nanoid();
    const authorId = req.session.user?.id;

    let userRes = await getUserById(authorId);
    if (!userRes.ok || !userRes.result) {
      return res.status(400).json({ msg: "Something went wrong" });
    }

    if (status === "draft") {
      slug += `--draft-${new Date().getTime()}`;
    }

    const newPost = {
      postid,
      slug,
      authorId,
      title,
      content,
      tags,
      isPrivate,
      status,
    };

    const sql = `
      INSERT INTO posts (postid, slug, authorId, title, content, tags, private, status) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `;
    const params = [
      postid,
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
 * @route  PUT api/posts/:postid
 * @desc   Update a post
 * @access Private
 */
// TODO: If changed from live to draft, change slug
router.put(
  "/:postid",
  [
    param("postid").trim().escape(),
    body("title")
      .optional()
      .trim()
      .escape()
      .isLength({ min: 5 })
      .withMessage("Title cannot less than 5 characters long"),
    body("content").optional().trim(),
    body("tags").optional().isArray({ max: 10 }),
    body("isPrivate").optional().isBoolean().trim().escape(),
    body("status")
      .optional()
      .trim()
      .escape()
      .isIn(["live", "draft"])
      .default("draft"),
  ],
  auth,
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    const postid = req.params.postid;
    const { title, content, tags, isPrivate, status } = req.body;

    const user = req.session.user;
    let userExists = await getUserById(user?.id);
    if (!userExists.ok || !userExists.result) {
      return res.status(400).json({ msg: "Something went wrong" });
    }

    let sql = "UPDATE posts";
    let params: any = {
      title,
      slug: "",
      content,
      tags,
      isPrivate,
      status,
      postid,
    };

    const updatedValues: any = { postid };
    let updatedColCount = 0;
    if (title && title.length >= 5) {
      params.slug = convertToSlug(title);
      sql += " SET title = :title, slug = :slug";
      updatedColCount++;
      updatedValues.title = title;
      updatedValues.slug = params.slug;
    }
    if (content) {
      if (updatedColCount === 0) {
        sql += " SET content = :content";
      } else {
        sql += ", content = :content";
      }
      updatedValues.content = content;
      updatedColCount++;
    }
    if (tags) {
      if (updatedColCount === 0) {
        sql += " SET tags = :tags";
      } else {
        sql += ", tags = :tags";
      }
      updatedValues.tags = tags;
      updatedColCount++;
    }
    if (typeof isPrivate !== "undefined") {
      if (updatedColCount === 0) {
        sql += " SET private = :isPrivate";
      } else {
        sql += ", private = :isPrivate";
      }
      updatedValues.private = isPrivate;
      updatedColCount++;
    }
    if (status) {
      if (updatedColCount === 0) {
        sql += " SET status = :status";
      } else {
        sql += ", status = :status";
      }
      updatedValues.status = status;
      updatedColCount++;
    }
    if (updatedColCount === 0) {
      return res.status(400).json({ msg: "Nothing to update" });
    }

    sql += " WHERE postid = :postid";

    pool.query(named(sql)(params), (err, result) => {
      if (err) {
        return res
          .status(400)
          .json({ msg: "Updating post failed", err: err.message });
      }

      return res.json({ msg: "Post updated", updatedValues });
    });
  }
);

/**
 * @route  DELETE api/posts/:postid
 * @desc   Delete a post
 * @access Private
 */
router.delete(
  "/:postid",
  [param("postid").escape().trim()],
  auth,
  async (req: Request, res: Response) => {
    const { postid } = req.params;

    const user = req.session.user;
    let userExists = await getUserById(user?.id);
    if (!userExists.ok || !userExists.result) {
      return res.status(400).json({ msg: "Something went wrong" });
    }

    let sql = "DELETE FROM posts WHERE postid = $1";
    const params: any[] = [postid];

    if (!user?.admin) {
      params.push(user?.id);
      sql += " AND authorId = $2";
    }

    pool.query(sql, params, (err, result) => {
      if (err) {
        return res
          .status(400)
          .json({ msg: "Couldnt delete post", err: err.message });
      }
      if (result.rowCount === 0) {
        return res.status(404).json({ msg: "Post not found" });
      }

      return res.json({ msg: "Post deleted", postid });
    });
  }
);

module.exports = router;
