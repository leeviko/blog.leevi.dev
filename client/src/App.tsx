import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import Home from "./pages/Home/Home";
import Navbar from "./components/Navbar";
import Archive from "./pages/Archive/Archive";
import Post from "./pages/Post/Post";
import Login from "./pages/Login/Login";
import EditPost from "./pages/Post/EditPost";
import Profile from "./pages/Profile/Profile";
import ProfilePosts from "./pages/Profile/ProfilePosts";
import ProfileSettings from "./pages/Profile/ProfileSettings";
import ProfileMain from "./pages/Profile/ProfileMain";

import "./styles/main.css";
import ErrorBoundary from "./components/ErrorBoundary";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <Router>
      <ErrorBoundary>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home limit={10} cursor="" />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/archive"
            element={<Archive limit={10} cursor={null} />}
          />
          <Route path="/profile" element={<Profile />}>
            <Route path="" element={<ProfileMain />} />
            <Route path="posts" element={<ProfilePosts />} />
            <Route path="settings" element={<ProfileSettings />} />
          </Route>
          <Route path="/new-post" element={<EditPost />} />
          <Route path="/posts">
            <Route path=":slug">
              <Route path="" element={<Post />} />
              <Route path="edit" element={<EditPost />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </ErrorBoundary>
    </Router>
  );
}

export default App;
