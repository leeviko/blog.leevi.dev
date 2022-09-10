import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import "./styles/main.css";

import Home from "./components/Home";
import Navbar from "./components/Navbar";
import Archive from "./components/Archive";
import Post from "./features/posts/Post";
import Login from "./components/Login";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home limit={10} cursor="" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/archive" element={<Archive limit={10} cursor="" />} />
        <Route path="/posts">
          <Route path=":postId" element={<Post />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
