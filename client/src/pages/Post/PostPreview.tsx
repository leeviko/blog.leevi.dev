import React from "react";
import Tag from "../../components/Tag";
import PostMarkdown from "./PostMarkdown";

type Props = {
  post: any;
  tags: Array<string>;
};

const Preview = ({ post, tags }: Props) => {
  return (
    <div className="preview">
      <article className="post-container">
        <div className="post">
          <div className="post-wrapper">
            <h1 className="post-title p-title">{post.title}</h1>
            <ul className="post-tags p-tags">
              {tags.map((tag: any) => (
                <Tag key={tag} name={tag} postType="full" />
              ))}
            </ul>
            <div className="post-content">
              <PostMarkdown postContent={post.content} />
            </div>
          </div>
        </div>
      </article>
    </div>
  );
};

export default Preview;
