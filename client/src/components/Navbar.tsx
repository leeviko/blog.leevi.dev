import React, { useEffect } from "react";
import Cookies from "js-cookie";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { isAuth, logout } from "../store/slices/authSlice";
import { AppDispatch, RootState } from "../store/store";

const Navbar = () => {
  const dispatch = useDispatch<AppDispatch>();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuth);
  const location = useLocation().pathname;

  useEffect(() => {
    if (isAuthenticated === null && Cookies.get("user_sid")) {
      if (
        !location.startsWith("/profile") ||
        !location.startsWith("/new-post")
      ) {
        dispatch(isAuth());
      }
    }
  }, [dispatch, isAuthenticated, location]);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <nav className="navbar">
      <div className="nav-items">
        <div className={`nav-item ${location === "/" ? "active" : "inactive"}`}>
          <Link to="/">Home</Link>
          <div className="line" />
        </div>
        <div
          className={`nav-item ${
            location === "/archive" ? "active" : "inactive"
          }`}
        >
          <Link to="/archive">Archive</Link>
          <div className="line" />
        </div>
        {isAuthenticated && (
          <>
            <div
              className={`nav-item ${
                location.startsWith("/profile") ? "active" : "inactive"
              }`}
            >
              <Link to="/profile">Profile</Link>
              <div className="line" />
            </div>
            <div className="nav-item">
              <Link to="/new-post">
                <button className="btn submit-btn">New</button>
              </Link>
            </div>
            <div className="nav-item" style={{ margin: "0" }}>
              <button className="btn submit-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
