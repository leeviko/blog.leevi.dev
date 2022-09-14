import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";
import Cookies from "js-cookie";

import "./styles/main.css";

import Home from "./components/Home";
import Navbar from "./components/Navbar";
import Archive from "./components/Archive";
import Post from "./features/posts/Post";
import Login from "./components/Login";
import Profile from "./components/Profile";
import NewPost from "./components/NewPost";
import { useDispatch } from "react-redux";
import { isAuth } from "./features/users/userSlice";
import { useSelector } from "react-redux";
import { AppDispatch, RootState } from "./store";

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const isAuthenticated = useSelector((state: RootState) => state.users.isAuth);

  useEffect(() => {
    if (!isAuthenticated && Cookies.get("user_sid")) {
      dispatch(isAuth());
    }
  }, [dispatch, isAuthenticated]);

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home limit={10} cursor="" />} />
        <Route
          path="/login"
          element={
            isAuthenticated != null && isAuthenticated ? (
              <Navigate to="/" replace={true} />
            ) : (
              <Login />
            )
          }
        />
        <Route path="/archive" element={<Archive limit={10} cursor={null} />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/new-post" element={<NewPost />} />
        <Route path="/posts">
          <Route path=":postId" element={<Post />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
