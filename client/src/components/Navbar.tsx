import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-wrapper">
        <div className="nav-items">
          <div className="nav-item">
            <Link to="/">home</Link>
          </div>
          <div className="nav-item">
            <Link to="/archive">archive</Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
