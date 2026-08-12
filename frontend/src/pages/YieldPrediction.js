import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from 'recharts';
import { predictYield } from '../context/api';
import { useLang } from '../context/LanguageContext';
import { getCropLabel } from '../context/cropLocalization';

const crops = ['Rice', 'Wheat', 'Maize', 'Tomato', 'Cotton', 'Sugarcane', 'Soybean'];
const defaults = { crop: 'Rice', location: 'Pune, Maharashtra', area: 2 };

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) return (
    <div style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: '8px', padding: '10px 14px', fontSize: '12px' }}>
      <div style={{ color: '#94A3B8', marginBottom: '4px' }}>{label}</div>
      {payload.map((p, i) => <div key={i} style={{ color: p.color, fontWeight: 700 }}>{p.name}: {p.value} t/ha</div>)}
    </div>
  );
  return null;
};

export default function YieldPrediction() {
  const { t, lang } = useLang();
  const [form, setForm] = useState(defaults);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    setLoading(true); setError(''); setResult(null);
    try { const res = await predictYield(form); setResult(res.data); }
    catch { setError('Backend not reachable. Run: cd backend && python app.py'); }
    setLoading(false);
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <div className="page-title"> {t.yieldTitle}</div>
          <div className="page-sub">{t.yieldSub}</div>
        </div>
      </div>

      {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', color: '#EF4444', fontSize: '13px' }}> {error}</div>}

      <div className="card mb-20">
        <div className="section-title"> {t.inputParams}</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
          <div>
            <label>{t.cropType}</label>
            <select className="select" value={form.crop} onChange={e => update('crop', e.target.value)}>
              {crops.map(c => <option key={c} value={c}>{getCropLabel(c, lang)}</option>)}
            </select>
          </div>
          {[{ key: 'location', label: 'Farm location', type: 'text' }, { key: 'area', label: t.fieldArea, step: 0.1 }].map(f => (
            <div key={f.key}>
              <label>{f.label}</label>
              <input type={f.type || 'number'} className="input" value={form[f.key]} step={f.step || 1} onChange={e => update(f.key, f.type === 'text' ? e.target.value : parseFloat(e.target.value) || 0)} />
            </div>
          ))}
        </div>
        <button className="btn btn-cyan" onClick={submit} disabled={loading}>
          {loading ? <><span className="spinner" /> {t.predicting}</> : ` ${t.predictBtn}`}
        </button>
      </div>

      {result && (
        <div className="fade-in">
          <div className="grid-3 mb-20">
            <div className="card card-accent-cyan" style={{ textAlign: 'center', padding: '28px' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>{t.yieldPerHa}</div>
              <div style={{ fontSize: '52px', fontWeight: 900, color: '#22D3EE', letterSpacing: '-2px', lineHeight: 1 }}>{result.predicted_yield_per_ha}</div>
              <div style={{ color: '#94A3B8', marginTop: '6px' }}>{t.tonsPerHa}</div>
              <div style={{ marginTop: '14px', padding: '8px 14px', background: result.vs_district_pct >= 0 ? 'rgba(74,222,128,0.12)' : 'rgba(239,68,68,0.12)', border: `1px solid ${result.vs_district_pct >= 0 ? 'rgba(74,222,128,0.3)' : 'rgba(239,68,68,0.3)'}`, borderRadius: '8px' }}>
                <span style={{ color: result.vs_district_pct >= 0 ? '#4ADE80' : '#EF4444', fontWeight: 700, fontSize: '13px' }}>
                  {result.vs_district_pct >= 0 ? '↑' : '↓'} {Math.abs(result.vs_district_pct)}% vs avg ({result.district_average} t/ha)
                </span>
              </div>
            </div>
            <div className="card card-accent-green" style={{ textAlign: 'center', padding: '28px' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>{t.totalProduction}</div>
              <div style={{ fontSize: '52px', fontWeight: 900, color: '#4ADE80', letterSpacing: '-2px', lineHeight: 1 }}>{result.total_yield}</div>
              <div style={{ color: '#94A3B8', marginTop: '6px' }}>tons ({result.area} ha)</div>
              <div style={{ marginTop: '14px', color: 'var(--text-muted)', fontSize: '13px' }}>
                {t.estRevenue}: <span style={{ color: '#4ADE80', fontWeight: 700 }}>₹{(result.total_yield * 18000).toLocaleString()}</span>
              </div>
            </div>
            <div className="card" style={{ padding: '28px' }}>
              <div className="section-title"> {t.modelDetails}</div>
              {[[t.algorithm, 'Random Forest + GBM'], [t.rSquared, '0.91'], [t.mae, '0.18 t/ha'], [t.trainingData, t.trainingRecords]].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: '12px', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                  <span style={{ color: '#CBD5E1', fontWeight: 600 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="grid-2">
            <div className="card">
              <div className="section-title"> {t.monthlyTrend}</div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={result.monthly_trend}>
                  <CartesianGrid stroke="#1E293B" strokeDasharray="4 4" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                  <Bar dataKey="yield" name="Yield" fill="#22D3EE" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="card">
              <div className="section-title"> {t.featureImportance}</div>
              {Object.entries(result.feature_importance).map(([k, v]) => (
                <div key={k} style={{ marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '13px', color: '#CBD5E1' }}>{k}</span>
                    <span style={{ fontSize: '12px', color: '#22D3EE', fontWeight: 700 }}>{v}%</span>
                  </div>
                  <div className="progress-bar" style={{ height: '7px' }}>
                    <div className="progress-fill" style={{ width: `${v}%`, background: 'linear-gradient(90deg, #22D3EE60, #22D3EE)' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          {result.weather && <div className="card" style={{ marginTop: '20px', fontSize: '13px', color: 'var(--text-muted)' }}>Live weather for <strong style={{ color: '#CBD5E1' }}>{result.weather.location}</strong>: {result.weather.temperature}°C, {result.weather.humidity}% humidity, {result.weather.forecast_rainfall} mm forecast rain.</div>}
        </div>
      )}
    </div>
  );
}
