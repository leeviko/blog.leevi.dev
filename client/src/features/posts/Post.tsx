import React from "react";
import { useParams } from "react-router-dom";
import useGetPost from "../../hooks/useGetPost";

const Post = () => {
  const { postId } = useParams();
  const postData: any = useGetPost(postId);

  return <div className="post">{postData && postData[0].title}</div>;
};

export default Post;
