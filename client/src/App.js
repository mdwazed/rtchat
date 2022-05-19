import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Join from "./components/Join";
import Chat from "./components/Chat";
import "./App.css";
import Call from "./components/Call";

function App() {
  return (
      <div className="App">
        <Router>
          <Routes>
            <Route exact path="/" element={<Join/>} />
            <Route path="/chat" element={<Chat/>} />
            <Route path="/call" element={<Call/>} />
          </Routes>
        </Router>
      </div>
  );
}

export default App;