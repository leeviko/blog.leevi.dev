import React from "react";
import Tag from "./Tag";

type TEditorProps = {
  values: {
    title: string;
    content: string;
  };
  activeTag: string;
  setActiveTag: (value: string) => void;
  handleChange: () => void;
  tags: Array<string>;
  handleTagKeys: (e: any) => void;
};

const Editor = ({
  values,
  handleChange,
  activeTag,
  setActiveTag,
  tags,
  handleTagKeys,
}: TEditorProps) => {
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
        <ul className="post-tags p-tags">
          {tags.map((tag, i) => (
            <Tag name={tag} key={`${tag}-${i}`} postType="full" />
          ))}
          <input
            className="post-tags-input post-tag"
            type="text"
            name="tags"
            placeholder="Add tags..."
            value={activeTag}
            onKeyDown={handleTagKeys}
            onChange={(e) => setActiveTag(e.target.value.trim())}
          />
        </ul>
      </div>
      <div className="editor-toolbar"></div>
      <div className="editor-content">
        <textarea
          className="post-content"
          name="content"
          placeholder="Post content..."
          value={values.content}
          onChange={handleChange}
        />
      </div>
    </div>
  );
};

export default Editor;
