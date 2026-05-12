import React, { useState } from "react";
import axios from "axios";
import { FaSeedling, FaMobileAlt, FaLock, FaArrowLeft } from "react-icons/fa";

function FarmerLogin({ onLogin, onBackToLanding, onShowRegister }) {
  const [mobileNumber, setMobileNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!mobileNumber.trim()) {
      setError("Mobile number is required");
      return;
    }

    if (!/^\d{10}$/.test(mobileNumber)) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      const res = await axios.get(`http://localhost:5000/farmer/mobile/${mobileNumber}`);
      if (res.data) {
        onLogin(res.data);
      } else {
        setError("No account found with this mobile number. Please register first.");
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setError("No account found with this mobile number. Please register first.");
      } else {
        setError("Login failed. Please try again.");
      }
      console.error("Mobile login failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #41431B 0%, #AEB784 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "1rem",
      position: "relative",
      overflow: "hidden"
    }}>
      {/* Background Pattern */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23F8F3E1' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        opacity: 0.3
      }} />
      
      <div style={{
        background: "#F8F3E1",
        padding: "3rem",
        borderRadius: "20px",
        boxShadow: "0 25px 50px rgba(65, 67, 27, 0.15)",
        maxWidth: "450px",
        width: "100%",
        border: "1px solid #E3DBBB",
        position: "relative",
        zIndex: 1
      }}>
        {/* Header with Logo */}
        <div style={{
          textAlign: "center",
          marginBottom: "2rem"
        }}>
          <div style={{
            width: "80px",
            height: "80px",
            background: "linear-gradient(135deg, #41431B, #AEB784)",
            borderRadius: "50%",
            margin: "0 auto 1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "32px",
            color: "#F8F3E1"
          }}>
            <FaSeedling />
          </div>
          <h2 style={{
            color: "#41431B",
            fontSize: "2.5rem",
            fontWeight: "700",
            marginBottom: "0.5rem",
            fontFamily: "Georgia, serif"
          }}>
            Farm Intelligence
          </h2>
          <p style={{
            color: "#AEB784",
            fontSize: "1.1rem",
            marginBottom: "1rem",
            fontStyle: "italic"
          }}>
            Post-Harvest Loss Prevention System
          </p>
        </div>

        <button
          onClick={onBackToLanding}
          style={{
            background: "none",
            border: "none",
            color: "#41431B",
            fontSize: "16px",
            cursor: "pointer",
            marginBottom: "2rem",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontWeight: "500"
          }}
        >
          <FaArrowLeft /> Back to Home
        </button>

        <h3 style={{
          color: "#41431B",
          fontSize: "1.8rem",
          fontWeight: "600",
          marginBottom: "1rem",
          textAlign: "center"
        }}>
          Farmer Login
        </h3>
        
        <p style={{
          color: "#666",
          textAlign: "center",
          marginBottom: "2rem",
          fontSize: "0.95rem"
        }}>
          Enter your mobile number to access your dashboard
        </p>

        {error && (
          <div style={{
            background: "#fee",
            color: "#c33",
            padding: "12px",
            borderRadius: "8px",
            marginBottom: "1rem",
            textAlign: "center",
            border: "1px solid #fcc"
          }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{
            display: "block",
            marginBottom: "0.75rem",
            color: "#41431B",
            fontWeight: "600",
            fontSize: "0.95rem",
            letterSpacing: "0.5px"
          }}>
            <FaMobileAlt style={{ marginRight: '8px' }} /> Mobile Number
          </label>
          <input
            type="tel"
            placeholder="Enter your 10-digit mobile number"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ""))}
            onKeyPress={handleKeyPress}
            maxLength={10}
            style={{
              width: "100%",
              padding: "1rem",
              border: "2px solid #E3DBBB",
              borderRadius: "12px",
              fontSize: "16px",
              outline: "none",
              transition: "all 0.3s ease",
              backgroundColor: "#F8F3E1",
              color: "#41431B"
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#AEB784";
              e.target.style.boxShadow = "0 0 0 3px rgba(174, 183, 132, 0.1)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#E3DBBB";
              e.target.style.boxShadow = "none";
            }}
          />
          <p style={{
            fontSize: "12px",
            color: "#AEB784",
            marginTop: "0.5rem",
            fontStyle: "italic"
          }}>
            <FaLock style={{ marginRight: '8px' }} /> Use your registered mobile number for secure login
          </p>
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: "100%",
            padding: "1.25rem",
            background: loading ? "#E3DBBB" : "linear-gradient(135deg, #41431B, #AEB784)",
            color: "#F8F3E1",
            border: "none",
            borderRadius: "16px",
            fontSize: "18px",
            fontWeight: "700",
            cursor: loading ? "not-allowed" : "pointer",
            transition: "all 0.3s ease",
            marginBottom: "1.5rem",
            boxShadow: loading ? "none" : "0 8px 20px rgba(65, 67, 27, 0.3)",
            textTransform: "uppercase",
            letterSpacing: "1px"
          }}
        >
          {loading ? (
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              <div style={{
                width: "20px",
                height: "20px",
                border: "3px solid #F8F3E1",
                borderTop: "3px solid transparent",
                borderRadius: "50%",
                animation: "spin 1s linear infinite"
              }} />
              Logging in...
            </span>
          ) : (
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              <FaLock /> Login to Dashboard
            </span>
          )}
        </button>

        <div style={{ 
          textAlign: "center",
          padding: "1rem",
          background: "rgba(174, 183, 132, 0.1)",
          borderRadius: "12px",
          border: "1px solid #E3DBBB"
        }}>
          <span style={{ color: "#41431B", fontSize: "14px" }}>Don't have an account? </span>
          <button
            onClick={onShowRegister}
            style={{
              background: "none",
              border: "none",
              color: "#AEB784",
              fontWeight: "600",
              cursor: "pointer",
              fontSize: "14px",
              textDecoration: "underline",
              transition: "color 0.3s ease"
            }}
            onMouseEnter={(e) => e.target.style.color = "#41431B"}
            onMouseLeave={(e) => e.target.style.color = "#AEB784"}
          >
            Register Here
          </button>
        </div>
      </div>
    </div>
  );
}

export default FarmerLogin;
