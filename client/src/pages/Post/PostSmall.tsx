import React from "react";
import Skeleton from "react-loading-skeleton";
import { TPostResult } from "../../types";
import PostHeader from "./PostHeader";

type Props = {
  post: TPostResult;
};

export const PostSkeleton = () => {
  return (
    <div style={{ marginTop: "1rem" }}>
      <Skeleton highlightColor="#1f202b" baseColor="#181921" width={100} />
      <Skeleton highlightColor="#1f202b" baseColor="#181921" height={25} />
      <Skeleton highlightColor="#1f202b" baseColor="#181921" />
    </div>
  );
};

const PostSmall = ({ post }: Props) => {
  return (
    <div className="post-small">
      <div className="post-small-wrapper">
        <PostHeader post={post} type="small" />
      </div>
    </div>
  );
};

export default PostSmall;
