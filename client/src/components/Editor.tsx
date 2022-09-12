import React from "react";

type TEditorProps = {
  values: {
    title: string;
    tags: string;
    body: string;
  };
  handleChange: () => void;
};

const Editor = ({ values, handleChange }: TEditorProps) => {
  return (
    <div className="editor">
      <div className="editor-top">
        <input
          className="post-title-input"
          type="text"
          name="title"
          placeholder="Post title..."
          value={values.title}
          onChange={handleChange}
        />
        <input
          className="post-tags-input"
          type="text"
          name="tags"
          placeholder="Add tags..."
          value={values.tags}
          onChange={handleChange}
        />
      </div>
      <div className="editor-toolbar"></div>
      <div className="editor-content">
        <textarea
          className="post-content"
          name="body"
          placeholder="Post content..."
          value={values.body}
          onChange={handleChange}
        />
      </div>
    </div>
  );
};

export default Editor;
