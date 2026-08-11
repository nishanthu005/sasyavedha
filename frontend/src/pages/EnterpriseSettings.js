import React, { useState } from 'react';
import { FiBell, FiCheck, FiGlobe, FiLock, FiSave, FiSettings } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { RestrictedPage } from './TeamManagement';

export default function EnterpriseSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    companyName: 'SasyaVedha Farms',
    email: 'admin@sasyavedha.com',
    phone: '+91 98765 43210',
    address: 'Pune, Maharashtra, India',
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    notifications: { email: true, sms: false, push: true },
    security: { twoFactorAuth: false, sessionTimeout: '24h', passwordPolicy: 'strong' },
  });
  const [activeTab, setActiveTab] = useState('general');
  const [saved, setSaved] = useState(false);

  const tabs = [
    { id: 'general', label: 'General', icon: FiSettings },
    { id: 'notifications', label: 'Notifications', icon: FiBell },
    { id: 'security', label: 'Security', icon: FiLock },
    { id: 'integrations', label: 'Integrations', icon: FiGlobe },
  ];

  const updateField = (field, value) => setSettings(prev => ({ ...prev, [field]: value }));
  const updateNested = (group, field, value) => setSettings(prev => ({ ...prev, [group]: { ...prev[group], [field]: value } }));

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  if (!['owner', 'admin'].includes(user?.role)) {
    return <RestrictedPage title="Enterprise Settings" user={user} />;
  }

  const ToggleRow = ({ title, description, checked, onChange }) => (
    <div className="soft-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
      <div>
        <div style={{ fontWeight: 800, marginBottom: '4px' }}>{title}</div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{description}</div>
      </div>
      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 0 }}>
        <input type="checkbox" checked={checked} onChange={event => onChange(event.target.checked)} />
        <span className={`status-pill ${checked ? 'status-success' : 'status-danger'}`}>{checked ? 'Enabled' : 'Disabled'}</span>
      </label>
    </div>
  );

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <div className="page-title">Enterprise Settings</div>
          <div className="page-sub">Configure organization details, alerts, security, and integrations</div>
        </div>
        <button className="btn btn-blue" onClick={handleSave}>
          <FiSave /> Save Settings
        </button>
      </div>

      {saved && <div className="card mb-20" style={{ borderColor: 'var(--green)', color: 'var(--green)' }}><FiCheck /> Settings saved successfully</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '20px' }}>
        <div className="card" style={{ padding: '8px', alignSelf: 'start' }}>
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`btn ${activeTab === tab.id ? 'btn-blue' : 'btn-secondary'}`}
                style={{ width: '100%', justifyContent: 'flex-start', marginBottom: '4px', fontSize: '14px' }}
              >
                <Icon /> {tab.label}
              </button>
            );
          })}
        </div>

        <div>
          {activeTab === 'general' && (
            <div className="card">
              <div className="section-title">General Settings</div>
              <div style={{ display: 'grid', gap: '16px' }}>
                <div>
                  <label>Company Name</label>
                  <input className="input" value={settings.companyName} onChange={event => updateField('companyName', event.target.value)} />
                </div>
                <div className="grid-2" style={{ marginBottom: 0 }}>
                  <div>
                    <label>Email</label>
                    <input className="input" type="email" value={settings.email} onChange={event => updateField('email', event.target.value)} />
                  </div>
                  <div>
                    <label>Phone</label>
                    <input className="input" value={settings.phone} onChange={event => updateField('phone', event.target.value)} />
                  </div>
                </div>
                <div>
                  <label>Address</label>
                  <textarea className="input" rows={3} value={settings.address} onChange={event => updateField('address', event.target.value)} />
                </div>
                <div className="grid-2" style={{ marginBottom: 0 }}>
                  <div>
                    <label>Timezone</label>
                    <select className="select" value={settings.timezone} onChange={event => updateField('timezone', event.target.value)}>
                      <option value="Asia/Kolkata">Asia/Kolkata</option>
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">America/New_York</option>
                    </select>
                  </div>
                  <div>
                    <label>Currency</label>
                    <select className="select" value={settings.currency} onChange={event => updateField('currency', event.target.value)}>
                      <option value="INR">INR</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="card">
              <div className="section-title">Notification Preferences</div>
              <div style={{ display: 'grid', gap: '12px' }}>
                <ToggleRow title="Email Notifications" description="Receive operational updates by email" checked={settings.notifications.email} onChange={value => updateNested('notifications', 'email', value)} />
                <ToggleRow title="SMS Notifications" description="Receive urgent alerts by SMS" checked={settings.notifications.sms} onChange={value => updateNested('notifications', 'sms', value)} />
                <ToggleRow title="Push Notifications" description="Receive browser notifications while working" checked={settings.notifications.push} onChange={value => updateNested('notifications', 'push', value)} />
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="card">
              <div className="section-title">Security Settings</div>
              <div style={{ display: 'grid', gap: '16px' }}>
                <ToggleRow title="Two-Factor Authentication" description="Add an extra login verification step" checked={settings.security.twoFactorAuth} onChange={value => updateNested('security', 'twoFactorAuth', value)} />
                <div className="grid-2" style={{ marginBottom: 0 }}>
                  <div>
                    <label>Session Timeout</label>
                    <select className="select" value={settings.security.sessionTimeout} onChange={event => updateNested('security', 'sessionTimeout', event.target.value)}>
                      <option value="1h">1 Hour</option>
                      <option value="8h">8 Hours</option>
                      <option value="24h">24 Hours</option>
                      <option value="7d">7 Days</option>
                    </select>
                  </div>
                  <div>
                    <label>Password Policy</label>
                    <select className="select" value={settings.security.passwordPolicy} onChange={event => updateNested('security', 'passwordPolicy', event.target.value)}>
                      <option value="basic">Basic</option>
                      <option value="strong">Strong</option>
                      <option value="very_strong">Very Strong</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="card">
              <div className="section-title">Third-Party Integrations</div>
              <div style={{ display: 'grid', gap: '12px' }}>
                {[
                  { name: 'OpenWeatherMap', status: 'Connected', description: 'Weather data integration' },
                  { name: 'NASA Earth Data', status: 'Not Connected', description: 'Satellite imagery' },
                  { name: 'WhatsApp Business', status: 'Connected', description: 'SMS notifications' },
                  { name: 'QuickBooks', status: 'Not Connected', description: 'Accounting integration' },
                ].map(integration => (
                  <div key={integration.name} className="soft-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                    <div>
                      <div style={{ fontWeight: 800, marginBottom: '4px' }}>{integration.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{integration.description}</div>
                    </div>
                    <span className={`status-pill ${integration.status === 'Connected' ? 'status-success' : 'status-danger'}`}>{integration.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
