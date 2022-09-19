import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../store/store";
import { savePost } from "../../store/slices/postSlice";
import withAuth from "../../components/WithAuth";
import useForm from "../../hooks/useForm";
import Editor from "./PostEditor";
import Preview from "./PostPreview";
import PostSidebar from "./PostSidebar";

type Props = {};

const NewPost = (props: Props) => {
  const dispatch = useDispatch<AppDispatch>();
  const [activeTag, setActiveTag] = useState("");
  const [tags, setTags] = useState<Array<string>>([]);
  const [isPrivate, setIsPrivate] = useState(false);
  const [values, handleChange] = useForm({
    title: "",
    content: "",
  });
  const [mode, setMode] = useState<"edit" | "preview">("edit");

  const handleTagKeys = (e: any) => {
    if ((e.key === " " || e.key === "Enter") && activeTag.trim().length >= 3) {
      setTags((prev: Array<string>) => [...prev, activeTag]);
      setActiveTag("");
    } else if (e.key === "Backspace" && activeTag.length === 0) {
      setTags((prev) => prev.slice(0, -1));
    }
  };

  const handleSave = (e: any) => {
    const status = e.target.name;
    dispatch(savePost({ ...values, tags, status, isPrivate }));
  };

  return (
    <div className="new-post">
      <div className="new-post-container">
        <div className="new-post-top">
          <h1 className="section-title">new post - {mode}</h1>
          <div className="new-post-buttons">
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
        <div className="new-post-wrapper">
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
          </PostSidebar>
        </div>
      </div>
    </div>
  );
};

export default withAuth(NewPost);
