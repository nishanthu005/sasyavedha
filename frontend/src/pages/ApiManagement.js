import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import { FiCopy, FiEdit2, FiPlus, FiTrash2, FiZap } from 'react-icons/fi';

export default function ApiManagement() {
  const { user } = useAuth();
  const { t } = useLang();
  const [apiKeys, setApiKeys] = useState([]);
  const [newApiKey, setNewApiKey] = useState({
    name: '',
    key: '',
    service: 'weather',
    isActive: true
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingKey, setEditingKey] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadApiKeys();
  }, []);

  const loadApiKeys = async () => {
    try {
      // Simulate API call - replace with actual backend call
      const savedKeys = localStorage.getItem('sasyavedha_api_keys');
      if (savedKeys) {
        setApiKeys(JSON.parse(savedKeys));
      } else {
        // Default API keys for demo
        const defaultKeys = [
          {
            id: '1',
            name: 'OpenWeatherMap API',
            key: 'demo_key_openweathermap_12345',
            service: 'weather',
            isActive: true,
            createdAt: new Date().toISOString(),
            lastUsed: new Date().toISOString()
          },
          {
            id: '2',
            name: 'NASA Earth Data API',
            key: 'demo_key_nasa_67890',
            service: 'satellite',
            isActive: false,
            createdAt: new Date().toISOString(),
            lastUsed: null
          }
        ];
        setApiKeys(defaultKeys);
        localStorage.setItem('sasyavedha_api_keys', JSON.stringify(defaultKeys));
      }
    } catch (error) {
      console.error('Error loading API keys:', error);
      setMessage('Error loading API keys');
    }
  };

  const saveApiKeys = async (keys) => {
    try {
      localStorage.setItem('sasyavedha_api_keys', JSON.stringify(keys));
      setApiKeys(keys);
      setMessage('API keys saved successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving API keys:', error);
      setMessage('Error saving API keys');
    }
  };

  const handleAddKey = async (e) => {
    e.preventDefault();
    
    if (!newApiKey.name.trim() || !newApiKey.key.trim()) {
      setMessage('Please fill in all fields');
      return;
    }

    const keyData = {
      id: Date.now().toString(),
      ...newApiKey,
      createdAt: new Date().toISOString(),
      lastUsed: null,
      createdBy: user?.name || 'Unknown'
    };

    const updatedKeys = [...apiKeys, keyData];
    await saveApiKeys(updatedKeys);

    setNewApiKey({
      name: '',
      key: '',
      service: 'weather',
      isActive: true
    });
    setShowAddForm(false);
  };

  const handleEditKey = (key) => {
    setEditingKey(key);
    setNewApiKey({
      name: key.name,
      key: key.key,
      service: key.service,
      isActive: key.isActive
    });
    setShowAddForm(true);
  };

  const handleUpdateKey = async (e) => {
    e.preventDefault();
    
    if (!newApiKey.name.trim() || !newApiKey.key.trim()) {
      setMessage('Please fill in all fields');
      return;
    }

    const updatedKeys = apiKeys.map(key => 
      key.id === editingKey.id 
        ? { ...key, ...newApiKey, updatedAt: new Date().toISOString() }
        : key
    );

    await saveApiKeys(updatedKeys);

    setNewApiKey({
      name: '',
      key: '',
      service: 'weather',
      isActive: true
    });
    setShowAddForm(false);
    setEditingKey(null);
  };

  const handleDeleteKey = async (keyId) => {
    if (window.confirm('Are you sure you want to delete this API key?')) {
      const updatedKeys = apiKeys.filter(key => key.id !== keyId);
      await saveApiKeys(updatedKeys);
    }
  };

  const handleToggleKey = async (keyId) => {
    const updatedKeys = apiKeys.map(key => 
      key.id === keyId 
        ? { ...key, isActive: !key.isActive, updatedAt: new Date().toISOString() }
        : key
    );
    await saveApiKeys(updatedKeys);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setMessage('API key copied to clipboard');
    setTimeout(() => setMessage(''), 2000);
  };

  const maskApiKey = (key) => {
    if (key.length <= 8) return key;
    return key.substring(0, 4) + '*'.repeat(key.length - 8) + key.substring(key.length - 4);
  };

  const getServiceIcon = () => <FiZap />;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <div className="page-title"> API Management</div>
          <div className="page-sub">Manage your external API keys and integrations</div>
        </div>
        <button
          className="btn btn-blue"
          onClick={() => setShowAddForm(true)}
        >
          <FiPlus /> Add API Key
        </button>
      </div>

      {message && (
        <div className="card mb-20" style={{
          background: 'var(--surface2)',
          color: message.includes('Error') ? 'var(--red)' : 'var(--green)',
          border: `1px solid ${message.includes('Error') ? 'var(--red)' : 'var(--green)'}`
        }}>
          {message}
        </div>
      )}

      {showAddForm && (
        <div className="card mb-20">
          <div className="section-title">
            {editingKey ? ' Edit API Key' : ' Add New API Key'}
          </div>
          <form onSubmit={editingKey ? handleUpdateKey : handleAddKey}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label>API Name</label>
                <input
                  type="text"
                  value={newApiKey.name}
                  onChange={(e) => setNewApiKey(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., OpenWeatherMap API"
                  className="input"
                  required
                />
              </div>
              <div>
                <label>Service Type</label>
                <select
                  value={newApiKey.service}
                  onChange={(e) => setNewApiKey(prev => ({ ...prev, service: e.target.value }))}
                  className="select"
                >
                  <option value="weather"> Weather</option>
                  <option value="satellite"> Satellite</option>
                  <option value="soil"> Soil Data</option>
                  <option value="irrigation"> Irrigation</option>
                  <option value="disease"> Disease Detection</option>
                  <option value="yield"> Yield Prediction</option>
                </select>
              </div>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label>API Key</label>
              <input
                type="password"
                value={newApiKey.key}
                onChange={(e) => setNewApiKey(prev => ({ ...prev, key: e.target.value }))}
                placeholder="Enter your API key"
                className="input"
                required
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={newApiKey.isActive}
                  onChange={(e) => setNewApiKey(prev => ({ ...prev, isActive: e.target.checked }))}
                />
                <span>Active</span>
              </label>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="submit" className="btn btn-blue">
                {editingKey ? ' Update Key' : ' Add Key'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingKey(null);
                  setNewApiKey({
                    name: '',
                    key: '',
                    service: 'weather',
                    isActive: true
                  });
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <div className="section-title"> API Keys</div>
        
        {apiKeys.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}></div>
            <div>No API keys configured</div>
            <div style={{ fontSize: '14px', marginTop: '8px' }}>Add your first API key to get started</div>
          </div>
        ) : (
          <div className="grid-1" style={{ gap: '16px' }}>
            {apiKeys.map((apiKey) => (
              <div key={apiKey.id} className="card" style={{
                background: 'var(--surface2)',
                color: 'var(--text)',
                border: `1px solid ${apiKey.isActive ? 'var(--border)' : 'var(--red)'}`
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="icon-chip">
                      {getServiceIcon(apiKey.service)}
                    </div>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '16px', marginBottom: '4px' }}>
                        {apiKey.name}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {apiKey.service.charAt(0).toUpperCase() + apiKey.service.slice(1)} Service
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className={`status-pill ${apiKey.isActive ? 'status-success' : 'status-danger'}`}>
                      {apiKey.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    API Key
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    padding: '8px 12px',
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    fontFamily: 'monospace',
                    fontSize: '14px',
                    color: 'var(--text)'
                  }}>
                    <span style={{ flex: 1 }}>{maskApiKey(apiKey.key)}</span>
                    <button
                      onClick={() => copyToClipboard(apiKey.key)}
                      style={{
                        background: 'transparent',
                        border: '1px solid var(--border)',
                        color: 'var(--text)',
                        cursor: 'pointer',
                        fontSize: '16px',
                        padding: '4px'
                      }}
                      title="Copy API key"
                    >
                      <FiCopy />
                    </button>
                  </div>
                </div>

                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  <div>Created: {new Date(apiKey.createdAt).toLocaleDateString()}</div>
                  {apiKey.lastUsed && (
                    <div>Last used: {new Date(apiKey.lastUsed).toLocaleDateString()}</div>
                  )}
                  {apiKey.updatedAt && (
                    <div>Updated: {new Date(apiKey.updatedAt).toLocaleDateString()}</div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleToggleKey(apiKey.id)}
                    className={`btn ${apiKey.isActive ? 'btn-secondary' : 'btn-blue'}`}
                    style={{ fontSize: '12px', padding: '6px 12px' }}
                  >
                    {apiKey.isActive ? ' Deactivate' : ' Activate'}
                  </button>
                  <button
                    onClick={() => handleEditKey(apiKey)}
                    className="btn btn-secondary"
                    style={{ fontSize: '12px', padding: '6px 12px' }}
                  >
                    <FiEdit2 /> Edit
                  </button>
                  <button
                    onClick={() => handleDeleteKey(apiKey.id)}
                    className="btn btn-danger"
                    style={{ fontSize: '12px', padding: '6px 12px' }}
                  >
                    <FiTrash2 /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card mt-20">
        <div className="section-title"> API Documentation</div>
        <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
          <div style={{ marginBottom: '16px' }}>
            <strong>Supported API Services:</strong>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
            <div>
              <div style={{ fontWeight: '600', marginBottom: '4px' }}> Weather APIs</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                OpenWeatherMap, WeatherAPI, AccuWeather
              </div>
            </div>
            <div>
              <div style={{ fontWeight: '600', marginBottom: '4px' }}> Satellite Data</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                NASA Earth Data, Sentinel Hub, Planet Labs
              </div>
            </div>
            <div>
              <div style={{ fontWeight: '600', marginBottom: '4px' }}> Soil Sensors</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Soil Moisture APIs, Nutrient Analysis
              </div>
            </div>
            <div>
              <div style={{ fontWeight: '600', marginBottom: '4px' }}> Irrigation Systems</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Smart Irrigation APIs, Water Management
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

