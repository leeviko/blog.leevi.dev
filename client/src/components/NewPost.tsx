import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import useForm from "../hooks/useForm";
import Editor from "./Editor";
import Preview from "./Preview";

type Props = {};

const NewPost = (props: Props) => {
  const [activeTag, setActiveTag] = useState("");
  const [tags, setTags] = useState<Array<string>>([]);
  const [isPrivate, setIsPrivate] = useState(false);
  const [values, handleChange] = useForm({
    title: "",
    tags: "",
    content: "",
  });
  const [mode, setMode] = useState<"edit" | "preview">("edit");

  const isAuthenticated = useSelector((state: any) => state.users.isAuth);
  const navigate = useNavigate();
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleTagKeys = (e: any) => {
    if ((e.key === " " || e.key === "Enter") && activeTag.trim().length >= 3) {
      setTags((prev: Array<string>) => [...prev, activeTag]);
      setActiveTag("");
    } else if (e.key === "Backspace" && activeTag.length === 0) {
      setTags((prev) => prev.slice(0, -1));
    }
  };

  return (
    <div className="new-post">
      <div className="new-post-container">
        {isAuthenticated && (
          <>
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
              <div className="new-post-sidebar">
                <div className="sidebar-actions">
                  <button
                    onClick={() => setIsPrivate(!isPrivate)}
                    className="checkbox"
                  >
                    <div
                      className={`tick ${isPrivate ? "checked" : "unchecked"}`}
                    />
                    <span>Private</span>
                  </button>
                  <button className="btn publish-btn">Publish</button>
                  <button className="btn draft-btn">Save draft</button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default NewPost;
