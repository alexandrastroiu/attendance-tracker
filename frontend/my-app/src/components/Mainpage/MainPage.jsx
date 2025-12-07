import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Main.css";
import Picture from '../assets/flat-university-concept.png';

export default function Main() {
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add("home-body");
    return () => document.body.classList.remove("home-body");
  }, []);

  return (
    <div className="home-wrapper">
      <div className="home-card">

        <img
          src={Picture}
          alt="university"
          className="home-image"
        />

        <h2 className="home-dept-text">Department of Computer Science and Engineering</h2>

        <h1 className="home-title">Attendance Tracker</h1>
        <div className="home-underline"></div>

        <p className="home-description">
          A modern attendance platform that simplifies attendance tracking for both students and educators.
        </p>

        <button className="home-login-btn" onClick={() => navigate("/login")}>
          Proceed to Login →
        </button>
      </div>
    </div>
  );
}
