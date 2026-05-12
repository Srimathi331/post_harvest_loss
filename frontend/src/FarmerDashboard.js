import React, { useState, useEffect, useCallback } from "react";

import axios from "axios";

import {

  FaSeedling, FaSignOutAlt, FaPlus, FaExclamationTriangle, FaCheckCircle,

  FaCloudSun, FaDollarSign, FaWarehouse, FaCalendarAlt, FaTractor,

  FaChartLine, FaThermometerHalf, FaTint, FaCloudRain, FaTrophy,

  FaMedal, FaStar, FaBell, FaHistory, FaList, FaTimes

} from "react-icons/fa";

const API = "http://localhost:5000";

const colors = {

  darkOlive: "#41431B", sage: "#AEB784", beige: "#E3DBBB", cream: "#F8F3E1"

};

const LEVEL_COLORS = {

  Beginner: "#6b7280", Intermediate: "#3b82f6", Advanced: "#8b5cf6", Expert: "#f59e0b"

};

const getRiskStyles = (level) => {

  switch (level) {

    case "Green": return { bg: "#10b981", icon: <FaCheckCircle />, text: "Low Risk" };

    case "Yellow": return { bg: "#f59e0b", icon: <FaExclamationTriangle />, text: "Medium Risk" };

    case "Red": return { bg: "#ef4444", icon: <FaExclamationTriangle />, text: "High Risk" };

    default: return { bg: "#6b7280", icon: <FaCheckCircle />, text: "Unknown" };

  }

};

