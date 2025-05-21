import React, { useState, useContext } from "react";
import { login, demoLogin } from "../services/authService";
import { AuthContext } from "../services/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { loginUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(username, password);
      loginUser(data);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      const data = await demoLogin();
      loginUser(data);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Demo login failed");
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
          <h2>Sign In</h2>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleLogin} className="auth-form">
            <div className="form-field">
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
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
                placeholder="Password"
                required
                disabled={loading}
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="separator">
            <span>or</span>
          </div>

          <button
            onClick={handleDemoLogin}
            className="btn btn-outline btn-block"
            disabled={loading}
          >
            Try Demo Account
          </button>

          <div className="auth-links">
            <p>
              Don't have an account? <Link to="/register">Create Account</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
