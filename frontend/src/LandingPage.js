import React from "react";
import { 
  FaSeedling, 
  FaRocket, 
  FaMobileAlt, 
  FaRobot, 
  FaTemperatureHigh, 
  FaChartLine,
  FaUserPlus,
  FaMapMarkedAlt,
  FaBell,
  FaShieldAlt,
  FaUsers,
  FaArrowRight
} from "react-icons/fa";

const LandingPage = ({ onShowLogin, onShowRegister, onShowPolicymaker }) => {
  return (
    <div style={{
      fontFamily: "Inter, system-ui, sans-serif",
      backgroundColor: "#F8F3E1",
      color: "#41431B",
      minHeight: "100vh"
    }}>
      {/* Navigation Header */}
      <nav style={{
        background: "rgba(248, 243, 225, 0.95)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid #E3DBBB",
        position: "sticky",
        top: 0,
        zIndex: 1000,
        padding: "1rem 0"
      }}>
        <div style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem"
          }}>
            <div style={{
              width: "50px",
              height: "50px",
              background: "linear-gradient(135deg, #41431B, #AEB784)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
              color: "#F8F3E1"
            }}>
              <FaSeedling />
            </div>
            <div>
              <h1 style={{ 
                color: "#41431B", 
                fontFamily: "Georgia, serif",
                fontSize: "1.8rem",
                fontWeight: "700",
                margin: 0
              }}>
                Farm Intelligence
              </h1>
              <span style={{ 
                color: "#AEB784", 
                fontFamily: "Inter, sans-serif",
                fontSize: "0.9rem",
                fontStyle: "italic"
              }}>
                AI-Powered Post-Harvest Loss Prevention
              </span>
            </div>
          </div>
          
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "2rem"
          }}>
            <a href="#features" style={{
              color: "#41431B",
              textDecoration: "none",
              fontWeight: "500"
            }}>Features</a>
            <a href="#how-it-works" style={{
              color: "#41431B",
              textDecoration: "none",
              fontWeight: "500"
            }}>How It Works</a>
            <a href="#impact" style={{
              color: "#41431B",
              textDecoration: "none",
              fontWeight: "500"
            }}>Impact</a>
            <button 
              onClick={onShowLogin}
              style={{
                background: "linear-gradient(135deg, #41431B, #AEB784)",
                color: "#F8F3E1",
                border: "none",
                padding: "0.75rem 1.5rem",
                borderRadius: "8px",
                fontWeight: "600",
                cursor: "pointer"
              }}
            >
              Farmer Login
            </button>
            <button 
              onClick={onShowPolicymaker}
              style={{
                background: "transparent",
                color: "#41431B",
                border: "2px solid #41431B",
                padding: "0.75rem 1.5rem",
                borderRadius: "8px",
                fontWeight: "600",
                cursor: "pointer"
              }}
            >
              Policymaker Portal
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        padding: "4rem 2rem",
        background: "linear-gradient(135deg, #41431B 0%, #AEB784 100%)",
        color: "#F8F3E1",
        textAlign: "center"
      }}>
        <div style={{
          maxWidth: "1200px",
          margin: "0 auto"
        }}>
          <h1 style={{
            fontSize: "3.5rem",
            fontWeight: "700",
            marginBottom: "1rem",
            fontFamily: "Georgia, serif",
            lineHeight: "1.2"
          }}>
            Protect Your Harvest 
            <span style={{ 
              color: "#F8F3E1",
              display: "block",
              fontSize: "3rem"
            }}> with AI Intelligence</span>
          </h1>
          <p style={{
            color: "#F8F3E1",
            fontSize: "1.2rem",
            textAlign: "center",
            marginBottom: "2rem",
            maxWidth: "600px",
            margin: "0 auto 2rem",
            lineHeight: "1.6"
          }}>
            Join thousands of farmers using AI-powered insights to prevent post-harvest losses and maximize their yield
          </p>
          <div style={{
            display: "flex",
            gap: "1rem",
            justifyContent: "center",
            flexWrap: "wrap"
          }}>
            <button 
              onClick={onShowRegister}
              style={{
                background: "#F8F3E1",
                color: "#41431B",
                border: "none",
                padding: "1rem 2rem",
                borderRadius: "12px",
                fontSize: "1.1rem",
                fontWeight: "600",
                cursor: "pointer",
                boxShadow: "0 8px 20px rgba(248, 243, 225, 0.3)",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem"
              }}
            >
              <FaRocket /> Get Started
            </button>
            <button 
              onClick={onShowLogin}
              style={{
                background: "transparent",
                color: "#F8F3E1",
                border: "2px solid #F8F3E1",
                padding: "1rem 2rem",
                borderRadius: "12px",
                fontSize: "1.1rem",
                fontWeight: "600",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem"
              }}
            >
              <FaMobileAlt /> Sign In
            </button>
          </div>
          <div style={{
            display: "flex",
            justifyContent: "center",
            gap: "3rem",
            marginTop: "3rem",
            flexWrap: "wrap"
          }}>
            <div style={{
              textAlign: "center",
              padding: "1rem"
            }}>
              <h3 style={{
                fontSize: "2.5rem",
                fontWeight: "700",
                color: "#F8F3E1",
                margin: "0 0 0.5rem 0"
              }}>30%</h3>
              <p style={{
                color: "#F8F3E1",
                margin: "0",
                fontSize: "0.9rem"
              }}>Average reduction in post-harvest losses</p>
            </div>
            <div style={{
              textAlign: "center",
              padding: "1rem"
            }}>
              <h3 style={{
                fontSize: "2.5rem",
                fontWeight: "700",
                color: "#F8F3E1",
                margin: "0 0 0.5rem 0"
              }}>10,000+</h3>
              <p style={{
                color: "#F8F3E1",
                margin: "0",
                fontSize: "0.9rem"
              }}>Farmers supported</p>
            </div>
            <div style={{
              textAlign: "center",
              padding: "1rem"
            }}>
              <h3 style={{
                fontSize: "2.5rem",
                fontWeight: "700",
                color: "#F8F3E1",
                margin: "0 0 0.5rem 0"
              }}>50,000</h3>
              <p style={{
                color: "#F8F3E1",
                margin: "0",
                fontSize: "0.9rem"
              }}>Crops protected</p>
            </div>
            <div style={{
              textAlign: "center",
              padding: "1rem"
            }}>
              <h3 style={{
                fontSize: "2.5rem",
                fontWeight: "700",
                color: "#F8F3E1",
                margin: "0 0 0.5rem 0"
              }}>95%</h3>
              <p style={{
                color: "#F8F3E1",
                margin: "0",
                fontSize: "0.9rem"
              }}>Prediction accuracy</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={{
        padding: "4rem 2rem",
        background: "#F8F3E1"
      }}>
        <div style={{
          maxWidth: "1200px",
          margin: "0 auto"
        }}>
          <h2 style={{
            textAlign: "center",
            fontSize: "2.5rem",
            fontWeight: "700",
            color: "#41431B",
            marginBottom: "1rem",
            fontFamily: "Georgia, serif"
          }}>
            Key Features
          </h2>
          <p style={{
            textAlign: "center",
            fontSize: "1.1rem",
            color: "#666",
            marginBottom: "3rem",
            maxWidth: "600px",
            margin: "0 auto 3rem"
          }}>
            Our AI-powered system provides comprehensive tools for post-harvest loss prevention
          </p>
          
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "2rem"
          }}>
            <div style={{
              background: "white",
              padding: "2rem",
              borderRadius: "16px",
              boxShadow: "0 8px 25px rgba(65, 67, 27, 0.1)",
              border: "1px solid #E3DBBB",
              textAlign: "center"
            }}>
              <div style={{
                fontSize: "3rem",
                marginBottom: "1rem",
                color: "#41431B"
              }}>
                <FaRobot />
              </div>
              <h3 style={{
                color: "#41431B",
                fontSize: "1.3rem",
                fontWeight: "600",
                marginBottom: "1rem"
              }}>
                AI Predictions
              </h3>
              <p style={{
                color: "#666",
                lineHeight: "1.6"
              }}>
                Advanced machine learning algorithms predict potential post-harvest losses with 95% accuracy
              </p>
            </div>
            
            <div style={{
              background: "white",
              padding: "2rem",
              borderRadius: "16px",
              boxShadow: "0 8px 25px rgba(65, 67, 27, 0.1)",
              border: "1px solid #E3DBBB",
              textAlign: "center"
            }}>
              <div style={{
                fontSize: "3rem",
                marginBottom: "1rem",
                color: "#41431B"
              }}>
                <FaTemperatureHigh />
              </div>
              <h3 style={{
                color: "#41431B",
                fontSize: "1.3rem",
                fontWeight: "600",
                marginBottom: "1rem"
              }}>
                Weather Monitoring
              </h3>
              <p style={{
                color: "#666",
                lineHeight: "1.6"
              }}>
                Real-time weather data helps optimize storage conditions and prevent spoilage
              </p>
            </div>
            
            <div style={{
              background: "white",
              padding: "2rem",
              borderRadius: "16px",
              boxShadow: "0 8px 25px rgba(65, 67, 27, 0.1)",
              border: "1px solid #E3DBBB",
              textAlign: "center"
            }}>
              <div style={{
                fontSize: "3rem",
                marginBottom: "1rem",
                color: "#41431B"
              }}>
                <FaChartLine />
              </div>
              <h3 style={{
                color: "#41431B",
                fontSize: "1.3rem",
                fontWeight: "600",
                marginBottom: "1rem"
              }}>
                Market Analytics
              </h3>
              <p style={{
                color: "#666",
                lineHeight: "1.6"
              }}>
                Comprehensive market price analysis helps farmers make informed selling decisions
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" style={{
        padding: "4rem 2rem",
        background: "linear-gradient(135deg, #E3DBBB 0%, #F8F3E1 100%)"
      }}>
        <div style={{
          maxWidth: "1200px",
          margin: "0 auto"
        }}>
          <h2 style={{
            textAlign: "center",
            fontSize: "2.5rem",
            fontWeight: "700",
            color: "#41431B",
            marginBottom: "1rem",
            fontFamily: "Georgia, serif"
          }}>
            How It Works
          </h2>
          <p style={{
            textAlign: "center",
            fontSize: "1.1rem",
            color: "#666",
            marginBottom: "3rem",
            maxWidth: "600px",
            margin: "0 auto 3rem"
          }}>
            Simple steps to start protecting your harvest with AI
          </p>
          
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "2rem"
          }}>
            <div style={{
              background: "white",
              padding: "2rem",
              borderRadius: "16px",
              boxShadow: "0 8px 25px rgba(65, 67, 27, 0.1)",
              border: "1px solid #E3DBBB",
              textAlign: "center",
              position: "relative"
            }}>
              <div style={{
                width: "60px",
                height: "60px",
                background: "linear-gradient(135deg, #41431B, #AEB784)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1rem",
                color: "#F8F3E1",
                fontSize: "1.5rem",
                fontWeight: "700"
              }}>
                1
              </div>
              <div style={{
                fontSize: "2.5rem",
                marginBottom: "1rem",
                color: "#41431B"
              }}>
                <FaUserPlus />
              </div>
              <h3 style={{
                color: "#41431B",
                fontSize: "1.3rem",
                fontWeight: "600",
                marginBottom: "1rem"
              }}>
                Register
              </h3>
              <p style={{
                color: "#666",
                lineHeight: "1.6"
              }}>
                Create your account with mobile number and farm location details
              </p>
            </div>
            
            <div style={{
              background: "white",
              padding: "2rem",
              borderRadius: "16px",
              boxShadow: "0 8px 25px rgba(65, 67, 27, 0.1)",
              border: "1px solid #E3DBBB",
              textAlign: "center",
              position: "relative"
            }}>
              <div style={{
                width: "60px",
                height: "60px",
                background: "linear-gradient(135deg, #41431B, #AEB784)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1rem",
                color: "#F8F3E1",
                fontSize: "1.5rem",
                fontWeight: "700"
              }}>
                2
              </div>
              <div style={{
                fontSize: "2.5rem",
                marginBottom: "1rem",
                color: "#41431B"
              }}>
                <FaMapMarkedAlt />
              </div>
              <h3 style={{
                color: "#41431B",
                fontSize: "1.3rem",
                fontWeight: "600",
                marginBottom: "1rem"
              }}>
                Add Farm Location
              </h3>
              <p style={{
                color: "#666",
                lineHeight: "1.6"
              }}>
                Select your farm location on the interactive map for accurate weather data
              </p>
            </div>
            
            <div style={{
              background: "white",
              padding: "2rem",
              borderRadius: "16px",
              boxShadow: "0 8px 25px rgba(65, 67, 27, 0.1)",
              border: "1px solid #E3DBBB",
              textAlign: "center",
              position: "relative"
            }}>
              <div style={{
                width: "60px",
                height: "60px",
                background: "linear-gradient(135deg, #41431B, #AEB784)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1rem",
                color: "#F8F3E1",
                fontSize: "1.5rem",
                fontWeight: "700"
              }}>
                3
              </div>
              <div style={{
                fontSize: "2.5rem",
                marginBottom: "1rem",
                color: "#41431B"
              }}>
                <FaRobot />
              </div>
              <h3 style={{
                color: "#41431B",
                fontSize: "1.3rem",
                fontWeight: "600",
                marginBottom: "1rem"
              }}>
                Get AI Insights
              </h3>
              <p style={{
                color: "#666",
                lineHeight: "1.6"
              }}>
                Receive real-time predictions and recommendations for your crops
              </p>
            </div>
            
            <div style={{
              background: "white",
              padding: "2rem",
              borderRadius: "16px",
              boxShadow: "0 8px 25px rgba(65, 67, 27, 0.1)",
              border: "1px solid #E3DBBB",
              textAlign: "center",
              position: "relative"
            }}>
              <div style={{
                width: "60px",
                height: "60px",
                background: "linear-gradient(135deg, #41431B, #AEB784)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1rem",
                color: "#F8F3E1",
                fontSize: "1.5rem",
                fontWeight: "700"
              }}>
                4
              </div>
              <div style={{
                fontSize: "2.5rem",
                marginBottom: "1rem",
                color: "#41431B"
              }}>
                <FaBell />
              </div>
              <h3 style={{
                color: "#41431B",
                fontSize: "1.3rem",
                fontWeight: "600",
                marginBottom: "1rem"
              }}>
                Act on Alerts
              </h3>
              <p style={{
                color: "#666",
                lineHeight: "1.6"
              }}>
                Take preventive actions based on risk alerts and weather warnings
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section id="impact" style={{
        padding: "4rem 2rem",
        background: "#41431B",
        color: "#F8F3E1"
      }}>
        <div style={{
          maxWidth: "1200px",
          margin: "0 auto"
        }}>
          <h2 style={{
            textAlign: "center",
            fontSize: "2.5rem",
            fontWeight: "700",
            color: "#F8F3E1",
            marginBottom: "1rem",
            fontFamily: "Georgia, serif"
          }}>
            Our Impact
          </h2>
          <p style={{
            textAlign: "center",
            fontSize: "1.1rem",
            color: "#AEB784",
            marginBottom: "3rem",
            maxWidth: "600px",
            margin: "0 auto 3rem"
          }}>
            Making a real difference in farmers' lives across India
          </p>
          
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "2rem",
            marginBottom: "3rem"
          }}>
            <div style={{
              background: "rgba(248, 243, 225, 0.1)",
              padding: "2rem",
              borderRadius: "16px",
              border: "1px solid rgba(174, 183, 132, 0.3)",
              textAlign: "center"
            }}>
              <div style={{
                fontSize: "3rem",
                marginBottom: "1rem",
                color: "#AEB784"
              }}>
                <FaShieldAlt />
              </div>
              <h3 style={{
                fontSize: "2.5rem",
                fontWeight: "700",
                color: "#F8F3E1",
                marginBottom: "0.5rem"
              }}>
                30%
              </h3>
              <p style={{
                color: "#AEB784",
                lineHeight: "1.6"
              }}>
                Average reduction in post-harvest losses reported by farmers
              </p>
            </div>
            
            <div style={{
              background: "rgba(248, 243, 225, 0.1)",
              padding: "2rem",
              borderRadius: "16px",
              border: "1px solid rgba(174, 183, 132, 0.3)",
              textAlign: "center"
            }}>
              <div style={{
                fontSize: "3rem",
                marginBottom: "1rem",
                color: "#AEB784"
              }}>
                <FaUsers />
              </div>
              <h3 style={{
                fontSize: "2.5rem",
                fontWeight: "700",
                color: "#F8F3E1",
                marginBottom: "0.5rem"
              }}>
                10,000+
              </h3>
              <p style={{
                color: "#AEB784",
                lineHeight: "1.6"
              }}>
                Active farmers using our platform daily
              </p>
            </div>
            
            <div style={{
              background: "rgba(248, 243, 225, 0.1)",
              padding: "2rem",
              borderRadius: "16px",
              border: "1px solid rgba(174, 183, 132, 0.3)",
              textAlign: "center"
            }}>
              <div style={{
                fontSize: "3rem",
                marginBottom: "1rem",
                color: "#AEB784"
              }}>
                <FaSeedling />
              </div>
              <h3 style={{
                fontSize: "2.5rem",
                fontWeight: "700",
                color: "#F8F3E1",
                marginBottom: "0.5rem"
              }}>
                50,000+
              </h3>
              <p style={{
                color: "#AEB784",
                lineHeight: "1.6"
              }}>
                Crop batches monitored and protected
              </p>
            </div>
            
            <div style={{
              background: "rgba(248, 243, 225, 0.1)",
              padding: "2rem",
              borderRadius: "16px",
              border: "1px solid rgba(174, 183, 132, 0.3)",
              textAlign: "center"
            }}>
              <div style={{
                fontSize: "3rem",
                marginBottom: "1rem",
                color: "#AEB784"
              }}>
                <FaChartLine />
              </div>
              <h3 style={{
                fontSize: "2.5rem",
                fontWeight: "700",
                color: "#F8F3E1",
                marginBottom: "0.5rem"
              }}>
                95%
              </h3>
              <p style={{
                color: "#AEB784",
                lineHeight: "1.6"
              }}>
                Prediction accuracy for loss prevention
              </p>
            </div>
          </div>
          
          {/* Testimonial/CTA */}
          <div style={{
            background: "linear-gradient(135deg, rgba(174, 183, 132, 0.2) 0%, rgba(65, 67, 27, 0.3) 100%)",
            padding: "3rem",
            borderRadius: "20px",
            textAlign: "center",
            border: "1px solid rgba(174, 183, 132, 0.3)"
          }}>
            <h3 style={{
              fontSize: "2rem",
              fontWeight: "700",
              color: "#F8F3E1",
              marginBottom: "1rem",
              fontFamily: "Georgia, serif"
            }}>
              Ready to Protect Your Harvest?
            </h3>
            <p style={{
              color: "#AEB784",
              fontSize: "1.1rem",
              marginBottom: "2rem",
              maxWidth: "600px",
              margin: "0 auto 2rem"
            }}>
              Join thousands of farmers who are already saving their crops with AI-powered insights
            </p>
            <button 
              onClick={onShowRegister}
              style={{
                background: "#F8F3E1",
                color: "#41431B",
                border: "none",
                padding: "1rem 2.5rem",
                borderRadius: "12px",
                fontSize: "1.2rem",
                fontWeight: "700",
                cursor: "pointer",
                boxShadow: "0 8px 20px rgba(248, 243, 225, 0.3)",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem"
              }}
            >
              Get Started Now <FaArrowRight />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
