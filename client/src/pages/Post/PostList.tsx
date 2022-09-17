import React from "react";
import Skeleton from "react-loading-skeleton";
import { useSelector } from "react-redux";
import LoaderWrapper from "../../components/LoaderWrapper";
import { getPostsLoading, selectAllPosts } from "../../store/slices/postSlice";

import PostSmall from "./PostSmall";

const PostSkeleton = () => {
  return (
    <div style={{ marginTop: "1rem" }}>
      <Skeleton width={100} />
      <Skeleton height={25} />
      <Skeleton />
    </div>
  );
};

const PostList = () => {
  const posts = useSelector(selectAllPosts);
  const loading = useSelector(getPostsLoading);

  return (
    <div className="post-list">
      <LoaderWrapper
        loading={loading !== null && loading}
        loaderComponent={[...Array(8)].map((e, i) => (
          <PostSkeleton key={i} />
        ))}
        delay={500}
      >
        {posts &&
          !loading &&
          posts.map((post) => <PostSmall key={post.slug} post={post} />)}
      </LoaderWrapper>
    </div>
  );
};

export default PostList;
