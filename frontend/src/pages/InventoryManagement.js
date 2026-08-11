import React, { useMemo, useState } from 'react';
import { FiBox, FiEdit2, FiPlus, FiSave, FiX } from 'react-icons/fi';

const initialInventory = [
  { id: 1, name: 'Organic Fertilizer NPK', category: 'Fertilizers', quantity: 500, unit: 'kg', status: 'In Stock', lastUpdated: '2026-05-10' },
  { id: 2, name: 'Pesticide BioShield', category: 'Pesticides', quantity: 200, unit: 'L', status: 'In Stock', lastUpdated: '2026-05-08' },
  { id: 3, name: 'Drip Irrigation Pipes', category: 'Equipment', quantity: 150, unit: 'm', status: 'Low Stock', lastUpdated: '2026-05-09' },
  { id: 4, name: 'Seeds - Hybrid Wheat', category: 'Seeds', quantity: 1000, unit: 'kg', status: 'In Stock', lastUpdated: '2026-05-07' },
  { id: 5, name: 'Soil Testing Kit', category: 'Tools', quantity: 25, unit: 'kits', status: 'Out of Stock', lastUpdated: '2026-05-05' },
];

const blankItem = { name: '', category: 'Fertilizers', quantity: '', unit: 'kg', status: 'In Stock' };
const categories = ['Fertilizers', 'Pesticides', 'Equipment', 'Seeds', 'Tools'];

export default function InventoryManagement() {
  const [inventory, setInventory] = useState(initialInventory);
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(blankItem);

  const stats = useMemo(() => ({
    total: inventory.length,
    inStock: inventory.filter(item => item.status === 'In Stock').length,
    lowStock: inventory.filter(item => item.status === 'Low Stock').length,
    outStock: inventory.filter(item => item.status === 'Out of Stock').length,
  }), [inventory]);

  const openAdd = () => {
    setEditingItem(null);
    setForm(blankItem);
    setFormOpen(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setForm(item);
    setFormOpen(true);
  };

  const saveItem = (event) => {
    event.preventDefault();
    const payload = { ...form, quantity: Number(form.quantity), lastUpdated: new Date().toISOString().slice(0, 10) };
    if (editingItem) {
      setInventory(prev => prev.map(item => item.id === editingItem.id ? { ...item, ...payload } : item));
    } else {
      setInventory(prev => [{ ...payload, id: Date.now() }, ...prev]);
    }
    setFormOpen(false);
  };

  const statusClass = (status) => {
    if (status === 'In Stock') return 'status-success';
    if (status === 'Low Stock') return 'status-warning';
    return 'status-danger';
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <div className="page-title">Inventory & Resources</div>
          <div className="page-sub">Track stock levels, tools, and farm resources</div>
        </div>
        <button className="btn btn-blue" onClick={openAdd}><FiPlus /> Add Inventory Item</button>
      </div>

      <div className="grid-4">
        <div className="card"><div className="stat-value">{stats.total}</div><div className="stat-label">Total Items</div></div>
        <div className="card"><div className="stat-value" style={{ color: 'var(--green)' }}>{stats.inStock}</div><div className="stat-label">In Stock</div></div>
        <div className="card"><div className="stat-value" style={{ color: 'var(--orange)' }}>{stats.lowStock}</div><div className="stat-label">Low Stock</div></div>
        <div className="card"><div className="stat-value" style={{ color: 'var(--red)' }}>{stats.outStock}</div><div className="stat-label">Out of Stock</div></div>
      </div>

      <div className="card">
        <div className="section-title">Inventory Overview</div>
        <div style={{ display: 'grid', gap: '12px' }}>
          {inventory.map(item => (
            <div key={item.id} className="soft-row" style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="icon-chip"><FiBox /></div>
                <div>
                  <div style={{ fontWeight: 800, marginBottom: '4px' }}>{item.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.category} / {item.quantity} {item.unit}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>Last updated {item.lastUpdated}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className={`status-pill ${statusClass(item.status)}`}>{item.status}</span>
                <button className="btn btn-secondary" onClick={() => openEdit(item)}><FiEdit2 /> Edit</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card mt-20">
        <div className="section-title">Inventory by Category</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {categories.map(category => {
            const items = inventory.filter(item => item.category === category);
            return (
              <div key={category} className="soft-row">
                <div style={{ fontWeight: 800, marginBottom: '8px' }}>{category}</div>
                <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{items.length} items</div>
                <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '4px' }}>{items.filter(item => item.status === 'In Stock').length} in stock</div>
              </div>
            );
          })}
        </div>
      </div>

      {formOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.62)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <form className="card" onSubmit={saveItem} style={{ maxWidth: '500px', width: '92%' }}>
            <div className="section-title">{editingItem ? 'Edit Inventory Item' : 'Add Inventory Item'}</div>
            <div style={{ display: 'grid', gap: '12px' }}>
              <input className="input" placeholder="Item name" value={form.name} onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))} required />
              <select className="select" value={form.category} onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))}>
                {categories.map(category => <option key={category}>{category}</option>)}
              </select>
              <div className="grid-2" style={{ marginBottom: 0 }}>
                <input className="input" type="number" min="0" placeholder="Quantity" value={form.quantity} onChange={e => setForm(prev => ({ ...prev, quantity: e.target.value }))} required />
                <input className="input" placeholder="Unit" value={form.unit} onChange={e => setForm(prev => ({ ...prev, unit: e.target.value }))} required />
              </div>
              <select className="select" value={form.status} onChange={e => setForm(prev => ({ ...prev, status: e.target.value }))}>
                <option>In Stock</option>
                <option>Low Stock</option>
                <option>Out of Stock</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setFormOpen(false)}><FiX /> Cancel</button>
              <button type="submit" className="btn btn-blue"><FiSave /> Save Item</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
