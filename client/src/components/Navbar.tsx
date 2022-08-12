import React from "react";
import { Link } from "react-router-dom";

import HeaderLogo from "../assets/images/header-logo.svg";

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-wrapper">
        <div className="navbar-logo">
          <img alt="" src={HeaderLogo} />
        </div>
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
