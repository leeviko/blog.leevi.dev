import React from "react";
import { useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Tag from "../../components/Tag";
import useGetPost from "../../hooks/useGetPost";
import { TPostResult } from "../../types";

import "../../styles/markdown.css";

const Post = () => {
  const { postId } = useParams();
  const post: TPostResult | null = useGetPost(postId);

  const formatDate = new Date(post?.created_at || "") || null;

  return (
    <article className="post-container">
      <div className="post">
        <div className="post-wrapper">
          <div className="post-author p-author">
            <span className="author-name">{post?.author?.username}</span>
            <span className="date">{formatDate.toLocaleDateString()}</span>
            {post?.private && <span className="p-flag private">Private</span>}
            {post?.status === "draft" && (
              <span className="p-flag draft">Draft</span>
            )}
          </div>
          <h1 className="post-title p-title">{post?.title}</h1>
          <ul className="post-tags p-tags">
            {post?.tags.map((tag) => (
              <Tag key={tag} name={tag} postType="full" />
            ))}
          </ul>
          <div className="post-content">
            <ReactMarkdown
              children={post?.content || ""}
              remarkPlugins={[remarkGfm]}
              className="markdown-body"
            />
          </div>
        </div>
      </div>
    </article>
  );
};

export default Post;
