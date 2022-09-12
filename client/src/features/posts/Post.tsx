import React from "react";
import Skeleton from "react-loading-skeleton";
import { useParams } from "react-router-dom";
import LoaderWrapper from "../../components/LoaderWrapper";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Tag from "../../components/Tag";
import useGetAuthor from "../../hooks/useGetAuthor";
import useGetPost from "../../hooks/useGetPost";
import { AuthorType, PostType } from "../../types";

import "../../styles/markdown.css";

const Post = () => {
  const { postId } = useParams();
  const post: PostType = useGetPost(postId);
  const author: AuthorType | any = useGetAuthor(post.authorid);

  const formatDate = new Date(post.created_at);

  return (
    <article className="post-container">
      <div className="post">
        <div className="post-wrapper">
          <div className="post-author p-author">
            <LoaderWrapper
              loading={author === null}
              loaderComponent={<Skeleton width={100} />}
              delay={300}
            >
              {author && (
                <>
                  <span className="author-name">{author.username}</span>
                  <span className="date">
                    {formatDate.toLocaleDateString()}
                  </span>
                </>
              )}
            </LoaderWrapper>
          </div>
          <h1 className="post-title p-title">{post.title}</h1>
          <ul className="post-tags p-tags">
            {post.tags.map((tag) => (
              <Tag key={tag} name={tag} postType="full" />
            ))}
          </ul>
          <div className="post-content">
            <ReactMarkdown
              children={post.content}
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
