import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";
import Cookies from "js-cookie";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const sendData = async (e) => {
    e.preventDefault(); // Prevents page reload

    try {
      const res = await fetch("http://localhost:5000/login", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  credentials: "include", // ✅ tells browser to accept & store cookies
  body: JSON.stringify({
    email,
    password,
  }),
});


      const data = await res.json();
      console.log("Login Response:", data);
      if (res.ok && data.token) {
      // ✅ Store login info in localStorage
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("userEmail", email); // optional
      localStorage.setItem("isLoggedIn", "true");

      alert("Login Successful!");
      navigate("/");
    } else {
      alert(data.message || "Login Failed!");
    }

    } catch (error) {
      console.error("Error:", error);
      alert("Login Failed!");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Login to TruthShield</h2>
        <form className="login-form" onSubmit={sendData}>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="login-button">
            Login
          </button>
          <div className="forgot-password">
            <a href="#">Forgot password?</a>
          </div>
        </form>
        <div className="signup-link">
          <p>Don't have an account? <a href="/signup">Sign Up</a></p>
        </div>
      </div>
    </div>
  );
}
