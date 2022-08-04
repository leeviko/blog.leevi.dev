import React from "react";
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
          <span className="post-small-date">
            {formatDate.toLocaleDateString()}
          </span>
        </div>
        <h1>{post.title}</h1>
      </div>
    </div>
  );
};

export default PostSmall;
