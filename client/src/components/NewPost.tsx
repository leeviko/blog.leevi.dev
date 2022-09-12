import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import useForm from "../hooks/useForm";
import Editor from "./Editor";

type Props = {};

const NewPost = (props: Props) => {
  const [values, handleChange] = useForm({ title: "", tags: "", body: "" });

  const isAuthenticated = useSelector((state: any) => state.users.isAuth);
  const navigate = useNavigate();
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated]);

  return (
    <div className="new-post">
      {isAuthenticated && (
        <div className="new-post-container">
          <div className="new-post-wrapper">
            <div className="new-post-top">
              <h1 className="section-title">new post</h1>
              <div className="new-post-buttons">
                <button className="btn submit-btn">Edit</button>
                <button className="btn submit-btn">Preview</button>
              </div>
            </div>
            <Editor values={values} handleChange={handleChange} />
          </div>
        </div>
      )}
    </div>
  );
};

export default NewPost;
