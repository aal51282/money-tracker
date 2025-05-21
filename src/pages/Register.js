import React, { useState, useContext } from "react";
import { register } from "../services/authService";
import { AuthContext } from "../services/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import "./Register.css";

const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { loginUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await register(username, password);
      loginUser(data);
      navigate("/");
    } catch (err) {
      console.error("Registration error:", err);
      console.error("Error response:", err.response);
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-card">
        <div className="auth-branding">
          <div className="logo">
            <i className="fas fa-wallet"></i>
          </div>
          <h1>Money Tracker</h1>
          <p>Track your finances with ease</p>
        </div>

        <div className="auth-form-container">
          <h2>Create Account</h2>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleRegister} className="auth-form">
            <div className="form-field">
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
                required
                disabled={loading}
                autoComplete="username"
              />
            </div>

            <div className="form-field">
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                required
                disabled={loading}
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <div className="auth-links">
            <p>
              Already have an account? <Link to="/login">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
