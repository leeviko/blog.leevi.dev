import React from "react";
import { useSelector } from "react-redux";
import LoaderWrapper from "../../components/LoaderWrapper";
import {
  getPostsError,
  getPostsLoading,
  selectAllPosts,
} from "../../store/slices/postSlice";

import PostSmall, { PostSkeleton } from "./PostSmall";

import ErrorIcon from "../../assets/images/error.svg";

const PostList = () => {
  const posts = useSelector(selectAllPosts);
  const errors = useSelector(getPostsError);
  const loading = useSelector(getPostsLoading);

  return (
    <div className="post-list">
      {errors && (
        <p className="note error">
          <img alt="error" src={ErrorIcon} />
          <span>
            {(typeof errors === "object" && errors.msg) ||
              "Something went wrong"}
          </span>
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
