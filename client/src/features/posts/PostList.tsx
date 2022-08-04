import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPosts, selectAllPosts } from "../../features/posts/postSlice";
import { AppDispatch } from "../../store";

import PostSmall from "./PostSmall";

type Props = {};

const PostList = (props: Props) => {
  const dispatch = useDispatch<AppDispatch>();
  const posts = useSelector(selectAllPosts);

  useEffect(() => {
    dispatch(fetchPosts({ limit: 10, cursor: "" }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="posts-page page">
      <div className="post-list">
        {posts &&
          posts.map((post) => <PostSmall key={post.slug} post={post} />)}
      </div>
    </div>
  );
};

export default PostList;
