import React, { useEffect, useState } from "react";
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
import {
  deletePost,
  getPostsError,
  getPostsLoading,
  updatePost,
} from "../../store/slices/postSlice";
import Dialog, { TDialogProps } from "../../components/Dialog";

const Post = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { slug } = useParams();
  const navigate = useNavigate();
  const { post }: { post: TPostResult | null; errors: any } = useGetPost(slug);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuth);
  const user = useSelector((state: RootState) => state.auth.user);
  const [postDeleted, setPostDeleted] = useState(false);
  const loading = useSelector(getPostsLoading);
  const errors = useSelector(getPostsError);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogContent, setDialogContent] = useState<TDialogProps>({
    title: "",
    description: "",
    onClose: undefined,
    onConfirm: undefined,
  });

  useEffect(() => {
    if (post) {
      document.title = `Blog - ${post?.title}`;
    }
  }, [post]);

  // TODO: Move these to different component. (PostSidebar)
  const handleEdit = () => {
    navigate("edit");
  };

  const handlePublish = () => {
    if (post) {
      dispatch(updatePost({ post, newValues: { status: "live" } }));
    }
  };

  const handleUnpublish = () => {
    if (post) {
      dispatch(updatePost({ post, newValues: { status: "draft" } }));
    }
    setOpenDialog(false);
  };

  const confirmUnpublish = () => {
    setDialogContent({
      title: "Unpublish",
      description: "Are you sure you want to unpublish this post?",
      onClose: handleClose,
      onConfirm: handleUnpublish,
    });
    setOpenDialog(true);
  };

  const handleClose = () => {
    setOpenDialog(false);
  };
  const handleDelete = () => {
    if (post && user && (user.id === post.authorid || user.admin)) {
      dispatch(deletePost(post.postid));
      setPostDeleted(true);
    }
    setOpenDialog(false);
  };

  const confirmDelete = () => {
    setDialogContent({
      title: "Delete post",
      description: "Are you sure you want to delete this post?",
      onClose: handleClose,
      onConfirm: handleDelete,
    });
    setOpenDialog(true);
  };

  useEffect(() => {
    if (postDeleted && !loading && !errors) {
      navigate("/");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postDeleted, errors, loading]);

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
              <>
                {openDialog && (
                  <Dialog
                    title={dialogContent.title}
                    description={dialogContent.description}
                    onClose={dialogContent.onClose}
                    onConfirm={dialogContent.onConfirm}
                  />
                )}
                <PostSidebar>
                  <button className="btn edit-btn" onClick={handleEdit}>
                    Edit
                  </button>
                  {post.status === "draft" && (
                    <button className="btn publish-btn" onClick={handlePublish}>
                      Publish
                    </button>
                  )}
                  <div className="btn-section">
                    {post.status === "live" && (
                      <button
                        className="btn unpublish-btn"
                        onClick={confirmUnpublish}
                      >
                        Unpublish
                      </button>
                    )}
                    <button className="btn delete-btn" onClick={confirmDelete}>
                      Delete
                    </button>
                  </div>
                </PostSidebar>
              </>
            )}
        </div>
      </div>
    </article>
  );
};

export default Post;
