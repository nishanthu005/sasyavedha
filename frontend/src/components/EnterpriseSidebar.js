import React, { useState } from 'react';
import { useLang } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import {
  FiBarChart2,
  FiBox,
  FiBriefcase,
  FiChevronDown,
  FiChevronRight,
  FiDroplet,
  FiHome,
  FiKey,
  FiLogOut,
  FiPieChart,
  FiSettings,
  FiUsers,
} from 'react-icons/fi';
import { GiPlantRoots, GiTestTubes } from 'react-icons/gi';

export default function EnterpriseSidebar({ currentPage, setCurrentPage, userRole, userName, onToggleMode }) {
  const { t } = useLang();
  const { logout } = useAuth();
  const [enterpriseMenuOpen, setEnterpriseMenuOpen] = useState(true);

  const canManageEnterprise = ['owner', 'admin'].includes(userRole);
  const menuItems = [
    { id: 'overview', icon: FiPieChart, label: t.enterpriseOverview },
    { id: 'farms', icon: FiHome, label: t.farmManagement },
    { id: 'analytics', icon: FiBarChart2, label: t.advancedAnalytics },
    { id: 'api_enterprise', icon: FiKey, label: t.apiManagement },
    { id: 'reports_enterprise', icon: FiBriefcase, label: t.reports },
    ...(canManageEnterprise ? [{ id: 'team', icon: FiUsers, label: t.teamManagement }] : []),
    { id: 'inventory', icon: FiBox, label: t.inventoryResources },
    ...(canManageEnterprise ? [{ id: 'settings', icon: FiSettings, label: t.enterpriseSettings }] : []),
  ];

  const coreModules = [
    { id: 'disease', icon: GiPlantRoots, label: t.navDisease },
    { id: 'yield', icon: FiBarChart2, label: t.navYield },
    { id: 'irrigation', icon: FiDroplet, label: t.navIrrigation },
    { id: 'fertilizer', icon: GiTestTubes, label: t.navFertilizer },
  ];

  const renderNavButton = ({ id, icon: Icon, label }) => (
    <button
      key={id}
      onClick={() => setCurrentPage(id)}
      className={`sidebar-nav-button ${currentPage === id ? 'active' : ''}`}
      style={{ padding: '10px 12px', marginBottom: '4px', fontSize: '12px', fontWeight: currentPage === id ? 700 : 500 }}
    >
      <Icon size={15} />
      <span style={{ minWidth: 0 }}>{label}</span>
    </button>
  );

  return (
    <aside className="sidebar enterprise-sidebar">
      <div style={{ padding: '16px 14px', borderBottom: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--text)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <div className="icon-chip">
            <FiBriefcase size={18} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text)' }}>SasyaVedha Pro</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{userName} / {userRole}</div>
          </div>
        </div>
        <div className="tag tag-green" style={{ textTransform: 'uppercase' }}>{userRole}</div>
      </div>

      <div style={{ padding: '12px 8px', flex: 1, overflowY: 'auto' }}>
        {renderNavButton({ id: 'dashboard', icon: GiPlantRoots, label: t.navDashboard })}

        <button
          onClick={() => setEnterpriseMenuOpen(!enterpriseMenuOpen)}
          style={{
            background: 'transparent',
            color: 'var(--text-muted)',
            padding: '10px',
            width: '100%',
            textAlign: 'left',
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            border: 'none',
            cursor: 'pointer',
            marginTop: '8px',
          }}
        >
          <span>{t.enterpriseFeatures}</span>
          {enterpriseMenuOpen ? <FiChevronDown /> : <FiChevronRight />}
        </button>

        {enterpriseMenuOpen && <div>{menuItems.map(renderNavButton)}</div>}

        <div style={{
          marginTop: '20px',
          paddingTop: '16px',
          borderTop: '1px solid var(--border)',
          fontSize: '12px',
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginBottom: '8px',
        }}>
          {t.coreModules}
        </div>

        {coreModules.map(renderNavButton)}
      </div>

      <div className="sidebar-mode-switch" style={{ display: 'grid', gap: '8px' }}>
        <button className="btn btn-secondary" onClick={onToggleMode}>
          <GiPlantRoots /> {t.standardEdition}
        </button>
        <button className="btn btn-danger" onClick={logout}>
          <FiLogOut /> Logout
        </button>
      </div>

      <div style={{ padding: '14px 18px', borderTop: '1px solid var(--border)', fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center' }}>
        <div style={{ marginBottom: '8px' }}>{t.enterpriseLicense}</div>
        <div style={{ fontSize: '10px' }}>2025 SasyaVedha Pro</div>
      </div>
    </aside>
  );
}
