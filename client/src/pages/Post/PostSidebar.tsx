import React, { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

const PostSidebar = ({ children }: Props) => {
  return (
    <div className="post-sidebar">
      <div className="post-sidebar-actions">{children}</div>
    </div>
  );
};

export default PostSidebar;
