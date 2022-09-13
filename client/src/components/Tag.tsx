import React, { useEffect, useState } from "react";

type Props = {
  name: string;
  postType: "small" | "full";
};

const hexToRgbA = (hex: any, alpha = 1) => {
  if (!hex) {
    return "unset";
  }
  const [r, g, b] = hex.match(/\w\w/g).map((x: any) => parseInt(x, 16));
  return `rgba(${r},${g},${b},${alpha})`;
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
        setColor("#689d6a");
        break;
      case "Gaming":
        setColor("#98971a");
        break;
      case "Review":
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
              backgroundColor: hexToRgbA(color, 0.5),
              border: `1px solid ${color}`,
            }
          : { backgroundColor: "unset" }
      }
      className="post-tag"
    >
      <span style={{ color }}>#</span>
      {name}
    </li>
  );
};

export default Tag;
