import React, { useEffect, useState } from "react";
import "./App.css";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { FaLandmark, FaArrowLeft, FaSyncAlt } from "react-icons/fa";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";
import { CSVLink } from "react-csv";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Bar, Pie } from "react-chartjs-2";
import "chart.js/auto";
import API_BASE_URL from "./config/api";

// jsPDF v4+ uses a named export; support both v3 and v4
const JsPDF = jsPDF.jsPDF || jsPDF;


const colors = {
  darkOlive: "#41431B",
  sage: "#AEB784",
  beige: "#E3DBBB",
  cream: "#F8F3E1",
};

// Heatmap layer component
const HeatmapLayer = ({ points }) => {
  const map = useMap();
  useEffect(() => {
    if (!points || points.length === 0) return;
    if (!L.heatLayer) {
      console.warn("leaflet.heat plugin not loaded");
      return;
    }
    const heat = L.heatLayer(points, {
      radius: 50,
      blur: 30,
      maxZoom: 17,
      max: 0.3,
      minOpacity: 0.6,
      gradient: { 0.3: "#28a745", 0.6: "#fd7e14", 1.0: "#dc3545" }
    }).addTo(map);

    // Zoom into the points so heatmap is visible
    if (points.length > 0) {
      const latlngs = points.map(p => [p[0], p[1]]);
      try { map.fitBounds(L.latLngBounds(latlngs), { padding: [60, 60], maxZoom: 8 }); } catch(e) {}
    }

    return () => {
      try { map.removeLayer(heat); } catch(e) {}
    };
  }, [map, points]);
  return null;
};

const getRiskColor = (risk) => {
  if (risk === "High") return "#dc3545";
  if (risk === "Medium") return "#fd7e14";
  if (risk === "Low") return "#28a745";
  return "#6c757d";
};

const getRiskBg = (risk) => {
  if (risk === "High") return "#fff5f5";
  if (risk === "Medium") return "#fff8f0";
  if (risk === "Low") return "#f0fff4";
  return "#f8f9fa";
};

const createMarkerIcon = (risk) => {
  const color = getRiskColor(risk);
  return L.divIcon({
    html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 0 6px rgba(0,0,0,0.4);"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    className: "",
  });
};

