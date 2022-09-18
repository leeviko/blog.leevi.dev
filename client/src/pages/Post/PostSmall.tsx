import React from "react";
import Skeleton from "react-loading-skeleton";
import { Link } from "react-router-dom";
import Tag from "../../components/Tag";
import { TPostResult } from "../../types";

type Props = {
  post: TPostResult;
};

export const PostSkeleton = () => {
  return (
    <div style={{ marginTop: "1rem" }}>
      <Skeleton width={100} />
      <Skeleton height={25} />
      <Skeleton />
    </div>
  );
};

const PostSmall = ({ post }: Props) => {
  const formatDate = new Date(post.created_at);

  return (
    <div className="post-small">
      <div className="post-small-wrapper">
        <div className="post-small-author p-author">
          <span className="author-name">{post.author?.username}</span>
          <span className="date">{formatDate.toLocaleDateString()}</span>
          {post.private && <span className="p-flag private">Private</span>}
          {post.status === "draft" && (
            <span className="p-flag draft">Draft</span>
          )}
        </div>
        <h1 className="post-small-title p-title">
          <Link to={`/posts/${post.slug}`}>{post.title}</Link>
        </h1>
        <ul className="post-tags p-tags">
          {post.tags.map((tag) => (
            <Tag key={tag} name={tag} postType="small" />
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PostSmall;
