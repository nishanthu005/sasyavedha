import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import EnterpriseSidebar from './components/EnterpriseSidebar';
import Dashboard from './pages/Dashboard';
import DiseaseDetection from './pages/DiseaseDetection';
import YieldPrediction from './pages/YieldPrediction';
import Irrigation from './pages/Irrigation';
import Fertilizer from './pages/Fertilizer';
import EnterpriseOverview from './pages/EnterpriseOverview';
import FarmManagement from './pages/FarmManagement';
import AdvancedAnalytics from './pages/AdvancedAnalytics';
import ClimateSimulation from './pages/ClimateSimulation';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ApiManagement from './pages/ApiManagement';
import ReportGeneration from './pages/ReportGeneration';
import TeamManagement from './pages/TeamManagement';
import InventoryManagement from './pages/InventoryManagement';
import EnterpriseSettings from './pages/EnterpriseSettings';
import { LanguageProvider } from './context/LanguageContext';
import { LocationProvider } from './context/LocationContext';
import { UserProvider } from './context/UserContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css';

function AppInner() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sensorData, setSensorData] = useState({ temp: 28.4, moisture: 62 });
  const [isEnterpriseMode, setIsEnterpriseMode] = useState(true); // Toggle between normal and enterprise

  useEffect(() => {
    const interval = setInterval(() => {
      setSensorData({
        temp: +(28 + Math.sin(Date.now() / 5000) * 2).toFixed(1),
        moisture: Math.floor(60 + Math.cos(Date.now() / 7000) * 8)
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const pages = {
    dashboard: Dashboard,
    disease: DiseaseDetection,
    yield: YieldPrediction,
    irrigation: Irrigation,
    fertilizer: Fertilizer,
    climate: ClimateSimulation,
    // Enterprise pages
    overview: EnterpriseOverview,
    farms: FarmManagement,
    analytics: AdvancedAnalytics,
    api_enterprise: ApiManagement,
    reports_enterprise: ReportGeneration,
    team: TeamManagement,
    inventory: InventoryManagement,
    settings: EnterpriseSettings
  };

  const PageComponent = pages[activeTab] || Dashboard;

  // Get user role for enterprise sidebar
  const userRole = user?.role || 'user';
  const userName = user?.name || 'Guest';

  return (
    <div className={`app ${isEnterpriseMode ? 'enterprise-mode' : 'standard-mode'}`}>
      {isEnterpriseMode ? (
        <EnterpriseSidebar 
          currentPage={activeTab} 
          setCurrentPage={setActiveTab}
          userRole={userRole}
          userName={userName}
          isEnterpriseMode={isEnterpriseMode}
          onToggleMode={() => {
            setIsEnterpriseMode(false);
            setActiveTab('dashboard');
          }}
        />
      ) : (
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          sensorData={sensorData}
          isEnterpriseMode={isEnterpriseMode}
          onToggleMode={() => {
            setIsEnterpriseMode(true);
            setActiveTab('overview');
          }}
        />
      )}
      <main className="main-content">
        <PageComponent setCurrentPage={setActiveTab} />
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <LocationProvider>
          <UserProvider>
            <AppWithAuth />
          </UserProvider>
        </LocationProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}

function AppWithAuth() {
  const { isAuthenticated, loading } = useAuth();
  const [authView, setAuthView] = useState('login');

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'var(--bg)'
      }}>
        <div style={{ textAlign: 'center', color: 'var(--text)' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}></div>
          <div style={{ fontSize: '24px', fontWeight: '600' }}>SasyaVedha</div>
          <div style={{ fontSize: '16px', opacity: 0.8 }}>Loading...</div>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <AppInner />;
  }

  return authView === 'signup'
    ? <Signup onSwitchToLogin={() => setAuthView('login')} />
    : <Login onSwitchToSignup={() => setAuthView('signup')} />;
}

export default App;

