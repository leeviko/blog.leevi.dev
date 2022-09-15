import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import Home from "./components/Home";
import Navbar from "./components/Navbar";
import Archive from "./components/Archive";
import Post from "./features/posts/Post";
import Login from "./components/Login";
import NewPost from "./features/posts/NewPost";
import Profile from "./features/users/Profile";
import ProfilePosts from "./features/users/ProfilePosts";
import ProfileSettings from "./features/users/ProfileSettings";
import ProfileMain from "./features/users/ProfileMain";

import "./styles/main.css";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home limit={10} cursor="" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/archive" element={<Archive limit={10} cursor={null} />} />
        <Route path="/profile" element={<Profile />}>
          <Route path="" element={<ProfileMain />} />
          <Route path="posts" element={<ProfilePosts />} />
          <Route path="settings" element={<ProfileSettings />} />
        </Route>
        <Route path="/new-post" element={<NewPost />} />
        <Route path="/posts">
          <Route path=":postId" element={<Post />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
