import React from "react";
import { useSelector } from "react-redux";
import { selectAllPosts } from "../../features/posts/postSlice";

import PostSmall from "./PostSmall";

type Props = {};

const PostList = (props: Props) => {
  const posts = useSelector(selectAllPosts);

  return (
    <div className="post-list">
      {posts && posts.map((post) => <PostSmall key={post.slug} post={post} />)}
    </div>
  );
};

export default PostList;
