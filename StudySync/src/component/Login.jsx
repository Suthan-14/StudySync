import React, { useState } from "react";
import "./Auth.css";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:9000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      console.log("Backend response:", data);

      if (!response.ok) {
        setError(data.message || data.error || "Invalid email or password.");
        return;
      }

      if (!data.token || !data.user) {
        setError("Token or user data not received from the server.");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("username", data.user.name || "");

      console.log("Stored user:", localStorage.getItem("user"));
      console.log("Stored username:", localStorage.getItem("username"));

      navigate("/dashboard", {
        state: {
          user: data.user,
        },
        replace: true,
      });
    } catch (error) {
      console.error("Login error:", error);
      setError("Unable to connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:9000/auth/google";
  };

  return (
    <div className="auth-page">
      <div className="auth-circle circle-1"></div>
      <div className="auth-circle circle-2"></div>

      <div className="auth-card">
      

        <h1>Welcome Back</h1>

        <p className="auth-subtitle">
          Login to continue to your account
        </p>

        <form onSubmit={handleSubmit}>
          <div className="input-box">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </div>

          <div className="input-box">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
            />
          </div>

          <div className="login-options">
            <label>
              <input type="checkbox" />
              Remember me
            </label>

            <a href="#" onClick={(e) => e.preventDefault()}>
              Forgot password?
            </a>
          </div>

          {error && (
            <p className="auth-error" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="auth-btn"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="auth-divider">
          <span>OR</span>
        </div>

        <button
          className="google-btn"
          type="button"
          onClick={handleGoogleLogin}
        >
          <span>G</span>
          Continue with Google
        </button>

        <p className="switch-auth">
          Don't have an account? <a href="/">Sign Up</a>
        </p>
      </div>
    </div>
  );
}

export default Login;