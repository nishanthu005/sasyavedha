import React, { useState } from 'react';
import { useLang } from '../context/LanguageContext';
import { useLocation } from '../context/LocationContext';
import { useAuth } from '../context/AuthContext';
import LanguageSwitcher from './LanguageSwitcher';
import LocationChanger from './LocationChanger';
import {
  FiActivity,
  FiBarChart2,
  FiBriefcase,
  FiCloudRain,
  FiDroplet,
  FiHome,
  FiLogOut,
  FiMapPin,
  FiThermometer,
} from 'react-icons/fi';
import { GiPlantRoots, GiTestTubes, GiWaterDrop } from 'react-icons/gi';

export default function Sidebar({ activeTab, setActiveTab, sensorData, onToggleMode }) {
  const { t } = useLang();
  const { state, district, season } = useLocation();
  const { user, logout } = useAuth();
  const [showLocation, setShowLocation] = useState(false);

  const navItems = [
    { id: 'dashboard', icon: FiHome, label: t.navDashboard },
    { id: 'disease', icon: GiPlantRoots, label: t.navDisease },
    { id: 'yield', icon: FiBarChart2, label: t.navYield },
    { id: 'irrigation', icon: FiDroplet, label: t.navIrrigation },
    { id: 'fertilizer', icon: GiTestTubes, label: t.navFertilizer },
    { id: 'climate', icon: FiCloudRain, label: t.climateSimulation || 'Climate Simulation' },
  ];

  const SeasonIcon = season === 'Boro' ? GiWaterDrop : season === 'Kharif' ? FiCloudRain : GiPlantRoots;

  return (
    <>
      <aside className="sidebar">
        <div style={{ padding: '20px 20px 14px', borderBottom: '1px solid var(--border)' }}>
          <GiPlantRoots size={28} color="var(--text)" style={{ marginBottom: '6px' }} />
          <div style={{ fontSize: '18px', fontWeight: 900, letterSpacing: 0, color: 'var(--text)' }}>{t.appName}</div>
          <div style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '3px', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
            {t.appTagline}
          </div>
          <div style={{ marginTop: '12px' }}>
            <LanguageSwitcher />
          </div>
        </div>

        <button
          onClick={() => setShowLocation(true)}
          className="soft-row"
          style={{ margin: '12px 12px 0', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
            <FiMapPin size={14} />
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>{t.locationLabel}</span>
            <span style={{ marginLeft: 'auto', fontSize: '10px', color: 'var(--cyan)' }}>{t.locationChange}</span>
          </div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)', marginBottom: '3px' }}>{district}, {state}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
            <SeasonIcon className="inline-icon" size={13} /> {season} {t.locationSeason}
          </div>
        </button>

        <nav style={{ padding: '12px', flex: 1, overflowY: 'auto' }}>
          <div style={{ fontSize: '10px', color: 'var(--text-dim)', letterSpacing: '1.5px', marginBottom: '8px', paddingLeft: '8px', textTransform: 'uppercase' }}>
            {t.modules}
          </div>
          {navItems.map(item => {
            const active = activeTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`sidebar-nav-button ${active ? 'active' : ''}`}
                style={{ padding: '10px 12px', marginBottom: '4px', fontSize: '13px', fontWeight: active ? 700 : 500 }}
              >
                <Icon size={16} />
                <span style={{ flex: 1 }}>{item.label}</span>
                {active && <span style={{ width: '6px', height: '6px', background: 'var(--text)' }} />}
              </button>
            );
          })}
        </nav>

        <div style={{ padding: '14px', borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: '10px', color: 'var(--text-dim)', letterSpacing: '1.5px', marginBottom: '8px', textTransform: 'uppercase' }}>{t.liveSensors}</div>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
            <div className="soft-row" style={{ flex: 1, padding: '10px', textAlign: 'center' }}>
              <FiThermometer className="inline-icon" color="var(--orange)" />
              <div style={{ fontSize: '17px', fontWeight: 800, color: 'var(--orange)' }}>{sensorData.temp} C</div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>{t.temp}</div>
            </div>
            <div className="soft-row" style={{ flex: 1, padding: '10px', textAlign: 'center' }}>
              <FiDroplet className="inline-icon" color="var(--blue)" />
              <div style={{ fontSize: '17px', fontWeight: 800, color: 'var(--blue)' }}>{sensorData.moisture}%</div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>{t.moisture}</div>
            </div>
          </div>
          <div className="soft-row" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 10px' }}>
            <FiActivity size={12} color="var(--green)" />
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t.iotOnline}</span>
          </div>
        </div>

        <div className="sidebar-mode-switch" style={{ display: 'grid', gap: '8px' }}>
          <button className="btn btn-secondary" onClick={onToggleMode}>
            <FiBriefcase /> {t.enterpriseEdition}
          </button>
          <button className="btn btn-danger" onClick={logout} title={user?.email}>
            <FiLogOut /> Logout {user?.username ? `(${user.username})` : ''}
          </button>
        </div>
      </aside>

      {showLocation && <LocationChanger onClose={() => setShowLocation(false)} />}
    </>
  );
}
