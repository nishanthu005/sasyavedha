import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { getEnterpriseOverview } from '../context/api';

const colours = ['#4ADE80', '#F59E0B', '#3B82F6', '#EF4444', '#8B5CF6', '#22D3EE'];

export default function EnterpriseOverview() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    getEnterpriseOverview().then(response => setData(response.data)).catch(() => setError('Could not load your farm portfolio. Please try again.'));
  }, []);
  if (!data && !error) return <div style={{ textAlign: 'center', paddingTop: '80px' }}><div className="spinner" style={{ width: '40px', height: '40px' }} /></div>;
  if (error) return <div className="card" style={{ color: 'var(--red)' }}>{error}</div>;
  const chartData = data.crop_distribution.map((crop, index) => ({ ...crop, color: colours[index % colours.length] }));
  return <div className="fade-in">
    <div className="page-header"><div><div className="page-title">Farm Overview</div><div className="page-sub">Values are calculated from farms you have saved.</div></div></div>
    <div className="grid-3">
      <div className="card"><div className="stat-value" style={{ color: '#4ADE80' }}>{data.total_farms}</div><div className="stat-label">Saved farms</div></div>
      <div className="card"><div className="stat-value" style={{ color: '#3B82F6' }}>{data.total_fields}</div><div className="stat-label">Recorded fields</div></div>
      <div className="card"><div className="stat-value" style={{ color: '#F59E0B' }}>{data.total_area}</div><div className="stat-label">Recorded area (ha)</div></div>
    </div>
    {!chartData.length ? <div className="card" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>No farm data yet. Add your first farm in Farm Management to see verified portfolio totals.</div> : <div className="grid-2"><div className="card"><div className="section-title">Crop area distribution</div><ResponsiveContainer width="100%" height={300}><PieChart><Pie data={chartData} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value} ha`} outerRadius={90} dataKey="value">{chartData.map((entry, index) => <Cell key={entry.name} fill={entry.color} />)}</Pie><Tooltip formatter={(value) => `${value} ha`} /></PieChart></ResponsiveContainer></div><div className="card"><div className="section-title">Data status</div><p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>This overview contains only saved farm records. Yield, revenue, health scores, and efficiency trends are intentionally not shown until the application records measured field data.</p><div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Last farm update: {data.last_updated ? new Date(data.last_updated).toLocaleString() : 'Not available'}</div></div></div>}
  </div>;
}
