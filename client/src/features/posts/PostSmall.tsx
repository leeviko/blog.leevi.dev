import React from "react";
import { Link } from "react-router-dom";
import useGetAuthor from "../../hooks/useGetAuthor";
import { AuthorType } from "../../types";

type Props = {
  post: {
    authorid: string;
    content: string;
    created_at: string;
    private: boolean;
    slug: string;
    tags: Array<string>;
    title: string;
  };
};

const PostSmall = (props: Props) => {
  const { post } = props;
  const author: AuthorType | any = useGetAuthor(post.authorid);

  const formatDate = new Date(post.created_at);

  return (
    <div className="post-small">
      <div className="post-small-wrapper">
        <div className="post-small-author">
          <span className="author-name">{author && author.username}</span>
          <span className="date">{formatDate.toLocaleDateString()}</span>
        </div>
        <h1 className="post-small-title">
          <Link to={`/posts/${post.slug}`}>{post.title}</Link>
        </h1>
      </div>
    </div>
  );
};

export default PostSmall;