const FarmerDashboard = ({ farmer, onLogout }) => {

  const [allBatches, setAllBatches] = useState([]);

  const [selectedBatch, setSelectedBatch] = useState(null);

  const [riskAssessment, setRiskAssessment] = useState(null);

  const [weather, setWeather] = useState(null);

  const [market, setMarket] = useState(null);

  const [riskHistory, setRiskHistory] = useState([]);

  const [gamification, setGamification] = useState(null);

  const [loading, setLoading] = useState(true);

  const [riskLoading, setRiskLoading] = useState(false);

  const [showAddBatch, setShowAddBatch] = useState(false);

  const [activeTab, setActiveTab] = useState("dashboard");

  const [alerts, setAlerts] = useState([]);

  const [newBatch, setNewBatch] = useState({

    cropType: "", quantity: "", storageMethod: "dry_warehouse",

    harvestDate: new Date().toISOString().split("T")[0]

  });

  const addAlert = useCallback((message, type = "info") => {

    const id = Date.now();

    setAlerts(prev => [...prev, { id, message, type }]);

    setTimeout(() => setAlerts(prev => prev.filter(a => a.id !== id)), 5000);

  }, []);

  const fetchGamification = useCallback(async () => {

    try {

      const res = await axios.get(`${API}/game/farmer/${farmer._id}`);

      setGamification(res.data);

    } catch (err) {

      console.warn("Gamification fetch failed:", err.message);

    }

  }, [farmer._id]);

  const fetchRiskForBatch = useCallback(async (batch) => {

    try {

      setRiskLoading(true);

      const res = await axios.get(`${API}/cropbatch/${batch._id}/risk-assessment`);

      setRiskAssessment(res.data.riskAssessment);

      setWeather(res.data.weather);

      setMarket(res.data.market);

      if (res.data.riskChanged && res.data.previousRiskLevel) {

        const prev = res.data.previousRiskLevel;

        const curr = res.data.riskAssessment.riskLevel;

        if (prev === "Green" && curr !== "Green")

          addAlert(`⚠️ Risk increased for ${batch.cropType}: ${prev} → ${curr}`, "warning");

        else if (prev === "Red" && curr !== "Red")

          addAlert(`✅ Risk improved for ${batch.cropType}: ${prev} → ${curr}`, "success");

        else if (prev !== curr)

          addAlert(`🔔 Risk changed for ${batch.cropType}: ${prev} → ${curr}`, "info");

      }

      const histRes = await axios.get(`${API}/cropbatch/${batch._id}/history`);

      setRiskHistory(histRes.data);

    } catch (err) {

      console.error("Risk fetch error:", err.message);

    } finally {

      setRiskLoading(false);

    }

  }, [addAlert]);

  const fetchFarmerData = useCallback(async () => {

    try {

      setLoading(true);

      const res = await axios.get(`${API}/cropbatch/trader/${farmer._id}`);

      const batches = res.data;

      setAllBatches(batches);

      if (batches.length > 0) {

        setSelectedBatch(batches[0]);

        await fetchRiskForBatch(batches[0]);

      }

      await fetchGamification();

    } catch (err) {

      console.error("Fetch error:", err.message);

    } finally {

      setLoading(false);

    }

  }, [farmer._id, fetchRiskForBatch, fetchGamification]);

  useEffect(() => { if (farmer) fetchFarmerData(); }, [farmer, fetchFarmerData]);

  const handleSelectBatch = async (batch) => {

    setSelectedBatch(batch);

    setActiveTab("dashboard");

    await fetchRiskForBatch(batch);

  };

  const handleAddBatch = async (e) => {

    e.preventDefault();

    try {

      await axios.post(`${API}/cropbatch`, {

        ...newBatch, traderId: farmer._id,

        latitude: farmer.latitude, longitude: farmer.longitude,

        quantity: parseFloat(newBatch.quantity)

      });

      setNewBatch({ cropType: "", quantity: "", storageMethod: "dry_warehouse", harvestDate: new Date().toISOString().split("T")[0] });

      setShowAddBatch(false);

      addAlert("✅ New crop batch added! +15 points earned.", "success");

      await fetchFarmerData();

    } catch (err) {

      console.error("Add batch error:", err.message);

      addAlert("❌ Failed to add crop batch. Please try again.", "error");

    }

  };

  if (loading) return (

    <div style={{ minHeight: "100vh", background: `linear-gradient(135deg, ${colors.darkOlive}, ${colors.sage})`, display: "flex", alignItems: "center", justifyContent: "center" }}>

      <div style={{ textAlign: "center", color: colors.cream }}>

        <FaTractor style={{ fontSize: "48px", marginBottom: "20px" }} />

        <h2 style={{ fontFamily: "Georgia, serif" }}>Loading your dashboard...</h2>

      </div>

    </div>

  );

  return (

    <div style={{ minHeight: "100vh", background: colors.cream, fontFamily: "Inter, system-ui, sans-serif" }}>

      {/* Alerts */}

      <div style={{ position: "fixed", top: "20px", right: "20px", zIndex: 9999, display: "flex", flexDirection: "column", gap: "10px" }}>

        {alerts.map(alert => (

          <div key={alert.id} style={{

            padding: "14px 20px", borderRadius: "12px", maxWidth: "360px",

            background: alert.type === "success" ? "#dcfce7" : alert.type === "warning" ? "#fef9c3" : alert.type === "error" ? "#fee2e2" : "#dbeafe",

            color: alert.type === "success" ? "#166534" : alert.type === "warning" ? "#854d0e" : alert.type === "error" ? "#991b1b" : "#1e40af",

            boxShadow: "0 4px 20px rgba(0,0,0,0.15)", fontWeight: "600", fontSize: "14px",

            display: "flex", alignItems: "center", gap: "10px"

          }}>

            <FaBell /> {alert.message}

            <button onClick={() => setAlerts(p => p.filter(a => a.id !== alert.id))}

              style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", fontSize: "16px" }}>

              <FaTimes />

            </button>

          </div>

        ))}

      </div>

      {/* Header */}

      <header style={{ background: `linear-gradient(135deg, ${colors.darkOlive}, ${colors.sage})`, padding: "20px 40px", color: colors.cream, boxShadow: "0 4px 20px rgba(65,67,27,0.3)" }}>

        <div style={{ maxWidth: "1400px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>

          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>

            <div style={{ width: "50px", height: "50px", background: colors.cream, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: colors.darkOlive, fontSize: "24px" }}>

              <FaSeedling />

            </div>

            <div>

              <h1 style={{ margin: 0, fontFamily: "Georgia, serif", fontSize: "1.8rem" }}>Farmer Dashboard</h1>

              <p style={{ margin: "5px 0 0 0", opacity: 0.9, fontSize: "0.9rem" }}>Welcome back, <strong>{farmer.name}</strong></p>

            </div>

          </div>

          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>

            {gamification && (

              <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: "10px", padding: "8px 16px", fontSize: "13px", color: colors.cream, display: "flex", alignItems: "center", gap: "8px" }}>

                <FaTrophy style={{ color: "#fbbf24" }} />

                <strong>{gamification.lossPreventionScore}</strong> pts

                <span style={{ background: LEVEL_COLORS[gamification.level], borderRadius: "6px", padding: "2px 8px", fontSize: "11px" }}>{gamification.level}</span>

              </div>

            )}

            <button onClick={onLogout} style={{ padding: "10px 20px", background: "rgba(248,243,225,0.2)", color: colors.cream, border: `2px solid ${colors.cream}`, borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", fontWeight: "600" }}>

              <FaSignOutAlt /> Logout

            </button>

          </div>

        </div>

        {/* Nav Tabs */}

        <div style={{ maxWidth: "1400px", margin: "15px auto 0", display: "flex", gap: "8px" }}>

          {[

            { key: "dashboard", icon: <FaChartLine />, label: "Dashboard" },

            { key: "batches", icon: <FaList />, label: `All Batches (${allBatches.length})` },

            { key: "history", icon: <FaHistory />, label: "Risk History" },

            { key: "gamification", icon: <FaTrophy />, label: "Achievements" }

          ].map(tab => (

            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{

              padding: "8px 18px", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: "600",

              display: "flex", alignItems: "center", gap: "6px",

              background: activeTab === tab.key ? colors.cream : "rgba(255,255,255,0.15)",

              color: activeTab === tab.key ? colors.darkOlive : colors.cream

            }}>

              {tab.icon} {tab.label}

            </button>

          ))}

        </div>

      </header>

      <main style={{ maxWidth: "1400px", margin: "30px auto", padding: "0 40px" }}>

        {/* ALL BATCHES TAB */}

        {activeTab === "batches" && (

          <div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>

              <h2 style={{ color: colors.darkOlive, fontFamily: "Georgia, serif", margin: 0 }}>All Crop Batches</h2>

              <button onClick={() => setShowAddBatch(true)} style={{ padding: "12px 24px", background: `linear-gradient(135deg, ${colors.darkOlive}, ${colors.sage})`, color: colors.cream, border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}>

                <FaPlus /> Add New Batch

              </button>

            </div>

            {allBatches.length === 0 ? (

              <div style={{ textAlign: "center", padding: "60px", background: "white", borderRadius: "20px", color: "#666" }}>No batches yet.</div>

            ) : (

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>

                {allBatches.map(batch => (

                  <div key={batch._id} onClick={() => handleSelectBatch(batch)} style={{

                    background: "white", borderRadius: "16px", padding: "24px", cursor: "pointer",

                    boxShadow: selectedBatch?._id === batch._id ? `0 0 0 3px ${colors.darkOlive}` : "0 4px 20px rgba(65,67,27,0.1)",

                    border: `1px solid ${colors.beige}`, transition: "all 0.2s"

                  }}>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>

                      <div style={{ fontSize: "20px", fontWeight: "bold", color: colors.darkOlive, textTransform: "capitalize" }}>{batch.cropType}</div>

                      {batch.currentRiskLevel && (

                        <span style={{ background: getRiskStyles(batch.currentRiskLevel).bg, color: "white", borderRadius: "20px", padding: "4px 12px", fontSize: "12px", fontWeight: "600" }}>

                          {getRiskStyles(batch.currentRiskLevel).text}

                        </span>

                      )}

                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>

                      <div style={{ background: colors.cream, borderRadius: "8px", padding: "10px" }}>

                        <div style={{ fontSize: "11px", color: "#888" }}>Quantity</div>

                        <div style={{ fontWeight: "bold", color: colors.darkOlive }}>{batch.quantity} kg</div>

                      </div>

                      <div style={{ background: colors.cream, borderRadius: "8px", padding: "10px" }}>

                        <div style={{ fontSize: "11px", color: "#888" }}>Storage</div>

                        <div style={{ fontWeight: "bold", color: colors.darkOlive, fontSize: "12px", textTransform: "capitalize" }}>{batch.storageMethod.replace(/_/g, " ")}</div>

                      </div>

                      <div style={{ background: colors.cream, borderRadius: "8px", padding: "10px", gridColumn: "1/-1" }}>

                        <div style={{ fontSize: "11px", color: "#888" }}>Harvest Date</div>

                        <div style={{ fontWeight: "bold", color: colors.darkOlive }}>{new Date(batch.harvestDate).toLocaleDateString()}</div>

                      </div>

                    </div>

                    <div style={{ marginTop: "12px", fontSize: "12px", color: colors.sage, fontWeight: "600" }}>

                      {selectedBatch?._id === batch._id ? "✓ Currently Viewing" : "Click to view →"}

                    </div>

                  </div>

                ))}

              </div>

            )}

          </div>

        )}

        {/* RISK HISTORY TAB */}

        {activeTab === "history" && (

          <div>

            <h2 style={{ color: colors.darkOlive, fontFamily: "Georgia, serif", marginBottom: "24px" }}>

              Risk History {selectedBatch && `— ${selectedBatch.cropType} (${selectedBatch.quantity}kg)`}

            </h2>

            {!selectedBatch ? (

              <div style={{ textAlign: "center", padding: "60px", background: "white", borderRadius: "20px", color: "#666" }}>

                Select a batch from "All Batches" to view its history.

              </div>

            ) : riskHistory.length === 0 ? (

              <div style={{ textAlign: "center", padding: "60px", background: "white", borderRadius: "20px", color: "#666" }}>

                No history yet. Risk records are saved each time the dashboard loads.

              </div>

            ) : (

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

                {riskHistory.map((record) => (

                  <div key={record._id} style={{ background: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 4px 20px rgba(65,67,27,0.08)", border: `1px solid ${colors.beige}`, display: "flex", gap: "20px", alignItems: "flex-start" }}>

                    <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: getRiskStyles(record.riskLevel).bg, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "22px", flexShrink: 0 }}>

                      {getRiskStyles(record.riskLevel).icon}

                    </div>

                    <div style={{ flex: 1 }}>

                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>

                        <span style={{ fontWeight: "bold", color: getRiskStyles(record.riskLevel).bg, fontSize: "16px" }}>{getRiskStyles(record.riskLevel).text} — Score: {record.riskScore}/100</span>

                        <span style={{ color: "#888", fontSize: "13px" }}>{new Date(record.calculatedAt).toLocaleString()}</span>

                      </div>

                      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "10px" }}>

                        {[

                          { label: "Temp", value: `${record.temperature}°C` },

                          { label: "Humidity", value: `${record.humidity}%` },

                          { label: "Rainfall", value: `${record.rainfall}mm` },

                          { label: "Market", value: record.marketPriceTrend }

                        ].map(item => (

                          <span key={item.label} style={{ background: colors.cream, borderRadius: "6px", padding: "4px 10px", fontSize: "13px", color: colors.darkOlive }}>

                            {item.label}: <strong>{item.value}</strong>

                          </span>

                        ))}

                      </div>

                      {record.recommendations?.[0] && (

                        <div style={{ fontSize: "13px", color: "#555", fontStyle: "italic" }}>💡 {record.recommendations[0]}</div>

                      )}

                    </div>

                  </div>

                ))}

              </div>

            )}

          </div>

        )}

        {/* GAMIFICATION TAB */}

        {activeTab === "gamification" && (

          <div>

            <h2 style={{ color: colors.darkOlive, fontFamily: "Georgia, serif", marginBottom: "24px" }}>Your Achievements</h2>

            {!gamification ? (

              <div style={{ textAlign: "center", padding: "60px", background: "white", borderRadius: "20px", color: "#666" }}>Loading achievements...</div>

            ) : (

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>

                {/* Score Banner */}

                <div style={{ background: `linear-gradient(135deg, ${colors.darkOlive}, ${colors.sage})`, borderRadius: "20px", padding: "30px", color: colors.cream, gridColumn: "1/-1" }}>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px" }}>

                    <div>

                      <div style={{ fontSize: "14px", opacity: 0.8, marginBottom: "6px" }}>Loss Prevention Score</div>

                      <div style={{ fontSize: "52px", fontWeight: "bold", lineHeight: 1 }}>{gamification.lossPreventionScore}</div>

                      <div style={{ marginTop: "10px" }}>

                        <span style={{ background: LEVEL_COLORS[gamification.level], borderRadius: "8px", padding: "4px 14px", fontWeight: "700", fontSize: "14px" }}>{gamification.level}</span>

                      </div>

                    </div>

                    <FaTrophy style={{ fontSize: "72px", color: "#fbbf24" }} />

                    <div style={{ display: "flex", gap: "24px" }}>

                      <div style={{ textAlign: "center" }}>

                        <div style={{ fontSize: "32px", fontWeight: "bold" }}>{gamification.streak?.currentStreak || 0}</div>

                        <div style={{ fontSize: "12px", opacity: 0.8 }}>Day Streak 🔥</div>

                      </div>

                      <div style={{ textAlign: "center" }}>

                        <div style={{ fontSize: "32px", fontWeight: "bold" }}>{gamification.badges?.length || 0}</div>

                        <div style={{ fontSize: "12px", opacity: 0.8 }}>Badges 🏅</div>

                      </div>

                      <div style={{ textAlign: "center" }}>

                        <div style={{ fontSize: "32px", fontWeight: "bold" }}>#{gamification.leaderboard?.nationalRank || "—"}</div>

                        <div style={{ fontSize: "12px", opacity: 0.8 }}>National Rank</div>

                      </div>

                    </div>

                  </div>

                </div>

                {/* Stats */}

                <div style={{ background: "white", borderRadius: "20px", padding: "28px", boxShadow: "0 4px 20px rgba(65,67,27,0.08)", border: `1px solid ${colors.beige}` }}>

                  <h3 style={{ color: colors.darkOlive, margin: "0 0 20px 0", display: "flex", alignItems: "center", gap: "8px" }}><FaStar /> Activity Stats</h3>

                  {[

                    { label: "Batches Managed", value: gamification.achievements?.totalBatchesManaged || 0, emoji: "🌾" },

                    { label: "Risks Mitigated", value: gamification.achievements?.riskMitigated || 0, emoji: "🛡️" },

                    { label: "Recommendations Followed", value: gamification.achievements?.recommendationsFollowed || 0, emoji: "📋" },

                    { label: "Early Interventions", value: gamification.achievements?.earlyInterventions || 0, emoji: "⚡" },

                  ].map(item => (

                    <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: `1px solid ${colors.beige}` }}>

                      <span style={{ color: "#555", fontSize: "15px" }}>{item.emoji} {item.label}</span>

                      <span style={{ fontWeight: "bold", color: colors.darkOlive, fontSize: "20px" }}>{item.value}</span>

                    </div>

                  ))}

                </div>

                {/* Badges */}

                <div style={{ background: "white", borderRadius: "20px", padding: "28px", boxShadow: "0 4px 20px rgba(65,67,27,0.08)", border: `1px solid ${colors.beige}` }}>

                  <h3 style={{ color: colors.darkOlive, margin: "0 0 20px 0", display: "flex", alignItems: "center", gap: "8px" }}><FaMedal /> Badges Earned</h3>

                  {!gamification.badges || gamification.badges.length === 0 ? (

                    <div style={{ textAlign: "center", padding: "30px", color: "#888" }}>

                      <FaMedal style={{ fontSize: "40px", marginBottom: "10px", opacity: 0.3 }} />

                      <p>No badges yet. Keep farming to earn your first badge!</p>

                    </div>

                  ) : (

                    <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>

                      {gamification.badges.map((badge, i) => (

                        <div key={i} title={badge.description} style={{ background: colors.cream, borderRadius: "12px", padding: "14px", textAlign: "center", width: "110px", cursor: "help" }}>

                          <img src={badge.icon} alt={badge.name} style={{ width: "36px", height: "36px", marginBottom: "8px" }} onError={e => { e.target.style.display = "none"; }} />

                          <div style={{ fontSize: "11px", fontWeight: "bold", color: colors.darkOlive }}>{badge.name}</div>

                          <div style={{ fontSize: "10px", color: "#888", marginTop: "4px" }}>{new Date(badge.earnedAt).toLocaleDateString()}</div>

                        </div>

                      ))}

                    </div>

                  )}

                </div>

              </div>

            )}

          </div>

        )}

        {/* DASHBOARD TAB */}

        {activeTab === "dashboard" && (

          <div>

            {allBatches.length === 0 ? (

              <div style={{ background: "white", borderRadius: "20px", padding: "60px 40px", textAlign: "center", boxShadow: "0 10px 40px rgba(65,67,27,0.1)", border: `1px solid ${colors.beige}` }}>

                <FaTractor style={{ fontSize: "64px", color: colors.sage, marginBottom: "20px" }} />

                <h2 style={{ color: colors.darkOlive, fontFamily: "Georgia, serif" }}>No Crop Batches Found</h2>

                <p style={{ color: "#666", marginBottom: "30px" }}>Add your first crop batch to start monitoring with AI</p>

                <button onClick={() => setShowAddBatch(true)} style={{ padding: "16px 40px", background: `linear-gradient(135deg, ${colors.darkOlive}, ${colors.sage})`, color: colors.cream, border: "none", borderRadius: "12px", cursor: "pointer", fontSize: "16px", fontWeight: "600", display: "inline-flex", alignItems: "center", gap: "10px" }}>

                  <FaPlus /> Add Your First Crop Batch

                </button>

              </div>

            ) : (

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "24px" }}>

                {/* Batch Switcher */}

                <div style={{ background: "white", borderRadius: "20px", padding: "24px", boxShadow: "0 4px 20px rgba(65,67,27,0.08)", border: `1px solid ${colors.beige}`, gridColumn: "1/-1" }}>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>

                    <h3 style={{ margin: 0, color: colors.darkOlive, display: "flex", alignItems: "center", gap: "8px" }}><FaWarehouse /> Select Batch to View</h3>

                    <button onClick={() => setShowAddBatch(true)} style={{ padding: "10px 20px", background: `linear-gradient(135deg, ${colors.darkOlive}, ${colors.sage})`, color: colors.cream, border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600", display: "flex", alignItems: "center", gap: "6px", fontSize: "13px" }}>

                      <FaPlus /> Add New Batch

                    </button>

                  </div>

                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>

                    {allBatches.map(batch => (

                      <button key={batch._id} onClick={() => handleSelectBatch(batch)} style={{

                        padding: "10px 18px", borderRadius: "10px", border: "none", cursor: "pointer", fontWeight: "600", fontSize: "13px",

                        background: selectedBatch?._id === batch._id ? colors.darkOlive : colors.cream,

                        color: selectedBatch?._id === batch._id ? colors.cream : colors.darkOlive,

                        display: "flex", alignItems: "center", gap: "8px", transition: "all 0.2s"

                      }}>

                        <FaSeedling style={{ fontSize: "12px" }} />

                        <span style={{ textTransform: "capitalize" }}>{batch.cropType}</span>

                        <span style={{ opacity: 0.7, fontSize: "11px" }}>{batch.quantity}kg</span>

                        {batch.currentRiskLevel && (

                          <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: getRiskStyles(batch.currentRiskLevel).bg, display: "inline-block" }} />

                        )}

                      </button>

                    ))}

                  </div>

                </div>
                                {/* Risk Loading */}
                {riskLoading && (
                  <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "40px", background: "white", borderRadius: "20px", color: colors.darkOlive }}>
                    <FaTractor style={{ fontSize: "36px", marginBottom: "10px" }} />
                    <p>Fetching risk assessment...</p>
                  </div>
                )}

                {/* Risk Assessment Card */}
                {!riskLoading && riskAssessment && (
                  <div style={{ background: "white", borderRadius: "20px", padding: "30px", boxShadow: "0 4px 20px rgba(65,67,27,0.08)", border: `1px solid ${colors.beige}`, gridColumn: "1/-1" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "25px" }}>
                      <div style={{ padding: "12px", background: colors.beige, borderRadius: "12px", color: colors.darkOlive, fontSize: "24px" }}><FaChartLine /></div>
                      <h2 style={{ margin: 0, color: colors.darkOlive, fontFamily: "Georgia, serif" }}>Risk Assessment — <span style={{ textTransform: "capitalize" }}>{selectedBatch?.cropType}</span></h2>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "25px", marginBottom: "30px" }}>
                      <div style={{ width: "80px", height: "80px", background: getRiskStyles(riskAssessment.riskLevel).bg, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "36px" }}>
                        {getRiskStyles(riskAssessment.riskLevel).icon}
                      </div>
                      <div>
                        <div style={{ fontSize: "28px", fontWeight: "bold", color: getRiskStyles(riskAssessment.riskLevel).bg }}>{getRiskStyles(riskAssessment.riskLevel).text}</div>
                        <div style={{ fontSize: "18px", color: "#666", marginTop: "5px" }}>Risk Score: <strong>{riskAssessment.riskScore}/100</strong></div>
                      </div>
                    </div>
                    <div style={{ background: colors.cream, borderRadius: "12px", padding: "20px", marginBottom: "20px" }}>
                      <h3 style={{ color: colors.darkOlive, margin: "0 0 15px 0" }}>AI Recommendations</h3>
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        {riskAssessment.recommendations.map((rec, i) => (
                          <div key={i} style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", background: "white", borderRadius: "10px", padding: "12px 16px" }}>
                            <span style={{ color: "#444", lineHeight: "1.6", flex: 1 }}>💡 {rec}</span>
                            <button
                              onClick={async () => {
                                try {
                                  await axios.post(`${API}/game/farmer/${farmer._id}/recommendation-followed`, { recommendationType: rec.slice(0, 40), impact: i === 0 ? "high" : "medium" });
                                  addAlert("✅ Marked as followed! Points earned.", "success");
                                  await fetchGamification();
                                } catch (err) { addAlert("Failed to record action.", "error"); }
                              }}
                              style={{ padding: "6px 14px", background: colors.darkOlive, color: colors.cream, border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "12px", fontWeight: "600", whiteSpace: "nowrap", flexShrink: 0 }}
                            >
                              ✓ I did this
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                    {riskAssessment.riskLevel === "Green" && (
                      <div style={{ background: "#dcfce7", borderRadius: "12px", padding: "16px 20px", marginBottom: "20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
                        <div>
                          <div style={{ fontWeight: "700", color: "#166534", marginBottom: "4px" }}>⚡ Great Storage Practices!</div>
                          <div style={{ fontSize: "13px", color: "#555" }}>Your crop is at low risk. Did you take early action to keep it this way? Claim your early intervention points!</div>
                        </div>
                        <button
                          onClick={async () => {
                            try {
                              await axios.post(`${API}/game/farmer/${farmer._id}/add-points`, { points: 20, action: "early_intervention", description: "Early intervention to prevent crop loss" });
                              addAlert("⚡ Early intervention recorded! +20 points earned.", "success");
                              await fetchGamification();
                            } catch (err) { addAlert("Failed to record early intervention.", "error"); }
                          }}
                          style={{ padding: "10px 20px", background: "#10b981", color: "white", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "700", fontSize: "14px", whiteSpace: "nowrap", flexShrink: 0 }}
                        >
                          ⚡ Claim Points
                        </button>
                      </div>
                    )}
                    {(riskAssessment.riskLevel === "Yellow" || riskAssessment.riskLevel === "Red") && (
                      <div style={{ background: riskAssessment.riskLevel === "Red" ? "#fee2e2" : "#fef9c3", borderRadius: "12px", padding: "16px 20px", marginBottom: "20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
                        <div>
                          <div style={{ fontWeight: "700", color: riskAssessment.riskLevel === "Red" ? "#991b1b" : "#854d0e", marginBottom: "4px" }}>
                            {riskAssessment.riskLevel === "Red" ? "🚨 High Risk Detected" : "⚠️ Medium Risk Detected"}
                          </div>
                          <div style={{ fontSize: "13px", color: "#555" }}>Have you taken action to reduce this risk? Mark it as mitigated to earn points.</div>
                        </div>
                        <button
                          onClick={async () => {
                            try {
                              await axios.post(`${API}/game/farmer/${farmer._id}/risk-mitigated`, { riskLevel: riskAssessment.riskLevel, action: "manual_mitigation", preventedLoss: selectedBatch?.quantity * 0.1 });
                              addAlert(`🛡️ Risk mitigation recorded! Points earned.`, "success");
                              await fetchGamification();
                            } catch (err) { addAlert("Failed to record mitigation.", "error"); }
                          }}
                          style={{ padding: "10px 20px", background: riskAssessment.riskLevel === "Red" ? "#ef4444" : "#f59e0b", color: "white", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "700", fontSize: "14px", whiteSpace: "nowrap", flexShrink: 0 }}
                        >
                          🛡️ Mark as Mitigated
                        </button>
                      </div>
                    )}
                    <div>
                      <h3 style={{ color: colors.darkOlive, margin: "0 0 15px 0" }}>Contributing Risk Factors</h3>
                      {riskAssessment.explanation.map((factor, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "12px 15px", backgroundColor: factor.exceeded ? "#fee2e2" : "#f0fdf4", borderRadius: "8px", marginBottom: "10px", borderLeft: `4px solid ${factor.exceeded ? "#ef4444" : "#10b981"}` }}>
                          <span style={{ color: "#444" }}>{factor.factor}: <strong>{factor.value}</strong></span>
                          <span style={{ fontWeight: "bold", color: factor.exceeded ? "#ef4444" : "#10b981" }}>{factor.contribution}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Weather Card */}
                {!riskLoading && weather && (
                  <div style={{ background: "white", borderRadius: "20px", padding: "30px", boxShadow: "0 4px 20px rgba(65,67,27,0.08)", border: `1px solid ${colors.beige}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "25px" }}>
                      <div style={{ padding: "12px", background: "#dbeafe", borderRadius: "12px", color: "#3b82f6", fontSize: "24px" }}><FaCloudSun /></div>
                      <h2 style={{ margin: 0, color: colors.darkOlive, fontFamily: "Georgia, serif" }}>Weather Conditions</h2>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
                      {[
                        { icon: <FaThermometerHalf />, label: "Temperature", value: `${weather.temperature}°C` },
                        { icon: <FaTint />, label: "Humidity", value: `${weather.humidity}%` },
                        { icon: <FaCloudRain />, label: "Rainfall", value: `${weather.rainfall}mm` }
                      ].map(item => (
                        <div key={item.label} style={{ textAlign: "center", padding: "20px", background: colors.cream, borderRadius: "12px" }}>
                          <div style={{ fontSize: "28px", color: colors.darkOlive, marginBottom: "8px" }}>{item.icon}</div>
                          <div style={{ fontSize: "12px", color: "#666", marginBottom: "5px" }}>{item.label}</div>
                          <div style={{ fontSize: "22px", fontWeight: "bold", color: colors.darkOlive }}>{item.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Market Card */}
                {!riskLoading && market && (
                  <div style={{ background: "white", borderRadius: "20px", padding: "30px", boxShadow: "0 4px 20px rgba(65,67,27,0.08)", border: `1px solid ${colors.beige}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "25px" }}>
                      <div style={{ padding: "12px", background: "#dcfce7", borderRadius: "12px", color: "#10b981", fontSize: "24px" }}><FaDollarSign /></div>
                      <h2 style={{ margin: 0, color: colors.darkOlive, fontFamily: "Georgia, serif" }}>Market Prices</h2>
                    </div>
                    <div style={{ textAlign: "center", padding: "30px", background: colors.cream, borderRadius: "12px" }}>
                      <div style={{ fontSize: "14px", color: "#666", marginBottom: "10px" }}>Current Price per kg</div>
                      <div style={{ fontSize: "36px", fontWeight: "bold", color: colors.darkOlive, marginBottom: "15px" }}>₹{market.price}/kg</div>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "8px 16px", background: market.trend === "rising" ? "#dcfce7" : market.trend === "falling" ? "#fee2e2" : "#f3f4f6", color: market.trend === "rising" ? "#10b981" : market.trend === "falling" ? "#ef4444" : "#6b7280", borderRadius: "20px", fontWeight: "600", fontSize: "14px" }}>
                        <FaChartLine />
                        {market.trend === "rising" ? "↑ Rising" : market.trend === "falling" ? "↓ Falling" : "→ Stable"}
                      </div>
                    </div>
                  </div>
                )}

                {/* Crop Batch Details */}
                {selectedBatch && (
                  <div style={{ background: "white", borderRadius: "20px", padding: "30px", boxShadow: "0 4px 20px rgba(65,67,27,0.08)", border: `1px solid ${colors.beige}`, gridColumn: "1/-1" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "25px" }}>
                      <div style={{ padding: "12px", background: colors.beige, borderRadius: "12px", color: colors.darkOlive, fontSize: "24px" }}><FaWarehouse /></div>
                      <h2 style={{ margin: 0, color: colors.darkOlive, fontFamily: "Georgia, serif" }}>Crop Batch Details</h2>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
                      {[
                        { icon: <FaSeedling />, label: "Crop Type", value: selectedBatch.cropType, capitalize: true },
                        { icon: <FaTractor />, label: "Quantity", value: `${selectedBatch.quantity} kg` },
                        { icon: <FaWarehouse />, label: "Storage", value: selectedBatch.storageMethod.replace(/_/g, " "), capitalize: true },
                        { icon: <FaCalendarAlt />, label: "Harvest Date", value: new Date(selectedBatch.harvestDate).toLocaleDateString() }
                      ].map(item => (
                        <div key={item.label} style={{ padding: "20px", background: colors.cream, borderRadius: "12px" }}>
                          <div style={{ fontSize: "12px", color: "#666", marginBottom: "5px", display: "flex", alignItems: "center", gap: "5px" }}>{item.icon} {item.label}</div>
                          <div style={{ fontSize: "18px", fontWeight: "bold", color: colors.darkOlive, textTransform: item.capitalize ? "capitalize" : "none" }}>{item.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Add Batch Modal */}
      {showAddBatch && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(65,67,27,0.6)", backdropFilter: "blur(5px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, padding: "20px" }}>
          <div style={{ background: "white", borderRadius: "20px", padding: "40px", width: "100%", maxWidth: "500px", boxShadow: "0 25px 50px rgba(0,0,0,0.3)" }}>
            <div style={{ textAlign: "center", marginBottom: "30px" }}>
              <div style={{ width: "60px", height: "60px", background: `linear-gradient(135deg, ${colors.darkOlive}, ${colors.sage})`, borderRadius: "50%", margin: "0 auto 15px", display: "flex", alignItems: "center", justifyContent: "center", color: colors.cream, fontSize: "24px" }}>
                <FaPlus />
              </div>
              <h2 style={{ margin: 0, color: colors.darkOlive, fontFamily: "Georgia, serif" }}>Add New Crop Batch</h2>
            </div>
            <form onSubmit={handleAddBatch}>
              {[
                { label: "Crop Type", type: "select", key: "cropType", options: [{ v: "", l: "Select crop type" }, { v: "banana", l: "Banana" }, { v: "rice", l: "Rice" }, { v: "wheat", l: "Wheat" }, { v: "onion", l: "Onion" }, { v: "tomato", l: "Tomato" }, { v: "potato", l: "Potato" }] },
              ].map(field => (
                <div key={field.key} style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", marginBottom: "8px", color: colors.darkOlive, fontWeight: "600" }}>{field.label}</label>
                  <select value={newBatch.cropType} onChange={e => setNewBatch({ ...newBatch, cropType: e.target.value })} style={{ width: "100%", padding: "12px", borderRadius: "10px", border: `2px solid ${colors.beige}`, fontSize: "15px", background: colors.cream }} required>
                    {field.options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                  </select>
                </div>
              ))}
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "8px", color: colors.darkOlive, fontWeight: "600" }}>Quantity (kg)</label>
                <input type="number" value={newBatch.quantity} onChange={e => setNewBatch({ ...newBatch, quantity: e.target.value })} style={{ width: "100%", padding: "12px", borderRadius: "10px", border: `2px solid ${colors.beige}`, fontSize: "15px", background: colors.cream }} placeholder="Enter quantity in kg" required />
              </div>
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "8px", color: colors.darkOlive, fontWeight: "600" }}>Storage Method</label>
                <select value={newBatch.storageMethod} onChange={e => setNewBatch({ ...newBatch, storageMethod: e.target.value })} style={{ width: "100%", padding: "12px", borderRadius: "10px", border: `2px solid ${colors.beige}`, fontSize: "15px", background: colors.cream }}>
                  <option value="open_air">Open Air</option>
                  <option value="dry_warehouse">Dry Warehouse</option>
                  <option value="cold_storage">Cold Storage</option>
                  <option value="refrigerated_transport">Refrigerated Transport</option>
                </select>
              </div>
              <div style={{ marginBottom: "30px" }}>
                <label style={{ display: "block", marginBottom: "8px", color: colors.darkOlive, fontWeight: "600" }}>Harvest Date</label>
                <input type="date" value={newBatch.harvestDate} onChange={e => setNewBatch({ ...newBatch, harvestDate: e.target.value })} style={{ width: "100%", padding: "12px", borderRadius: "10px", border: `2px solid ${colors.beige}`, fontSize: "15px", background: colors.cream }} required />
              </div>
              <div style={{ display: "flex", gap: "15px" }}>
                <button type="button" onClick={() => { setShowAddBatch(false); setNewBatch({ cropType: "", quantity: "", storageMethod: "dry_warehouse", harvestDate: new Date().toISOString().split("T")[0] }); }} style={{ flex: 1, padding: "14px", background: colors.beige, color: colors.darkOlive, border: "none", borderRadius: "10px", cursor: "pointer", fontSize: "15px", fontWeight: "600" }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: "14px", background: `linear-gradient(135deg, ${colors.darkOlive}, ${colors.sage})`, color: colors.cream, border: "none", borderRadius: "10px", cursor: "pointer", fontSize: "15px", fontWeight: "600" }}>Add Batch</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>
    </div>
  );
};

export default FarmerDashboard;
