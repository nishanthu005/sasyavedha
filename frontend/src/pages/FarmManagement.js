import React, { useEffect, useMemo, useState } from 'react';
import { FiBarChart2, FiEdit2, FiLayers, FiPlus, FiSave, FiX } from 'react-icons/fi';
import { createFarm, getFarms, updateFarm } from '../context/api';

const emptyFarm = {
  name: '',
  location: '',
  area: '',
  fields: '',
  status: 'Active',
  crops: '',
};

export default function FarmManagement({ setCurrentPage }) {
  const [farms, setFarms] = useState([]);
  const [selectedFarm, setSelectedFarm] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingFarm, setEditingFarm] = useState(null);
  const [form, setForm] = useState(emptyFarm);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const loadFarms = () => getFarms().then(response => setFarms(response.data.farms)).catch(() => setMessage('Could not load farms.')).finally(() => setLoading(false));
  useEffect(() => { loadFarms(); }, []);

  const summary = useMemo(() => ({
    farms: farms.length,
    area: farms.reduce((sum, farm) => sum + Number(farm.area), 0),
    fields: farms.reduce((sum, farm) => sum + Number(farm.fields), 0),
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

  const saveFarm = async (event) => {
    event.preventDefault();
    const payload = {
      ...form,
      area: Number(form.area),
      fields: Number(form.fields),
      crops: form.crops.split(',').map(crop => crop.trim()).filter(Boolean),
    };
    try {
      if (editingFarm) await updateFarm(editingFarm.id, payload); else await createFarm(payload);
      await loadFarms(); setMessage(`${payload.name} saved.`); setFormOpen(false); setEditingFarm(null);
    } catch (error) { setMessage(error.response?.data?.message || 'Farm could not be saved.'); }
  };

  const manageFields = () => setMessage('Individual field records are not implemented yet; field count is stored at farm level.');

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <div className="page-title">Farm Management</div>
          <div className="page-sub">Saved farm records</div>
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
        <div className="card"><div className="stat-value" style={{ color: 'var(--purple)' }}>{farms.filter(farm => farm.status === 'Active').length}</div><div className="stat-label">Active farms</div></div>
      </div>

      <div className="card">
        <div className="section-title">Farm Portfolio</div>
        <div style={{ display: 'grid', gap: '12px' }}>
          {loading ? <div style={{ color: 'var(--text-muted)' }}>Loading saved farms…</div> : farms.length === 0 ? <div style={{ color: 'var(--text-muted)' }}>No farms saved yet. Add your first farm.</div> : farms.map(farm => {
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

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: '16px' }}>
                  <div><div className="stat-label">Area</div><div style={{ fontWeight: 800 }}>{farm.area} ha</div></div>
                  <div><div className="stat-label">Fields</div><div style={{ fontWeight: 800 }}>{farm.fields}</div></div>
                  <div><div className="stat-label">Last updated</div><div style={{ fontWeight: 800 }}>{new Date(farm.updated_at).toLocaleDateString()}</div></div>
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
