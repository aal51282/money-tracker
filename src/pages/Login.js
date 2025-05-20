import React, { useState, useContext } from "react";
import { login, demoLogin } from "../services/authService";
import { AuthContext } from "../services/AuthContext";
import { useNavigate } from "react-router-dom";
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
    <div className="auth-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          required
          disabled={loading}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          disabled={loading}
        />
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={loading}>
          Login
        </button>
      </form>
      <div className="demo-login">
        <button
          onClick={handleDemoLogin}
          disabled={loading}
          className="demo-button"
        >
          Use Demo Account
        </button>
      </div>
      <p>
        Don't have an account? <a href="/register">Register here</a>
      </p>
    </div>
  );
};

export default Login;
