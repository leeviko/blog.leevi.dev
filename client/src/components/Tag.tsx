import React, { useEffect, useState } from "react";

type Props = {
  name: string;
  postType: "small" | "full";
};

const Tag = ({ name, postType }: Props) => {
  const [color, setColor] = useState("");

  useEffect(() => {
    switch (name.trim()) {
      case "Programming":
      case "Technology":
        setColor("#458871");
        break;
      case "Tutorial":
        setColor("#88454a");
        break;
      case "Habits":
        setColor("#88454a");
        break;
      case "Politics":
        setColor("#885d45");
        break;
      case "Entertainment":
        break;
      case "Log":
        setColor("#a97615");
        break;
      case "Devlog":
      case "Drawinglog":
      case "Writinglog":
        setColor("#d79921");
        break;
      case "Art":
      case "Music":
        setColor("#c03933");
        break;
      case "Selfcare":
        setColor("#e24d46");
        break;
      case "Science":
      case "Space":
        setColor("#454788");
        break;
      case "Books":
        setColor("#658845");
        break;
      case "Reading":
      case "ASOIAF":
        setColor("#689d6a");
        break;
      case "Gaming":
      case "Game-of-Thrones":
        setColor("#98971a");
        break;
      case "Review":
      case "Book-Review":
        setColor("#888745");
        break;
      case "Life":
        setColor("#c03933");
        break;
      case "Anime":
        setColor("#88456f");
        break;
      case "Running":
        setColor("#a95056");
        break;
      case "Society":
        setColor("#886745");
        break;
      case "JavaScript":
      case "Python":
      case "React":
      case "Node":
      case "Express":
        setColor("#377c65");
        break;
      default:
        setColor("#458588");
        break;
    }
  }, [name]);

  return (
    <li
      style={
        postType === "full"
          ? {
              backgroundColor: color,
              border: `1px solid ${color}`,
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
            : { color }
        }
      >
        #
      </span>
      {name}
    </li>
  );
};

export default Tag;
