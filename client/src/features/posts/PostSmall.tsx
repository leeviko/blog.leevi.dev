import React from "react";
import Skeleton from "react-loading-skeleton";
import { Link } from "react-router-dom";
import LoaderWrapper from "../../components/LoaderWrapper";
import Tag from "../../components/Tag";
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
          <LoaderWrapper
            loading={author === null}
            loaderComponent={<Skeleton width={100} />}
            delay={300}
          >
            {author && (
              <>
                <span className="author-name">{author.username}</span>
                <span className="date">{formatDate.toLocaleDateString()}</span>
              </>
            )}
          </LoaderWrapper>
        </div>
        <h1 className="post-small-title">
          <Link to={`/posts/${post.slug}`}>{post.title}</Link>
        </h1>
        <ul className="post-tags">
          {post.tags.map((tag) => (
            <Tag key={tag} name={tag} />
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PostSmall;
