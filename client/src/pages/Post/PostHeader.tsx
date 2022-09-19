import React from "react";
import { Link } from "react-router-dom";
import Tag from "../../components/Tag";
import { TPostResult } from "../../types";

type Props = {
  post: TPostResult | null;
  type: "small" | "full";
};

const PostHeader = ({ post, type }: Props) => {
  return (
    <div className="post-header">
      {post && (
        <>
          <div className="post-author">
            <span className="post-author-name">{post?.author?.username}</span>
            <span className="post-date">
              {new Date(post.created_at).toLocaleDateString("fi")}
            </span>
            {post.private && <span className="post-flag private">Private</span>}
            {post.status === "draft" && (
              <span className="post-flag draft">Draft</span>
            )}
          </div>
          <h1 className="post-title">
            {type === "small" ? (
              <Link to={`/posts/${post.slug}`}>{post.title}</Link>
            ) : (
              post.title
            )}
          </h1>
          <ul className="post-tags">
            {post.tags.map((tag) => (
              <Tag key={tag} name={tag} postType={type} />
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default PostHeader;
