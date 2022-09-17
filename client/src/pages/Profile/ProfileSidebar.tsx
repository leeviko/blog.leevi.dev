import React from "react";
import { Link, useLocation } from "react-router-dom";

type Props = {};

const ProfileSidebar = (props: Props) => {
  const location = useLocation().pathname;

  return (
    <div className="p-sidebar">
      <div className="p-sidebar-items">
        <button
          className={`sidebar-btn ${
            location === "/profile" ? "active" : "inactive"
          }`}
        >
          <Link to="">Profile</Link>
        </button>
        <button
          className={`sidebar-btn ${
            location.includes("posts") ? "active" : "inactive"
          }`}
        >
          <Link to="posts">Posts</Link>
        </button>
        <button
          className={`sidebar-btn ${
            location.includes("settings") ? "active" : "inactive"
          }`}
        >
          <Link to="settings">Settings</Link>
        </button>
      </div>
    </div>
  );
};

export default ProfileSidebar;
