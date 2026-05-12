import React, { useState } from "react";
import FarmerLogin from "./FarmerLogin";
import FarmerRegister from "./FarmerRegister";
import FarmerDashboard from "./FarmerDashboard";
import PolicymakerDashboard from "./PolicymakerDashboard";
import PolicymakerLogin from "./PolicymakerLogin";
import LandingPage from "./LandingPage";

function AppContent() {
  const [farmer, setFarmer] = useState(null);
  const [policymaker, setPolicymaker] = useState(null);
  const [currentView, setCurrentView] = useState('landing'); // 'landing', 'login', 'register', 'policymaker-login', 'policymaker'

  //  Handle different views when not logged in
  if (!farmer && !policymaker) {
    switch (currentView) {
      case 'login':
        return <FarmerLogin onLogin={setFarmer} onBackToLanding={() => setCurrentView('landing')} onShowRegister={() => setCurrentView('register')} />;
      case 'register':
        return <FarmerRegister onRegister={setFarmer} onBackToLanding={() => setCurrentView('landing')} onShowLogin={() => setCurrentView('login')} />;
      case 'policymaker-login':
        return <PolicymakerLogin onLogin={setPolicymaker} onBackToLanding={() => setCurrentView('landing')} />;
      case 'policymaker':
        return <PolicymakerLogin onLogin={setPolicymaker} onBackToLanding={() => setCurrentView('landing')} />;
      default:
        return (
          <LandingPage 
            onShowLogin={() => setCurrentView('login')}
            onShowRegister={() => setCurrentView('register')}
            onShowPolicymaker={() => setCurrentView('policymaker-login')}
          />
        );
    }
  }

  // Handle policymaker dashboard view
  if (policymaker) {
    return (
      <div>
        <PolicymakerDashboard 
          onBackToLanding={() => {
            setPolicymaker(null);
            setCurrentView('landing');
          }}
        />
      </div>
    );
  }

  // Farmer dashboard view
  return (
    <FarmerDashboard 
      farmer={farmer} 
      onLogout={() => setFarmer(null)}
    />
  );
}

function App() {
  return (
    <AppContent />
  );
}

export default App;
