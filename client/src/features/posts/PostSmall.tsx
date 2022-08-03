import React from "react";

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

  const formatDate = new Date(post.created_at);

  return (
    <div className="post-small">
      <div className="post-small-wrapper">
        <div className="post-small-author">
          <span className="author-name">{post.authorid}</span>
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