const PolicymakerDashboard = ({ onBackToLanding }) => {
  const [farmers, setFarmers] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [viewMode, setViewMode] = useState("cluster");
  const [selectedCrop, setSelectedCrop] = useState("");
  const [selectedRegions, setSelectedRegions] = useState([]);
  const [showLow, setShowLow] = useState(true);
  const [showMedium, setShowMedium] = useState(true);
  const [showHigh, setShowHigh] = useState(true);
  const [searchName, setSearchName] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortDir, setSortDir] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  const fetchData = () => {
    setLoadingData(true);
    setLoadError("");
    fetch(`${API_BASE_URL}/weather/farmers/risk`)
      .then((res) => {
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setFarmers(Array.isArray(data) ? data : []);
        setLoadingData(false);
      })
      .catch((err) => {
        console.error("Dashboard fetch error:", err);
        setLoadError("Could not load farmer data. Make sure the backend is running on port 5000.");
        setLoadingData(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Derived lists for filters
  const uniqueCrops = Array.from(
    new Set(farmers.map((f) => f.farmer?.cropType?.toLowerCase()).filter(Boolean))
  ).sort();

  const uniqueRegions = Array.from(
    new Set(farmers.map((f) => f.farmer?.region?.toLowerCase()).filter(Boolean))
  ).sort();

  const resetFilters = () => {
    setSelectedCrop("");
    setSelectedRegions([]);
    setShowLow(true);
    setShowMedium(true);
    setShowHigh(true);
    setSearchName("");
    setCurrentPage(1);
  };

  // Filter
  const filteredFarmers = farmers.filter((f) => {
    const cropMatch = selectedCrop
      ? f.farmer?.cropType?.toLowerCase() === selectedCrop
      : true;
    const riskMatch =
      (showLow && f.risk === "Low") ||
      (showMedium && f.risk === "Medium") ||
      (showHigh && f.risk === "High") ||
      f.risk === "Unknown";
    const regionMatch =
      selectedRegions.length > 0
        ? selectedRegions.includes(f.farmer?.region?.toLowerCase())
        : true;
    const nameMatch = searchName.trim()
      ? f.farmer?.name?.toLowerCase().includes(searchName.toLowerCase())
      : true;
    return cropMatch && riskMatch && regionMatch && nameMatch;
  });

  // Sort
  const sortedFarmers = [...filteredFarmers].sort((a, b) => {
    let aVal = "";
    let bVal = "";
    if (sortField === "name") { aVal = a.farmer?.name || ""; bVal = b.farmer?.name || ""; }
    else if (sortField === "crop") { aVal = a.farmer?.cropType || ""; bVal = b.farmer?.cropType || ""; }
    else if (sortField === "region") { aVal = a.farmer?.region || ""; bVal = b.farmer?.region || ""; }
    else if (sortField === "risk") {
      const order = { High: 0, Medium: 1, Low: 2, Unknown: 3 };
      aVal = order[a.risk] ?? 3;
      bVal = order[b.risk] ?? 3;
      return sortDir === "asc" ? aVal - bVal : bVal - aVal;
    }
    const cmp = aVal.localeCompare(bVal);
    return sortDir === "asc" ? cmp : -cmp;
  });

  // Paginate
  const totalPages = Math.max(1, Math.ceil(sortedFarmers.length / PAGE_SIZE));
  const pagedFarmers = sortedFarmers.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleSort = (field) => {
    if (sortField === field) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  };

  const sortIcon = (field) => {
    if (sortField !== field) return " ↕";
    return sortDir === "asc" ? " ↑" : " ↓";
  };

  // Stats
  const riskCounts = filteredFarmers.reduce(
    (acc, f) => { acc[f.risk] = (acc[f.risk] || 0) + 1; return acc; },
    { Low: 0, Medium: 0, High: 0, Unknown: 0 }
  );
  const total = filteredFarmers.length;
  const totalAll = farmers.length;

  // Crop breakdown for filtered set
  const cropBreakdown = filteredFarmers.reduce((acc, f) => {
    const c = f.farmer?.cropType || "Unknown";
    acc[c] = (acc[c] || 0) + 1;
    return acc;
  }, {});

  // Region breakdown
  const regionBreakdown = filteredFarmers.reduce((acc, f) => {
    const r = f.farmer?.region || "Unknown";
    acc[r] = (acc[r] || 0) + 1;
    return acc;
  }, {});

  // Chart data
  const barData = {
    labels: ["Low Risk", "Medium Risk", "High Risk"],
    datasets: [{
      label: "Farmers",
      data: [riskCounts.Low, riskCounts.Medium, riskCounts.High],
      backgroundColor: ["#28a745", "#fd7e14", "#dc3545"],
      borderRadius: 6,
    }],
  };

  const pieData = {
    labels: Object.keys(cropBreakdown),
    datasets: [{
      data: Object.values(cropBreakdown),
      backgroundColor: ["#41431B","#AEB784","#E3DBBB","#6c757d","#17a2b8","#ffc107","#dc3545","#28a745"],
    }],
  };

  const regionBarData = {
    labels: Object.keys(regionBreakdown),
    datasets: [{
      label: "Farmers by Region",
      data: Object.values(regionBreakdown),
      backgroundColor: "#AEB784",
      borderRadius: 4,
    }],
  };

  // Heatmap points
  const heatmapPoints = filteredFarmers
    .filter((f) => f.farmer?.latitude != null && f.farmer?.longitude != null)
    .map((f) => [
      f.farmer.latitude,
      f.farmer.longitude,
      f.risk === "High" ? 1.0 : f.risk === "Medium" ? 0.8 : 0.6,
    ]);

  // Export helpers
  const exportExcel = () => {
    const rows = filteredFarmers.map((f) => ({
      Name: f.farmer?.name || "",
      Crop: f.farmer?.cropType || "",
      Region: f.farmer?.region || "",
      Latitude: f.farmer?.latitude || "",
      Longitude: f.farmer?.longitude || "",
      Mobile: f.farmer?.mobileNumber || "",
      Risk: f.risk || "",
      Temperature: f.weather?.temp ?? "",
      Humidity: f.weather?.humidity ?? "",
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Farmers");
    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buf], { type: "application/octet-stream" }), "farmer_risk_report.xlsx");
  };

  const exportMapImage = (format) => {
    const el = document.getElementById("policymap");
    if (!el) return;
    html2canvas(el, {
      useCORS: true,
      allowTaint: true,
      logging: false,
      scale: 2,
    }).then((canvas) => {
      if (format === "png") {
        canvas.toBlob((blob) => saveAs(blob, "risk_map.png"));
      } else {
        const pdf = new JsPDF("landscape", "mm", "a4");
        const imgData = canvas.toDataURL("image/png");
        const pageW = pdf.internal.pageSize.getWidth();
        const pageH = pdf.internal.pageSize.getHeight();
        // Header bar
        pdf.setFillColor(65, 67, 27);
        pdf.rect(0, 0, pageW, 18, "F");
        pdf.setTextColor(248, 243, 225);
        pdf.setFontSize(13);
        pdf.setFont("helvetica", "bold");
        pdf.text("AI Post-Harvest Loss Intelligence System — Risk Map", 10, 12);
        pdf.setFontSize(9);
        pdf.setFont("helvetica", "normal");
        pdf.text(`Generated: ${new Date().toLocaleString()}  |  View: ${viewMode === "heatmap" ? "Heatmap" : "Marker"}  |  Farmers shown: ${total}`, 10, 17);
        // Map image
        const mapH = pageH - 30;
        pdf.addImage(imgData, "PNG", 5, 20, pageW - 10, mapH);
        // Legend
        pdf.setFontSize(8);
        pdf.setTextColor(50);
        pdf.text("Risk Legend:", 10, pageH - 4);
        [["#28a745","Low Risk"], ["#fd7e14","Medium Risk"], ["#dc3545","High Risk"]].forEach(([color, label], i) => {
          const x = 40 + i * 45;
          pdf.setFillColor(parseInt(color.slice(1,3),16), parseInt(color.slice(3,5),16), parseInt(color.slice(5,7),16));
          pdf.circle(x, pageH - 5, 2, "F");
          pdf.setTextColor(50);
          pdf.text(label, x + 4, pageH - 3);
        });
        pdf.save("risk_map.pdf");
      }
    });
  };

  const exportFullReport = async () => {
    const pdf = new JsPDF("portrait", "mm", "a4");
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const olive = [65, 67, 27];
    const sage = [174, 183, 132];
    const cream = [248, 243, 225];

    // ── PAGE 1: Cover ──
    pdf.setFillColor(...olive);
    pdf.rect(0, 0, pageW, 60, "F");
    pdf.setFillColor(...sage);
    pdf.rect(0, 60, pageW, 4, "F");

    pdf.setTextColor(...cream);
    pdf.setFontSize(22);
    pdf.setFont("helvetica", "bold");
    pdf.text("AI-Based Post-Harvest Loss", 15, 25);
    pdf.text("Intelligence System", 15, 36);
    pdf.setFontSize(13);
    pdf.setFont("helvetica", "normal");
    pdf.text("Policymaker Dashboard Report", 15, 50);

    pdf.setTextColor(80, 80, 80);
    pdf.setFontSize(10);
    pdf.text(`Generated: ${new Date().toLocaleString()}`, 15, 75);
    pdf.text(`Report covers ${totalAll} registered farmer(s)`, 15, 83);

    // Summary boxes
    const boxes = [
      { label: "Total Farmers", value: totalAll, color: olive },
      { label: "High Risk", value: riskCounts.High, color: [220, 53, 69] },
      { label: "Medium Risk", value: riskCounts.Medium, color: [253, 126, 20] },
      { label: "Low Risk", value: riskCounts.Low, color: [40, 167, 69] },
    ];
    boxes.forEach((box, i) => {
      const x = 15 + i * 46;
      const y = 95;
      pdf.setFillColor(...box.color);
      pdf.roundedRect(x, y, 42, 28, 3, 3, "F");
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(20);
      pdf.setFont("helvetica", "bold");
      pdf.text(String(box.value), x + 21, y + 16, { align: "center" });
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "normal");
      pdf.text(box.label, x + 21, y + 23, { align: "center" });
    });

    // Risk % bar
    const barY = 135;
    pdf.setTextColor(80);
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    pdf.text("Risk Distribution", 15, barY);
    const barTotal = (riskCounts.High + riskCounts.Medium + riskCounts.Low) || 1;
    const barW = pageW - 30;
    let barX = 15;
    [
      { count: riskCounts.High, color: [220, 53, 69] },
      { count: riskCounts.Medium, color: [253, 126, 20] },
      { count: riskCounts.Low, color: [40, 167, 69] },
    ].forEach(({ count, color }) => {
      const w = (count / barTotal) * barW;
      if (w > 0) {
        pdf.setFillColor(...color);
        pdf.rect(barX, barY + 4, w, 10, "F");
        if (w > 15) {
          pdf.setTextColor(255);
          pdf.setFontSize(8);
          pdf.text(`${Math.round((count/barTotal)*100)}%`, barX + w/2, barY + 11, { align: "center" });
        }
        barX += w;
      }
    });

    // Crop breakdown table
    const cropY = 165;
    pdf.setTextColor(80);
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    pdf.text("Crop Breakdown", 15, cropY);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    let cy = cropY + 8;
    Object.entries(cropBreakdown).forEach(([crop, count], i) => {
      if (i % 2 === 0) { pdf.setFillColor(245, 245, 245); pdf.rect(15, cy - 4, pageW - 30, 8, "F"); }
      pdf.setTextColor(60);
      pdf.text(crop.charAt(0).toUpperCase() + crop.slice(1), 20, cy);
      pdf.text(String(count) + " farmer(s)", pageW - 30, cy, { align: "right" });
      cy += 9;
    });

    // ── PAGE 2: Farmer Table ──
    pdf.addPage();
    pdf.setFillColor(...olive);
    pdf.rect(0, 0, pageW, 14, "F");
    pdf.setTextColor(...cream);
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text("Farmer Risk Details", 10, 10);

    const headers = ["Name", "Crop", "Region", "Mobile", "Temp°C", "Humidity%", "Risk"];
    const colW = [38, 25, 30, 30, 18, 22, 20];
    let tableY = 22;
    let colX = 10;

    // Table header
    pdf.setFillColor(...sage);
    pdf.rect(10, tableY - 5, pageW - 20, 8, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "bold");
    headers.forEach((h, i) => {
      pdf.text(h, colX, tableY);
      colX += colW[i];
    });
    tableY += 6;

    // Table rows
    pdf.setFont("helvetica", "normal");
    filteredFarmers.forEach((f, idx) => {
      if (tableY > pageH - 15) {
        pdf.addPage();
        tableY = 20;
        pdf.setFillColor(...sage);
        pdf.rect(10, tableY - 5, pageW - 20, 8, "F");
        pdf.setTextColor(255);
        pdf.setFontSize(8);
        pdf.setFont("helvetica", "bold");
        colX = 10;
        headers.forEach((h, i) => { pdf.text(h, colX, tableY); colX += colW[i]; });
        tableY += 6;
        pdf.setFont("helvetica", "normal");
      }
      if (idx % 2 === 0) { pdf.setFillColor(248, 248, 248); pdf.rect(10, tableY - 4, pageW - 20, 7, "F"); }
      const riskColor = f.risk === "High" ? [220,53,69] : f.risk === "Medium" ? [253,126,20] : [40,167,69];
      const row = [
        f.farmer?.name || "—",
        f.farmer?.cropType || "—",
        f.farmer?.region || "—",
        f.farmer?.mobileNumber || "—",
        f.weather?.temp != null ? f.weather.temp.toFixed(1) : "—",
        f.weather?.humidity != null ? String(f.weather.humidity) : "—",
        f.risk || "—",
      ];
      colX = 10;
      row.forEach((val, i) => {
        if (i === 6) pdf.setTextColor(...riskColor);
        else pdf.setTextColor(60);
        pdf.setFontSize(8);
        pdf.text(String(val).slice(0, 18), colX, tableY);
        colX += colW[i];
      });
      tableY += 7;
    });

    // ── PAGE 3: Map ──
    pdf.addPage();
    pdf.setFillColor(...olive);
    pdf.rect(0, 0, pageW, 14, "F");
    pdf.setTextColor(...cream);
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text("Farmer Risk Map", 10, 10);

    const mapEl = document.getElementById("policymap");
    if (mapEl) {
      try {
        const mapCanvas = await html2canvas(mapEl, { useCORS: true, allowTaint: true, scale: 2, logging: false });
        const mapImg = mapCanvas.toDataURL("image/png");
        pdf.addImage(mapImg, "PNG", 10, 18, pageW - 20, 120);
      } catch(e) {
        pdf.setTextColor(150);
        pdf.setFontSize(10);
        pdf.text("Map capture unavailable (cross-origin tiles)", 10, 40);
      }
    }

    // Legend
    const legY = 145;
    pdf.setTextColor(80);
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "bold");
    pdf.text("Map Legend:", 10, legY);
    [[[40,167,69],"Low Risk"], [[253,126,20],"Medium Risk"], [[220,53,69],"High Risk"]].forEach(([color, label], i) => {
      const lx = 40 + i * 50;
      pdf.setFillColor(...color);
      pdf.circle(lx, legY - 1, 3, "F");
      pdf.setTextColor(60);
      pdf.setFont("helvetica", "normal");
      pdf.text(label, lx + 6, legY);
    });

    // Footer on all pages
    const totalPdfPages = pdf.internal.getNumberOfPages();
    for (let p = 1; p <= totalPdfPages; p++) {
      pdf.setPage(p);
      pdf.setFillColor(...sage);
      pdf.rect(0, pageH - 8, pageW, 8, "F");
      pdf.setTextColor(255);
      pdf.setFontSize(7);
      pdf.text("AI Post-Harvest Loss Intelligence System  |  Confidential Policymaker Report", 10, pageH - 3);
      pdf.text(`Page ${p} of ${totalPdfPages}`, pageW - 10, pageH - 3, { align: "right" });
    }

    pdf.save("Policymaker_Full_Report.pdf");
  };

  const csvData = filteredFarmers.map((f) => ({
    Name: f.farmer?.name || "",
    Crop: f.farmer?.cropType || "",
    Region: f.farmer?.region || "",
    Latitude: f.farmer?.latitude || "",
    Longitude: f.farmer?.longitude || "",
    Mobile: f.farmer?.mobileNumber || "",
    Risk: f.risk || "",
    Temperature: f.weather?.temp ?? "",
    Humidity: f.weather?.humidity ?? "",
  }));

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: colors.cream, fontFamily: "Inter, system-ui, sans-serif" }}>

      {/* ── Header ── */}
      <header style={{
        background: `linear-gradient(135deg, ${colors.darkOlive} 0%, ${colors.sage} 100%)`,
        padding: "18px 40px",
        color: colors.cream,
        boxShadow: "0 4px 20px rgba(65,67,27,0.3)",
        position: "sticky",
        top: 0,
        zIndex: 1000,
      }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ width: 46, height: 46, background: colors.cream, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: colors.darkOlive, fontSize: 22 }}>
              <FaLandmark />
            </div>
            <div>
              <h1 style={{ margin: 0, fontFamily: "Georgia, serif", fontSize: "1.6rem" }}>Policymaker Dashboard</h1>
              <p style={{ margin: "3px 0 0", opacity: 0.85, fontSize: "0.85rem" }}>Agricultural Intelligence & Risk Analysis</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={fetchData} style={{ padding: "10px 18px", background: "rgba(255,255,255,0.15)", color: colors.cream, border: `1.5px solid ${colors.cream}`, borderRadius: 8, cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
              <FaSyncAlt /> Refresh
            </button>
            <button onClick={onBackToLanding} style={{ padding: "10px 18px", background: "rgba(255,255,255,0.15)", color: colors.cream, border: `1.5px solid ${colors.cream}`, borderRadius: 8, cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
              <FaArrowLeft /> Back to Home
            </button>
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main style={{ maxWidth: "1400px", margin: "30px auto 60px", padding: "0 24px" }}>

        {/* Loading */}
        {loadingData && (
          <div style={{ textAlign: "center", padding: "80px 0", color: colors.darkOlive }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>⏳</div>
            <p style={{ fontSize: 18, fontWeight: 600 }}>Loading farmer data...</p>
            <p style={{ color: "#888", fontSize: 14 }}>Fetching weather and risk information for all farmers</p>
          </div>
        )}

        {/* Error */}
        {!loadingData && loadError && (
          <div style={{ background: "#fff5f5", border: "1px solid #fcc", borderRadius: 12, padding: "24px 32px", textAlign: "center", margin: "40px 0" }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>⚠️</div>
            <p style={{ color: "#c33", fontSize: 16, fontWeight: 600, margin: "0 0 8px" }}>{loadError}</p>
            <button onClick={fetchData} style={{ marginTop: 12, padding: "10px 24px", background: colors.darkOlive, color: colors.cream, border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>
              Try Again
            </button>
          </div>
        )}

        {/* Empty */}
        {!loadingData && !loadError && farmers.length === 0 && (
          <div style={{ textAlign: "center", padding: "80px 0", color: "#888" }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🌾</div>
            <p style={{ fontSize: 18, fontWeight: 600 }}>No farmers registered yet</p>
            <p style={{ fontSize: 14 }}>Register farmers first to see risk data here.</p>
          </div>
        )}

        {/* Dashboard content */}
        {!loadingData && !loadError && farmers.length > 0 && (
          <>
            {/* ── KPI Cards ── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginBottom: 28 }}>
              {[
                { label: "Total Farmers", value: totalAll, color: colors.darkOlive, bg: colors.beige },
                { label: "Showing", value: total, color: "#495057", bg: "#f8f9fa" },
                { label: "High Risk", value: riskCounts.High, color: "#dc3545", bg: "#fff5f5" },
                { label: "Medium Risk", value: riskCounts.Medium, color: "#fd7e14", bg: "#fff8f0" },
                { label: "Low Risk", value: riskCounts.Low, color: "#28a745", bg: "#f0fff4" },
              ].map((card) => (
                <div key={card.label} style={{ background: card.bg, border: `1px solid ${card.color}30`, borderRadius: 12, padding: "18px 20px", textAlign: "center" }}>
                  <div style={{ fontSize: 28, fontWeight: 700, color: card.color }}>{card.value}</div>
                  <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>{card.label}</div>
                </div>
              ))}
            </div>

            <div className="dashboard-grid">
              {/* ── Left: Filters ── */}
              <div>
                <div className="panel">
                  <h3>🔍 Filters</h3>

                  {/* Search */}
                  <div className="filter-section">
                    <label>Search by Name</label>
                    <input
                      type="text"
                      placeholder="Farmer name..."
                      value={searchName}
                      onChange={(e) => { setSearchName(e.target.value); setCurrentPage(1); }}
                      style={{ width: "100%", padding: "7px 10px", borderRadius: 6, border: "1px solid #ccc", fontSize: 13, boxSizing: "border-box" }}
                    />
                  </div>

                  {/* Crop */}
                  <div className="filter-section">
                    <label>Crop Type</label>
                    <select
                      value={selectedCrop}
                      onChange={(e) => { setSelectedCrop(e.target.value); setCurrentPage(1); }}
                      style={{ width: "100%", padding: "7px 10px", borderRadius: 6, border: "1px solid #ccc", fontSize: 13 }}
                    >
                      <option value="">All Crops ({uniqueCrops.length})</option>
                      {uniqueCrops.map((c) => (
                        <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                      ))}
                    </select>
                  </div>

                  {/* Risk Level */}
                  <div className="filter-section">
                    <label style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>Risk Level</label>
                    {[
                      { key: "showHigh", label: "High Risk", color: "#dc3545", val: showHigh, set: setShowHigh },
                      { key: "showMedium", label: "Medium Risk", color: "#fd7e14", val: showMedium, set: setShowMedium },
                      { key: "showLow", label: "Low Risk", color: "#28a745", val: showLow, set: setShowLow },
                    ].map((item) => (
                      <label key={item.key} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, cursor: "pointer" }}>
                        <input type="checkbox" checked={item.val} onChange={() => { item.set(!item.val); setCurrentPage(1); }} />
                        <span style={{ color: item.color, fontWeight: 600, fontSize: 13 }}>{item.label}</span>
                        <span style={{ marginLeft: "auto", background: item.color + "20", color: item.color, borderRadius: 10, padding: "1px 8px", fontSize: 11, fontWeight: 700 }}>
                          {item.key === "showHigh" ? riskCounts.High : item.key === "showMedium" ? riskCounts.Medium : riskCounts.Low}
                        </span>
                      </label>
                    ))}
                  </div>

                  {/* Region */}
                  <div className="filter-section">
                    <label style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>
                      Region {uniqueRegions.length > 0 ? `(${uniqueRegions.length})` : ""}
                    </label>
                    {uniqueRegions.length === 0 ? (
                      <span style={{ color: "#999", fontSize: 12 }}>No region data available</span>
                    ) : (
                      <div style={{ maxHeight: 180, overflowY: "auto" }}>
                        {uniqueRegions.map((r) => (
                          <label key={r} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5, cursor: "pointer", fontSize: 13 }}>
                            <input
                              type="checkbox"
                              checked={selectedRegions.includes(r)}
                              onChange={(e) => {
                                setCurrentPage(1);
                                if (e.target.checked) setSelectedRegions([...selectedRegions, r]);
                                else setSelectedRegions(selectedRegions.filter((x) => x !== r));
                              }}
                            />
                            {r.charAt(0).toUpperCase() + r.slice(1)}
                            <span style={{ marginLeft: "auto", color: "#888", fontSize: 11 }}>
                              ({farmers.filter((f) => f.farmer?.region?.toLowerCase() === r).length})
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  <button className="btn btn-secondary" onClick={resetFilters} style={{ width: "100%" }}>
                    Clear All Filters
                  </button>
                </div>

                {/* Active filter tags */}
                {(selectedCrop || selectedRegions.length > 0 || searchName || !showLow || !showMedium || !showHigh) && (
                  <div className="panel" style={{ padding: "10px 14px" }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "#666", marginBottom: 6 }}>ACTIVE FILTERS</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                      {selectedCrop && (
                        <span style={{ background: "#d1ecf1", color: "#0c5460", borderRadius: 12, padding: "3px 10px", fontSize: 11, display: "flex", alignItems: "center", gap: 4 }}>
                          Crop: {selectedCrop}
                          <button onClick={() => setSelectedCrop("")} style={{ border: "none", background: "none", cursor: "pointer", fontWeight: 700, padding: 0, lineHeight: 1 }}>×</button>
                        </span>
                      )}
                      {searchName && (
                        <span style={{ background: "#e2e3e5", color: "#383d41", borderRadius: 12, padding: "3px 10px", fontSize: 11, display: "flex", alignItems: "center", gap: 4 }}>
                          Name: {searchName}
                          <button onClick={() => setSearchName("")} style={{ border: "none", background: "none", cursor: "pointer", fontWeight: 700, padding: 0, lineHeight: 1 }}>×</button>
                        </span>
                      )}
                      {selectedRegions.map((r) => (
                        <span key={r} style={{ background: "#e2e3e5", color: "#383d41", borderRadius: 12, padding: "3px 10px", fontSize: 11, display: "flex", alignItems: "center", gap: 4 }}>
                          {r.charAt(0).toUpperCase() + r.slice(1)}
                          <button onClick={() => setSelectedRegions(selectedRegions.filter((x) => x !== r))} style={{ border: "none", background: "none", cursor: "pointer", fontWeight: 700, padding: 0, lineHeight: 1 }}>×</button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* ── Right: Content ── */}
              <div>
                {/* Charts */}
                <div id="pm-charts" className="charts-row" style={{ marginBottom: 24 }}>
                  <div style={{ flex: 1, background: "#fff", borderRadius: 12, padding: 16, border: "1px solid #eee" }}>
                    <h4 style={{ margin: "0 0 12px", color: colors.darkOlive, fontSize: 14 }}>Risk Distribution</h4>
                    <Bar data={barData} options={{ plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }} />
                  </div>
                  <div style={{ flex: 1, background: "#fff", borderRadius: 12, padding: 16, border: "1px solid #eee" }}>
                    <h4 style={{ margin: "0 0 12px", color: colors.darkOlive, fontSize: 14 }}>Crop Breakdown</h4>
                    {Object.keys(cropBreakdown).length > 0
                      ? <Pie data={pieData} options={{ plugins: { legend: { position: "bottom", labels: { font: { size: 11 } } } } }} />
                      : <p style={{ color: "#999", textAlign: "center", paddingTop: 40 }}>No data</p>
                    }
                  </div>
                  {Object.keys(regionBreakdown).length > 1 && (
                    <div style={{ flex: 1, background: "#fff", borderRadius: 12, padding: 16, border: "1px solid #eee" }}>
                      <h4 style={{ margin: "0 0 12px", color: colors.darkOlive, fontSize: 14 }}>Farmers by Region</h4>
                      <Bar data={regionBarData} options={{ plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }, indexAxis: Object.keys(regionBreakdown).length > 5 ? "y" : "x" }} />
                    </div>
                  )}
                </div>

                {/* Table */}
                <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #eee", overflow: "hidden", marginBottom: 20 }}>
                  <div style={{ padding: "14px 20px", borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h3 style={{ margin: 0, color: colors.darkOlive, fontSize: 15 }}>
                      Farmer Risk Table
                      <span style={{ marginLeft: 8, background: colors.beige, color: colors.darkOlive, borderRadius: 10, padding: "2px 10px", fontSize: 12 }}>{total}</span>
                    </h3>
                    <span style={{ fontSize: 12, color: "#888" }}>Click column headers to sort</span>
                  </div>
                  <div style={{ overflowX: "auto" }}>
                    <table id="pm-table" className="risk-table" style={{ margin: 0 }}>
                      <thead>
                        <tr>
                          <th onClick={() => handleSort("name")} style={{ cursor: "pointer", userSelect: "none" }}>Name{sortIcon("name")}</th>
                          <th onClick={() => handleSort("crop")} style={{ cursor: "pointer", userSelect: "none" }}>Crop{sortIcon("crop")}</th>
                          <th onClick={() => handleSort("region")} style={{ cursor: "pointer", userSelect: "none" }}>Region{sortIcon("region")}</th>
                          <th>Mobile</th>
                          <th>Temp (°C)</th>
                          <th>Humidity (%)</th>
                          <th onClick={() => handleSort("risk")} style={{ cursor: "pointer", userSelect: "none" }}>Risk{sortIcon("risk")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pagedFarmers.length === 0 ? (
                          <tr><td colSpan={7} style={{ textAlign: "center", padding: "30px", color: "#999" }}>No farmers match the current filters</td></tr>
                        ) : (
                          pagedFarmers.map((f, i) => (
                            <tr key={i} style={{ background: getRiskBg(f.risk) }}>
                              <td style={{ fontWeight: 600 }}>{f.farmer?.name || "—"}</td>
                              <td>
                                <span
                                  style={{ cursor: "pointer", color: "#007BFF", textDecoration: "underline" }}
                                  onClick={() => { setSelectedCrop(f.farmer?.cropType?.toLowerCase() || ""); setCurrentPage(1); }}
                                  title="Filter by this crop"
                                >
                                  {f.farmer?.cropType ? f.farmer.cropType.charAt(0).toUpperCase() + f.farmer.cropType.slice(1) : "—"}
                                </span>
                              </td>
                              <td>
                                <span
                                  style={{ cursor: "pointer", color: "#6c757d", textDecoration: f.farmer?.region ? "underline" : "none" }}
                                  onClick={() => {
                                    if (f.farmer?.region) {
                                      const r = f.farmer.region.toLowerCase();
                                      if (!selectedRegions.includes(r)) setSelectedRegions([...selectedRegions, r]);
                                      setCurrentPage(1);
                                    }
                                  }}
                                  title={f.farmer?.region ? "Filter by this region" : ""}
                                >
                                  {f.farmer?.region || "—"}
                                </span>
                              </td>
                              <td style={{ color: "#555" }}>{f.farmer?.mobileNumber || "—"}</td>
                              <td style={{ textAlign: "center" }}>{f.weather?.temp != null ? f.weather.temp.toFixed(1) : "—"}</td>
                              <td style={{ textAlign: "center" }}>{f.weather?.humidity != null ? f.weather.humidity : "—"}</td>
                              <td>
                                <span style={{
                                  background: getRiskColor(f.risk) + "20",
                                  color: getRiskColor(f.risk),
                                  fontWeight: 700,
                                  borderRadius: 8,
                                  padding: "3px 10px",
                                  fontSize: 12,
                                  whiteSpace: "nowrap",
                                }}>
                                  {f.risk || "—"}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div style={{ padding: "12px 20px", borderTop: "1px solid #eee", display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
                      <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="btn btn-secondary" style={{ padding: "4px 10px", fontSize: 12 }}>«</button>
                      <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="btn btn-secondary" style={{ padding: "4px 10px", fontSize: 12 }}>‹</button>
                      <span style={{ fontSize: 13, color: "#555" }}>Page {currentPage} of {totalPages}</span>
                      <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="btn btn-secondary" style={{ padding: "4px 10px", fontSize: 12 }}>›</button>
                      <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="btn btn-secondary" style={{ padding: "4px 10px", fontSize: 12 }}>»</button>
                    </div>
                  )}
                </div>

                {/* Export */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
                  <CSVLink data={csvData} filename="farmer_risk_report.csv" style={{ textDecoration: "none" }}>
                    <button className="btn btn-export">📄 Export CSV</button>
                  </CSVLink>
                  <button className="btn btn-export" onClick={exportExcel}>📊 Export Excel</button>
                  <button className="btn btn-export" onClick={() => exportMapImage("png")}>🗺️ Map as PNG</button>
                  <button className="btn btn-export" onClick={() => exportMapImage("pdf")}>🗺️ Map as PDF</button>
                  <button className="btn btn-primary" onClick={exportFullReport}>📑 Full Report PDF</button>
                </div>

                {/* Map */}
                <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #eee", overflow: "hidden", marginBottom: 16 }}>
                  <div style={{ padding: "14px 20px", borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h3 style={{ margin: 0, color: colors.darkOlive, fontSize: 15 }}>Farmer Risk Map</h3>
                    <select
                      value={viewMode}
                      onChange={(e) => setViewMode(e.target.value)}
                      style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #ccc", fontSize: 13 }}
                    >
                      <option value="cluster">📍 Marker View</option>
                      <option value="heatmap">🔥 Heatmap View</option>
                    </select>
                  </div>
                  <div id="policymap" style={{ height: 500 }}>
                    <MapContainer key={viewMode} center={[20.5937, 78.9629]} zoom={5} style={{ height: "100%", width: "100%" }}>
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      />
                      {viewMode === "cluster" ? (
                        <>
                          {filteredFarmers
                            .filter((f) => f.farmer?.latitude != null && f.farmer?.longitude != null)
                            .map((f, i) => (
                              <Marker key={i} position={[f.farmer.latitude, f.farmer.longitude]} icon={createMarkerIcon(f.risk)}>
                                <Popup>
                                  <div style={{ minWidth: 160 }}>
                                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{f.farmer?.name || "—"}</div>
                                    <div style={{ fontSize: 12, color: "#555", marginBottom: 2 }}>
                                      🌾 Crop: <b>{f.farmer?.cropType || "—"}</b>
                                    </div>
                                    <div style={{ fontSize: 12, color: "#555", marginBottom: 2 }}>
                                      📍 Region: {f.farmer?.region || "—"}
                                    </div>
                                    {f.weather && (
                                      <div style={{ fontSize: 12, color: "#555", marginBottom: 2 }}>
                                        🌡️ {f.weather.temp?.toFixed(1)}°C | 💧 {f.weather.humidity}%
                                      </div>
                                    )}
                                    <div style={{ marginTop: 6 }}>
                                      <span style={{ background: getRiskColor(f.risk) + "20", color: getRiskColor(f.risk), fontWeight: 700, borderRadius: 6, padding: "2px 8px", fontSize: 12 }}>
                                        {f.risk} Risk
                                      </span>
                                    </div>
                                    <div style={{ marginTop: 6 }}>
                                      <button
                                        onClick={() => { setSelectedCrop(f.farmer?.cropType?.toLowerCase() || ""); setCurrentPage(1); }}
                                        style={{ fontSize: 11, color: "#007BFF", background: "none", border: "none", cursor: "pointer", padding: 0, textDecoration: "underline" }}
                                      >
                                        Filter by this crop
                                      </button>
                                    </div>
                                  </div>
                                </Popup>
                              </Marker>
                            ))}
                        </>
                      ) : (
                        <HeatmapLayer points={heatmapPoints} />
                      )}
                    </MapContainer>
                  </div>
                  {/* Map legend */}
                  <div style={{ padding: "10px 20px", borderTop: "1px solid #eee", display: "flex", gap: 20, fontSize: 12 }}>
                    {[["#28a745", "Low Risk"], ["#fd7e14", "Medium Risk"], ["#dc3545", "High Risk"]].map(([c, l]) => (
                      <span key={l} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <span style={{ width: 10, height: 10, borderRadius: "50%", background: c, display: "inline-block" }} />
                        {l}
                      </span>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default PolicymakerDashboard;
