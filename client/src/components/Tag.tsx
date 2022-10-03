import React from "react";

type Props = {
  name: string;
  postType: "small" | "full";
};

const Tag = ({ name, postType }: Props) => {
  return (
    <li
      style={
        postType === "full"
          ? {
              backgroundColor: "var(--t-default)",
              border: `1px solid var(--t-default)`,
              color: "var(--white)",
            }
          : { backgroundColor: "unset", color: "black" }
      }
      className="post-tag"
    >
      <span
        style={
          postType === "full"
            ? { color: "rgba(255, 255, 255, 0.5)" }
            : { color: "var(--t-default)" }
        }
      >
        #
      </span>
      {name}
    </li>
  );
};

export default Tag;
