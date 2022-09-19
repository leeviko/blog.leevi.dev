import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import useGetPost from "../../hooks/useGetPost";
import { TPostResult } from "../../types";

import "../../styles/markdown.css";
import PostHeader from "./PostHeader";
import PostBody from "./PostBody";
import PostSidebar from "./PostSidebar";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";

const Post = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const post: TPostResult | null = useGetPost(postId);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuth);
  const user = useSelector((state: RootState) => state.auth.user);

  const handleEdit = () => {
    navigate("edit");
  };
  const handleUnpublish = () => {};
  const handleDelete = () => {};

  return (
    <article className="post-container">
      <div className="post">
        <div className="post-wrapper">
          <div className="post-content">
            <PostHeader post={post} type="full" />
            <PostBody postContent={post?.content || ""} />
          </div>
          {post &&
            user &&
            isAuthenticated &&
            (user.admin || user.id === post.authorid) && (
              <PostSidebar>
                <button className="btn edit-btn" onClick={handleEdit}>
                  Edit
                </button>
                <button className="btn unpublish-btn" onClick={handleUnpublish}>
                  Unpublish
                </button>
                <button className="btn delete-btn" onClick={handleDelete}>
                  Delete
                </button>
              </PostSidebar>
            )}
        </div>
      </div>
    </article>
  );
};

export default Post;
