import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useGetPost from "../../hooks/useGetPost";
import { TPostResult } from "../../types";

import "../../styles/markdown.css";
import PostHeader from "./PostHeader";
import PostBody from "./PostBody";
import PostSidebar from "./PostSidebar";
import { useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import { useDispatch } from "react-redux";
import { deletePost } from "../../store/slices/postSlice";
import Dialog, { TDialog } from "../../components/Dialog";

const Post = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { postId } = useParams();
  const navigate = useNavigate();
  const post: TPostResult | null = useGetPost(postId);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuth);
  const user = useSelector((state: RootState) => state.auth.user);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogContent, setDialogContent] = useState<TDialog>({
    title: "",
    description: "",
  });

  const handleEdit = () => {
    navigate("edit");
  };
  const handleUnpublish = () => {};

  const handleClose = () => {
    setOpenDialog(false);
  };
  const handleDelete = () => {
    if (post && (user?.id === post?.authorid || user?.admin)) {
      dispatch(deletePost(post.postid));
    }
    setOpenDialog(false);
  };

  const confirmDelete = () => {
    setDialogContent({
      title: "Delete post",
      description: "Are you sure you want to delete this post?",
    });
    setOpenDialog(true);
  };

  return (
    <article className="post-container">
      {openDialog && (
        <Dialog
          title={dialogContent.title}
          description={dialogContent.description}
          onClose={handleClose}
          onConfirm={handleDelete}
        />
      )}
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
                <button className="btn delete-btn" onClick={confirmDelete}>
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
