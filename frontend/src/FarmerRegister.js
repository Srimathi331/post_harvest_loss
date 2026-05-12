import React, { useState } from "react";
import axios from "axios";
import { FaSeedling, FaArrowLeft, FaUser, FaMobileAlt, FaLock, FaRocket } from 'react-icons/fa';
import WorkingLeafletMap from "./components/WorkingLeafletMap";

function FarmerRegister({ onRegister, onBackToLanding, onShowLogin }) {
  const [name, setName] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [cropType, setCropType] = useState("banana");
  const [mobileNumber, setMobileNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  
  const handleRegister = async () => {
    setError("");
    
    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    if (isNaN(parseFloat(latitude)) || isNaN(parseFloat(longitude))) {
      setError('Please select a location on the map');
      return;
    }

    if (!cropType) {
      setError('Crop type is required');
      return;
    }

    if (!mobileNumber.trim()) {
      setError('Mobile number is required');
      return;
    }

    if (!/^\d{10}$/.test(mobileNumber)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    
    try {
      const res = await axios.post("http://localhost:5000/farmer", {
        name,
        cropType,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        mobileNumber: mobileNumber
      });
      
      // Show success message
      setRegistrationSuccess(true);
      
      // Auto-login after 3 seconds
      setTimeout(() => {
        onRegister(res.data);
      }, 3000);
      
    } catch (err) {
      const serverMessage = err.response?.data?.error;
      if (serverMessage === 'Mobile number already registered') {
        setError('This mobile number is already registered. Please login instead.');
      } else {
        setError(serverMessage || 'Registration failed. Please try again.');
      }
      console.error("Registration failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleRegister();
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #41431B 0%, #AEB784 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      transition: 'all 0.5s ease',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23F8F3E1' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        opacity: 0.3
      }} />
      
      <div style={{
        background: '#F8F3E1',
        padding: '3rem',
        borderRadius: '20px',
        boxShadow: '0 25px 50px rgba(65, 67, 27, 0.15)',
        maxWidth: '500px',
        width: '100%',
        border: '1px solid #E3DBBB',
        transition: 'all 0.5s ease',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Header with Logo */}
        <div style={{
          textAlign: 'center',
          marginBottom: '2rem'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #41431B, #AEB784)',
            borderRadius: '50%',
            margin: '0 auto 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px',
            color: '#F8F3E1'
          }}>
            <FaSeedling />
          </div>
          <h2 style={{
            color: '#41431B',
            fontSize: '2.5rem',
            fontWeight: '700',
            marginBottom: '0.5rem',
            fontFamily: 'Georgia, serif'
          }}>
            Farm Intelligence
          </h2>
          <p style={{
            color: '#AEB784',
            fontSize: '1.1rem',
            marginBottom: '1rem',
            fontStyle: 'italic'
          }}>
            Post-Harvest Loss Prevention System
          </p>
        </div>

        <button
          onClick={onBackToLanding}
          style={{
            background: 'none',
            border: 'none',
            color: '#41431B',
            fontSize: '16px',
            cursor: 'pointer',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: '500'
          }}
        >
          <FaArrowLeft /> Back to Home
        </button>

        <h3 style={{
          color: '#41431B',
          fontSize: '1.8rem',
          fontWeight: '600',
          marginBottom: '1rem',
          textAlign: 'center'
        }}>
          Register Your Farm
        </h3>
        
        <p style={{
          color: '#666',
          textAlign: 'center',
          marginBottom: '2rem',
          fontSize: '0.95rem'
        }}>
          Join thousands of farmers protecting their harvest with AI-powered insights
        </p>

        {registrationSuccess ? (
          <div style={{
            background: 'linear-gradient(135deg, #F8F3E1, #E3DBBB)',
            color: '#41431B',
            padding: '2rem',
            borderRadius: '16px',
            marginBottom: '2rem',
            textAlign: 'center',
            border: '2px solid #AEB784',
            boxShadow: '0 10px 25px rgba(174, 183, 132, 0.2)'
          }}>
            <div style={{ 
              fontSize: '48px', 
              marginBottom: '1rem',
              animation: 'bounce 2s infinite'
            }}><FaRocket /></div>
            <h3 style={{ 
              color: '#41431B', 
              marginBottom: '1rem',
              fontSize: '1.5rem',
              fontWeight: '700'
            }}>
              Registration Successful!
            </h3>
            <p style={{ 
              fontSize: '16px', 
              color: '#41431B', 
              marginBottom: '1rem',
              lineHeight: '1.5'
            }}>
              Your farm has been registered successfully with our AI-powered system
            </p>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '14px',
              color: '#AEB784',
              marginTop: '1rem'
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                background: '#AEB784',
                borderRadius: '50%',
                animation: 'pulse 1.5s infinite'
              }} />
              Redirecting to your dashboard...
            </div>
          </div>
        ) : (
          <>
            {error && (
              <div style={{
                background: '#fee',
                color: '#c33',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '1rem',
                textAlign: 'center'
              }}>
                {error}
              </div>
            )}

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.75rem',
                color: '#41431B',
                fontWeight: '600',
                fontSize: '0.95rem',
                letterSpacing: '0.5px'
              }}>
                <FaUser style={{ marginRight: '8px' }} /> Full Name
              </label>
              <input
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyPress={handleKeyPress}
                style={{
                  width: '100%',
                  padding: '1rem',
                  border: '2px solid #E3DBBB',
                  borderRadius: '12px',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  backgroundColor: '#F8F3E1',
                  color: '#41431B'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#AEB784';
                  e.target.style.boxShadow = '0 0 0 3px rgba(174, 183, 132, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#E3DBBB';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.75rem',
                color: '#41431B',
                fontWeight: '600',
                fontSize: '0.95rem',
                letterSpacing: '0.5px'
              }}>
                <FaMobileAlt style={{ marginRight: '8px' }} /> Mobile Number
              </label>
              <input
                type="tel"
                placeholder="Enter your 10-digit mobile number"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                onKeyPress={handleKeyPress}
                maxLength={10}
                style={{
                  width: '100%',
                  padding: '1rem',
                  border: '2px solid #E3DBBB',
                  borderRadius: '12px',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  backgroundColor: '#F8F3E1',
                  color: '#41431B'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#AEB784';
                  e.target.style.boxShadow = '0 0 0 3px rgba(174, 183, 132, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#E3DBBB';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <p style={{
                fontSize: '12px',
                color: '#AEB784',
                marginTop: '0.5rem',
                fontStyle: 'italic'
              }}>
                <FaLock style={{ marginRight: '8px' }} /> Use this mobile number for secure login
              </p>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.75rem',
                color: '#41431B',
                fontWeight: '600',
                fontSize: '0.95rem',
                letterSpacing: '0.5px'
              }}>
                <FaSeedling style={{ marginRight: '8px' }} /> Crop Type
              </label>
              <select
                value={cropType}
                onChange={(e) => setCropType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '1rem',
                  border: '2px solid #E3DBBB',
                  borderRadius: '12px',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  backgroundColor: '#F8F3E1',
                  color: '#41431B',
                  cursor: 'pointer'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#AEB784';
                  e.target.style.boxShadow = '0 0 0 3px rgba(174, 183, 132, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#E3DBBB';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <option value="banana">Banana</option>
                <option value="onion">Onion</option>
                <option value="rice">Rice</option>
                <option value="wheat">Wheat</option>
                <option value="tomato">Tomato</option>
                <option value="potato">Potato</option>
              </select>
            </div>

            <WorkingLeafletMap 
              onLocationSelect={(lat, lng) => {
                setLatitude(lat.toString());
                setLongitude(lng.toString());
              }}
              initialLat={latitude}
              initialLng={longitude}
            />

            <button
              onClick={handleRegister}
              disabled={loading}
              style={{
                width: '100%',
                padding: '1.25rem',
                background: loading ? '#E3DBBB' : 'linear-gradient(135deg, #41431B, #AEB784)',
                color: '#F8F3E1',
                border: 'none',
                borderRadius: '16px',
                fontSize: '18px',
                fontWeight: '700',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                marginBottom: '1.5rem',
                boxShadow: loading ? 'none' : '0 8px 20px rgba(65, 67, 27, 0.3)',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 12px 30px rgba(65, 67, 27, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 8px 20px rgba(65, 67, 27, 0.3)';
                }
              }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    border: '3px solid #F8F3E1',
                    borderTop: '3px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  Registering...
                </span>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <FaRocket style={{ marginRight: '8px' }} /> Register Your Farm
                </span>
              )}
            </button>

            <div style={{ 
              textAlign: 'center',
              padding: '1rem',
              background: 'rgba(174, 183, 132, 0.1)',
              borderRadius: '12px',
              border: '1px solid #E3DBBB'
            }}>
              <span style={{ color: '#41431B', fontSize: '14px' }}>Already have an account? </span>
              <button
                onClick={onShowLogin}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#AEB784',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '14px',
                  textDecoration: 'underline',
                  transition: 'color 0.3s ease'
                }}
                onMouseEnter={(e) => e.target.style.color = '#41431B'}
                onMouseLeave={(e) => e.target.style.color = '#AEB784'}
              >
                Sign In Here
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default FarmerRegister;
