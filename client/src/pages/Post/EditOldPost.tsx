import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { Navigate, useNavigate } from "react-router-dom";
import Dialog, { TDialogProps } from "../../components/Dialog";
import useForm from "../../hooks/useForm";
import useGetPost from "../../hooks/useGetPost";
import {
  deletePost,
  getPostsError,
  getPostsLoading,
  updatePost,
} from "../../store/slices/postSlice";
import { AppDispatch } from "../../store/store";
import { TPostResult } from "../../types";
import Editor from "./PostEditor";
import Preview from "./PostPreview";
import PostSidebar from "./PostSidebar";

type Props = {
  post: TPostResult | null;
  getPostErrors: any;
};

const EditOldPost = ({ slug }: { slug: string }) => {
  const { post, errors } = useGetPost(slug);

  return (
    <>
      {(post || errors) && (
        <EditOldPostWithData post={post} getPostErrors={errors} />
      )}
    </>
  );
};

const EditOldPostWithData = ({ post, getPostErrors }: Props) => {
  const dispatch = useDispatch<AppDispatch>();
  const [activeTag, setActiveTag] = useState("");
  const [tags, setTags] = useState<Array<string>>(post?.tags || []);
  const [isPrivate, setIsPrivate] = useState(post?.private || false);
  const [values, handleChange] = useForm({
    title: post?.title || "",
    content: post?.content || "",
  });
  const navigate = useNavigate();
  const [savePressed, setSavePressed] = useState(false);
  const [postDeleted, setPostDeleted] = useState(false);
  const errors = useSelector(getPostsError);
  const loading = useSelector(getPostsLoading);
  const [localErrors, setLocalErrors] = useState<string[]>([]);
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogContent, setDialogContent] = useState<TDialogProps>({
    title: "",
    description: "",
    onClose: undefined,
    onConfirm: undefined,
  });

  const handleTagKeys = (e: any) => {
    if ((e.key === " " || e.key === "Enter") && activeTag.trim().length >= 3) {
      setTags((prev: Array<string>) => [...prev, activeTag]);
      setActiveTag("");
    } else if (e.key === "Backspace" && activeTag.length === 0) {
      setTags((prev) => prev.slice(0, -1));
    }
  };

  const handleClose = () => {
    setOpenDialog(false);
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

  const handleSave = (e: any) => {
    setLocalErrors([]);
    if (!values.title || values.title.length <= 5) {
      setLocalErrors((prev: string[]) => [
        ...prev,
        "Title cannot less than 5 characters long",
      ]);
    }

    if (post?.status === "live" && !values.content) {
      setLocalErrors((prev: string[]) => [...prev, "Content cannot be empty"]);
    }

    if (tags && tags.length > 10) {
      setLocalErrors((prev: string[]) => [
        ...prev,
        "You can have up to 10 tags",
      ]);
    }
    setSavePressed(true);
  };

  useEffect(() => {
    const newValues = { ...values, tags, isPrivate };
    if (savePressed && localErrors.length === 0 && post) {
      dispatch(updatePost({ post, newValues }));
    }
    setSavePressed(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savePressed]);

  const handleDelete = () => {
    if (post) {
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
    <div className="edit-post old">
      {getPostErrors && <Navigate to="/" replace={true} />}
      {post && (
        <div className="edit-post-container">
          <div className="edit-post-top">
            <h1 className="section-title">new post - {mode}</h1>
            <div className="edit-post-buttons">
              <button
                onClick={() => setMode("edit")}
                className={`btn change-mode-btn ${
                  mode === "edit" ? "active" : "inactive"
                }`}
              >
                Edit
              </button>
              <button
                onClick={() => setMode("preview")}
                className={`btn change-mode-btn ${
                  mode === "preview" ? "active" : "inactive"
                }`}
              >
                Preview
              </button>
            </div>
          </div>
          <div className="edit-post-wrapper">
            {openDialog && (
              <Dialog
                title={dialogContent.title}
                description={dialogContent.description}
                onClose={dialogContent.onClose}
                onConfirm={dialogContent.onConfirm}
              />
            )}
            {mode === "edit" ? (
              <Editor
                values={values}
                handleChange={handleChange}
                activeTag={activeTag}
                setActiveTag={setActiveTag}
                tags={tags}
                handleTagKeys={handleTagKeys}
              />
            ) : (
              <Preview post={values} tags={tags} />
            )}
            <PostSidebar>
              <button
                onClick={() => setIsPrivate(!isPrivate)}
                className="checkbox"
              >
                <div
                  className={`tick ${isPrivate ? "checked" : "unchecked"}`}
                />
                <span>Private</span>
              </button>
              <button className="btn publish-btn" onClick={handleSave}>
                Update
              </button>
              {post.status === "live" ? (
                <div className="btn-section">
                  <button
                    className="btn unpublish-btn"
                    onClick={confirmUnpublish}
                  >
                    Unpublish
                  </button>
                  <button className="btn delete-btn" onClick={confirmDelete}>
                    Delete
                  </button>
                </div>
              ) : (
                <button className="btn publish-btn" onClick={handlePublish}>
                  Publish
                </button>
              )}
              {(localErrors.length || getPostErrors || errors) && (
                <ul className="post-errors">
                  {localErrors.length > 0 &&
                    localErrors.map((error) => <li key={error}>- {error}</li>)}
                  {getPostErrors && <li>- {getPostErrors.msg}</li>}
                  {typeof errors === "object" && errors && (
                    <li>- {errors.msg}</li>
                  )}
                </ul>
              )}
            </PostSidebar>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditOldPost;
