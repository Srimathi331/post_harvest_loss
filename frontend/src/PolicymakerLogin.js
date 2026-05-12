import React, { useState } from "react";
import { FaLandmark, FaArrowLeft, FaLock, FaUser, FaSignInAlt } from "react-icons/fa";
import { validatePolicymakerCredentials } from "./config/auth";

function PolicymakerLogin({ onLogin, onBackToLanding }) {
  const [credentials, setCredentials] = useState({
    username: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    
    if (!credentials.username.trim() || !credentials.password.trim()) {
      setError("Username and password are required");
      return;
    }

    setLoading(true);
    
    try {
      // Always validate locally using config/auth.js
      const user = validatePolicymakerCredentials(
        credentials.username,
        credentials.password
      );

      if (user) {
        onLogin({ ...user, name: "Policymaker" });
      } else {
        setError("Invalid credentials. Please try again.");
      }
    } catch (err) {
      setError("Login failed. Please try again.");
      console.error("Policymaker login failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  const colors = {
    darkOlive: "#41431B",
    sage: "#AEB784",
    beige: "#E3DBBB",
    cream: "#F8F3E1"
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundImage: "url('https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=1600&q=80')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      position: 'relative'
    }}>
      <div style={{
        position: 'absolute',
        inset: 0,
        background: `linear-gradient(135deg, ${colors.darkOlive}ee 0%, ${colors.sage}ee 100%)`
      }} />
      <div style={{
        background: colors.cream,
        padding: '3rem',
        borderRadius: '20px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
        width: '100%',
        maxWidth: '400px',
        position: 'relative',
        zIndex: 1
      }}>
        <button
          onClick={onBackToLanding}
          style={{
            background: 'none',
            border: 'none',
            color: colors.darkOlive,
            fontSize: '16px',
            cursor: 'pointer',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: '600'
          }}
        >
          <FaArrowLeft /> Back to Home
        </button>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '60px',
            height: '60px',
            background: `linear-gradient(135deg, ${colors.darkOlive}, ${colors.sage})`,
            borderRadius: '50%',
            margin: '0 auto 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: colors.cream,
            fontSize: '24px'
          }}>
            <FaLandmark />
          </div>
          <h2 style={{
            color: colors.darkOlive,
            fontSize: '2rem',
            fontWeight: '700',
            marginBottom: '0.5rem',
            fontFamily: 'Georgia, serif'
          }}>
            Policymaker Access
          </h2>
          <p style={{
            color: '#666',
            fontSize: '14px'
          }}>
            Authorized Personnel Only
          </p>
        </div>

        {error && (
          <div style={{
            background: '#fee',
            color: '#c33',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '1rem',
            textAlign: 'center',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{
            display: 'block',
            marginBottom: '0.5rem',
            color: colors.darkOlive,
            fontWeight: '600',
            fontSize: '14px'
          }}>
            <FaUser style={{ marginRight: '8px', color: colors.sage }} /> Username
          </label>
          <input
            type="text"
            placeholder="Enter your username"
            value={credentials.username}
            onChange={(e) => setCredentials({...credentials, username: e.target.value})}
            onKeyPress={handleKeyPress}
            style={{
              width: '100%',
              padding: '1rem',
              border: `2px solid ${colors.beige}`,
              borderRadius: '12px',
              fontSize: '16px',
              outline: 'none',
              transition: 'all 0.3s',
              background: colors.cream
            }}
            onFocus={(e) => {
              e.target.style.borderColor = colors.darkOlive;
              e.target.style.boxShadow = `0 0 0 3px ${colors.sage}40`;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = colors.beige;
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{
            display: 'block',
            marginBottom: '0.5rem',
            color: colors.darkOlive,
            fontWeight: '600',
            fontSize: '14px'
          }}>
            <FaLock style={{ marginRight: '8px', color: colors.sage }} /> Password
          </label>
          <input
            type="password"
            placeholder="Enter your password"
            value={credentials.password}
            onChange={(e) => setCredentials({...credentials, password: e.target.value})}
            onKeyPress={handleKeyPress}
            style={{
              width: '100%',
              padding: '1rem',
              border: `2px solid ${colors.beige}`,
              borderRadius: '12px',
              fontSize: '16px',
              outline: 'none',
              transition: 'all 0.3s',
              background: colors.cream
            }}
            onFocus={(e) => {
              e.target.style.borderColor = colors.darkOlive;
              e.target.style.boxShadow = `0 0 0 3px ${colors.sage}40`;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = colors.beige;
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: '100%',
            padding: '1rem',
            background: loading ? '#ccc' : `linear-gradient(135deg, ${colors.darkOlive}, ${colors.sage})`,
            color: colors.cream,
            border: 'none',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: loading ? 'none' : '0 8px 20px rgba(65, 67, 27, 0.3)'
          }}
        >
          {loading ? 'Logging in...' : <><FaSignInAlt /> Login</>}
        </button>
      </div>
    </div>
  );
}

export default PolicymakerLogin;
