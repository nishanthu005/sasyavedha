import React, { useMemo, useState } from 'react';
import { FiBarChart2, FiEdit2, FiLayers, FiPlus, FiSave, FiX } from 'react-icons/fi';

const initialFarms = [
  { id: 1, name: 'Green Valley Farm', location: 'Nashik, Maharashtra', area: 45, fields: 8, manager: 'Rajesh Kumar', status: 'Active', crops: ['Rice', 'Wheat', 'Cotton'], health: 85, lastUpdated: '2025-04-03' },
  { id: 2, name: 'Sunshine Acres', location: 'Pune, Maharashtra', area: 32, fields: 6, manager: 'Priya Sharma', status: 'Active', crops: ['Tomato', 'Maize'], health: 92, lastUpdated: '2025-04-03' },
  { id: 3, name: 'Golden Harvest', location: 'Satara, Maharashtra', area: 28, fields: 5, manager: 'Amit Patel', status: 'Maintenance', crops: ['Sugarcane', 'Soybean'], health: 78, lastUpdated: '2025-04-02' },
];

const emptyFarm = {
  name: '',
  location: '',
  area: '',
  fields: '',
  manager: '',
  status: 'Active',
  crops: '',
};

export default function FarmManagement({ setCurrentPage }) {
  const [farms, setFarms] = useState(initialFarms);
  const [selectedFarm, setSelectedFarm] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingFarm, setEditingFarm] = useState(null);
  const [form, setForm] = useState(emptyFarm);
  const [message, setMessage] = useState('');

  const summary = useMemo(() => ({
    farms: farms.length,
    area: farms.reduce((sum, farm) => sum + Number(farm.area), 0),
    fields: farms.reduce((sum, farm) => sum + Number(farm.fields), 0),
    health: Math.round(farms.reduce((sum, farm) => sum + farm.health, 0) / Math.max(farms.length, 1)),
  }), [farms]);

  const openAdd = () => {
    setEditingFarm(null);
    setForm(emptyFarm);
    setFormOpen(true);
  };

  const openEdit = (farm) => {
    setEditingFarm(farm);
    setForm({ ...farm, crops: farm.crops.join(', ') });
    setFormOpen(true);
  };

  const saveFarm = (event) => {
    event.preventDefault();
    const payload = {
      ...form,
      area: Number(form.area),
      fields: Number(form.fields),
      crops: form.crops.split(',').map(crop => crop.trim()).filter(Boolean),
      health: editingFarm?.health || 80,
      lastUpdated: new Date().toISOString().slice(0, 10),
    };

    if (editingFarm) {
      setFarms(prev => prev.map(farm => farm.id === editingFarm.id ? { ...farm, ...payload } : farm));
      setMessage(`${payload.name} updated`);
    } else {
      setFarms(prev => [{ ...payload, id: Date.now() }, ...prev]);
      setMessage(`${payload.name} added`);
    }

    setFormOpen(false);
    setEditingFarm(null);
  };

  const manageFields = (farm) => {
    setSelectedFarm(farm.id);
    setMessage(`Field tools opened for ${farm.name}. Select field counts and crops from this farm card.`);
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <div className="page-title">Farm Management</div>
          <div className="page-sub">Multi-farm operations and field management</div>
        </div>
        <button className="btn btn-blue" onClick={openAdd}>
          <FiPlus /> Add Farm
        </button>
      </div>

      {message && <div className="card mb-20" style={{ borderColor: 'var(--cyan)', color: 'var(--text)' }}>{message}</div>}

      <div className="grid-4">
        <div className="card"><div className="stat-value" style={{ color: 'var(--green)' }}>{summary.farms}</div><div className="stat-label">Total Farms</div></div>
        <div className="card"><div className="stat-value" style={{ color: 'var(--blue)' }}>{summary.area}</div><div className="stat-label">Total Area (ha)</div></div>
        <div className="card"><div className="stat-value" style={{ color: 'var(--orange)' }}>{summary.fields}</div><div className="stat-label">Total Fields</div></div>
        <div className="card"><div className="stat-value" style={{ color: 'var(--purple)' }}>{summary.health}%</div><div className="stat-label">Avg Health</div></div>
      </div>

      <div className="card">
        <div className="section-title">Farm Portfolio</div>
        <div style={{ display: 'grid', gap: '12px' }}>
          {farms.map(farm => {
            const active = selectedFarm === farm.id;
            return (
              <div key={farm.id} className="soft-row" style={{ borderColor: active ? 'var(--text-muted)' : 'var(--border)' }}>
                <button
                  onClick={() => setSelectedFarm(active ? null : farm.id)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text)', width: '100%', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: 800, marginBottom: '4px' }}>{farm.name}</div>
                      <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '10px' }}>{farm.location}</div>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {farm.crops.map(crop => <span key={crop} className="tag tag-gray">{crop}</span>)}
                      </div>
                    </div>
                    <span className={`status-pill ${farm.status === 'Active' ? 'status-success' : 'status-warning'}`}>{farm.status}</span>
                  </div>
                </button>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginTop: '16px' }}>
                  <div><div className="stat-label">Area</div><div style={{ fontWeight: 800 }}>{farm.area} ha</div></div>
                  <div><div className="stat-label">Fields</div><div style={{ fontWeight: 800 }}>{farm.fields}</div></div>
                  <div><div className="stat-label">Manager</div><div style={{ fontWeight: 800 }}>{farm.manager}</div></div>
                  <div><div className="stat-label">Health</div><div style={{ fontWeight: 800, color: farm.health >= 85 ? 'var(--green)' : 'var(--orange)' }}>{farm.health}%</div></div>
                </div>

                {active && (
                  <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button className="btn btn-secondary" onClick={() => setCurrentPage?.('analytics')}><FiBarChart2 /> View Analytics</button>
                      <button className="btn btn-secondary" onClick={() => manageFields(farm)}><FiLayers /> Manage Fields</button>
                      <button className="btn btn-secondary" onClick={() => openEdit(farm)}><FiEdit2 /> Edit Farm</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {formOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.62)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <form className="card" onSubmit={saveFarm} style={{ maxWidth: '540px', width: '92%' }}>
            <div className="section-title">{editingFarm ? 'Edit Farm' : 'Add New Farm'}</div>
            <div style={{ display: 'grid', gap: '12px' }}>
              <input className="input" placeholder="Farm Name" value={form.name} onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))} required />
              <input className="input" placeholder="Location" value={form.location} onChange={e => setForm(prev => ({ ...prev, location: e.target.value }))} required />
              <div className="grid-2" style={{ marginBottom: 0 }}>
                <input className="input" type="number" min="1" placeholder="Area (hectares)" value={form.area} onChange={e => setForm(prev => ({ ...prev, area: e.target.value }))} required />
                <input className="input" type="number" min="1" placeholder="Number of Fields" value={form.fields} onChange={e => setForm(prev => ({ ...prev, fields: e.target.value }))} required />
              </div>
              <input className="input" placeholder="Manager Name" value={form.manager} onChange={e => setForm(prev => ({ ...prev, manager: e.target.value }))} required />
              <input className="input" placeholder="Crops, comma separated" value={form.crops} onChange={e => setForm(prev => ({ ...prev, crops: e.target.value }))} required />
              <select className="select" value={form.status} onChange={e => setForm(prev => ({ ...prev, status: e.target.value }))}>
                <option>Active</option>
                <option>Maintenance</option>
                <option>Inactive</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setFormOpen(false)}><FiX /> Cancel</button>
              <button type="submit" className="btn btn-blue"><FiSave /> Save Farm</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
