import React from "react";
import Skeleton from "react-loading-skeleton";
import { Link } from "react-router-dom";
import LoaderWrapper from "../../components/LoaderWrapper";
import Tag from "../../components/Tag";
import useGetAuthor from "../../hooks/useGetAuthor";
import { AuthorType, PostType } from "../../types";

type Props = {
  post: PostType;
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
  const author: AuthorType | any = useGetAuthor(post.authorid);

  const formatDate = new Date(post.created_at);

  return (
    <div className="post-small">
      <div className="post-small-wrapper">
        <div className="post-small-author p-author">
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
