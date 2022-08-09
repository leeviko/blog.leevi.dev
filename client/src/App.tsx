import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import "./styles/main.css";

import Home from "./components/Home";
import Navbar from "./components/Navbar";
import Archive from "./components/Archive";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home limit={10} cursor="" />} />
        <Route path="/archive" element={<Archive limit={10} cursor="" />} />
      </Routes>
    </Router>
  );
}

export default App;
