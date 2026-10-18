import React, { useState } from "react";
import "./Auth.css";
import { useNavigate } from "react-router";


function Signup() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
    
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    console.log("Signup Data:", formData);

  
    const response = await fetch("http://localhost:9000/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if(response.ok){
      navigate('/login');
    }
  };

  return (
    <div className="auth-page">

      <div className="auth-circle circle-1"></div>
      <div className="auth-circle circle-2"></div>

      <div className="auth-card">



        <h1>Create Account</h1>

        <p className="auth-subtitle">
          Create your account and get started
        </p>

        <form onSubmit={handleSubmit}>

          <div className="input-box">
            <label>Full Name</label>

            <input
              type="text"
              name="name"
              placeholder="Enter your name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-box">
            <label>Email</label>

            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-box">
            <label>Password</label>

            <input
              type="password"
              name="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-box">
            <label>Confirm Password</label>

            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="auth-btn" onClick={(e)=>handleSubmit(e)}>
            Create Account
          </button>

        </form>

        <div className="auth-divider">
          <span>OR</span>
        </div>

        <button
          type="button"
          className="google-btn"
          onClick={() => {
            window.location.href = "http://localhost:9000/auth/google";
          }}
        >
          <span>G</span>
          Continue with Google
        </button>
        <p className="switch-auth">
          Already have an account?
          <a href="/login"> Login</a>
        </p>

      </div>
    </div>
  );
}

export default Signup;