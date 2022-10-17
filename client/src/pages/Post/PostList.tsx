import React from "react";
import Skeleton from "react-loading-skeleton";
import { useSelector } from "react-redux";
import LoaderWrapper from "../../components/LoaderWrapper";
import {
  getPostsError,
  getPostsLoading,
  selectAllPosts,
} from "../../store/slices/postSlice";

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
  const errors = useSelector(getPostsError);
  const loading = useSelector(getPostsLoading);

  return (
    <div className="post-list">
      {errors && (
        <p className="errors-section">
          {(typeof errors === "object" && errors.msg) || "Something went wrong"}
        </p>
      )}
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
