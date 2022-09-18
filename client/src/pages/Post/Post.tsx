import React from "react";
import { useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import useGetPost from "../../hooks/useGetPost";
import { TPostResult } from "../../types";

import "../../styles/markdown.css";
import PostHeader from "./PostHeader";

const Post = () => {
  const { postId } = useParams();
  const post: TPostResult | null = useGetPost(postId);

  return (
    <article className="post-container">
      <div className="post">
        <div className="post-wrapper">
          {post && <PostHeader post={post} type="full" />}
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
