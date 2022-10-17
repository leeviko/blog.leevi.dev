import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import useForm from "../../hooks/useForm";
import {
  getPostsError,
  getPostsLoading,
  savePost,
  selectPostById,
} from "../../store/slices/postSlice";
import { AppDispatch, RootState, store } from "../../store/store";
import Editor from "./PostEditor";
import Preview from "./PostPreview";
import PostSidebar from "./PostSidebar";

type Props = {};

const EditNewPost = (props: Props) => {
  const dispatch = useDispatch<AppDispatch>();
  const [activeTag, setActiveTag] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isPrivate, setIsPrivate] = useState(false);
  const [status, setStatus] = useState("");
  const [values, handleChange] = useForm({
    title: "",
    content: "",
  });
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const [localErrors, setLocalErrors] = useState<string[]>([]);
  const errors = useSelector(getPostsError);
  const loading = useSelector(getPostsLoading);
  const [savePressed, setSavePressed] = useState(false);
  const [postSubmitted, setPostSubmitted] = useState(false);
  const navigate = useNavigate();
  const posts = useSelector((state: RootState) => state.posts);

  const handleTagKeys = (e: any) => {
    if ((e.key === " " || e.key === "Enter") && activeTag.trim().length >= 3) {
      setTags((prev: Array<string>) => [...prev, activeTag]);
      setActiveTag("");
    } else if (e.key === "Backspace" && activeTag.length === 0) {
      setTags((prev) => prev.slice(0, -1));
    }
  };

  const handleSave = (e: any) => {
    const currStatus = e.target.name;
    setStatus(currStatus);
    setLocalErrors([]);
    if (!values.title || values.title.length <= 5) {
      setLocalErrors((prev: string[]) => [
        ...prev,
        "Title cannot less than 5 characters long",
      ]);
    }

    if (currStatus === "live" && !values.content) {
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
    if (savePressed && localErrors.length === 0) {
      setPostSubmitted(true);
      dispatch(savePost({ ...values, tags, status, isPrivate }));
    }
    setSavePressed(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savePressed]);

  useEffect(() => {
    if (postSubmitted && !loading && !errors) {
      const getNewPost = selectPostById(
        store.getState(),
        store.getState().posts.ids[posts.ids.length - 1]
      );
      navigate(`/posts/${getNewPost?.slug}`);
    }
  }, [postSubmitted, loading, errors, posts.ids.length, navigate]);

  return (
    <div className="edit-post">
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
              <div className={`tick ${isPrivate ? "checked" : "unchecked"}`} />
              <span>Private</span>
            </button>
            <button
              name="live"
              className="btn publish-btn"
              onClick={handleSave}
            >
              Publish
            </button>
            <button name="draft" className="btn draft-btn" onClick={handleSave}>
              Save draft
            </button>
            <ul className="post-errors">
              {localErrors &&
                localErrors.map((error) => <li key={error}>- {error}</li>)}
              {errors && <li>- {typeof errors === "object" && errors.msg}</li>}
            </ul>
          </PostSidebar>
        </div>
      </div>
    </div>
  );
};

export default EditNewPost;
