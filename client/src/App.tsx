import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import "./styles/main.css";

import Home from "./components/Home";
import Navbar from "./components/Navbar";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;
