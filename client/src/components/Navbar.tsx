import React, { useEffect } from "react";
import Cookies from "js-cookie";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { isAuth } from "../features/users/userSlice";
import { AppDispatch, RootState } from "../store";

const Navbar = () => {
  const dispatch = useDispatch<AppDispatch>();
  const isAuthenticated = useSelector((state: RootState) => state.users.isAuth);
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

  return (
    <nav className="navbar">
      <div className="navbar-wrapper">
        <div className="nav-items">
          <div
            className={`nav-item ${location === "/" ? "active" : "inactive"}`}
          >
            <Link to="/">home</Link>
          </div>
          <div
            className={`nav-item ${
              location === "/archive" ? "active" : "inactive"
            }`}
          >
            <Link to="/archive">archive</Link>
          </div>
          {isAuthenticated && (
            <>
              <div
                className={`nav-item ${
                  location.startsWith("/profile") ? "active" : "inactive"
                }`}
              >
                <Link to="/profile">profile</Link>
              </div>
              <div className="nav-item">
                <Link to="/new-post">
                  <button className="btn submit-btn">New</button>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
