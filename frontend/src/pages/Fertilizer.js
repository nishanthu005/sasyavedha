import React, { useState } from 'react';
import { getFertilizer } from '../context/api';
import { useLang } from '../context/LanguageContext';
import { getCropLabel, getLocalizedApiText } from '../context/cropLocalization';

const crops = ['Rice', 'Wheat', 'Maize', 'Tomato', 'Cotton'];
const defaults = { crop: 'Rice', nitrogen: 80, phosphorus: 35, potassium: 45, ph: 6.3, area: 2 };
const levelColor = { low: '#EF4444', medium: '#F59E0B', high: '#22C55E' };
const levelTag = { low: 'tag-red', medium: 'tag-orange', high: 'tag-green' };

export default function Fertilizer() {
  const { t, lang } = useLang();
  const [form, setForm] = useState(defaults);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    setLoading(true); setError(''); setResult(null);
    try { const res = await getFertilizer(form); setResult(res.data); }
    catch { setError('Backend not reachable. Run: cd backend && python app.py'); }
    setLoading(false);
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <div className="page-title"> {t.fertilizerTitle}</div>
          <div className="page-sub">{t.fertilizerSub}</div>
        </div>
        <span className="tag tag-purple">NPK Analysis</span>
      </div>

      {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', color: '#EF4444', fontSize: '13px' }}> {error}</div>}

      <div className="grid-2">
        <div>
          <div className="card mb-20">
            <div className="section-title"> {t.soilTest}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '18px' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label>{t.cropType}</label>
                <select className="select" value={form.crop} onChange={e => update('crop', e.target.value)}>
                  {crops.map(c => <option key={c} value={c}>{getCropLabel(c, lang)}</option>)}
                </select>
              </div>
              {[
                { key: 'nitrogen', label: t.nitrogen, thresholds: [100, 200] },
                { key: 'phosphorus', label: t.phosphorus, thresholds: [40, 80] },
                { key: 'potassium', label: t.potassium, thresholds: [50, 100] },
                { key: 'ph', label: t.ph, step: 0.1, thresholds: [6.0, 7.5] },
                { key: 'area', label: t.area, step: 0.1 },
              ].map(f => {
                const val = form[f.key];
                const color = f.thresholds ? (val < f.thresholds[0] ? '#EF4444' : val > f.thresholds[1] ? '#22C55E' : '#F59E0B') : '#CBD5E1';
                return (
                  <div key={f.key} style={{ gridColumn: f.key === 'area' ? '1 / -1' : 'span 1' }}>
                    <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>{f.label}</span><span style={{ color, fontWeight: 700 }}>{val}</span>
                    </label>
                    <input type="number" className="input" value={val} step={f.step || 1} onChange={e => update(f.key, parseFloat(e.target.value) || 0)} style={{ borderColor: color + '50' }} />
                  </div>
                );
              })}
            </div>
            <button className="btn btn-green" onClick={submit} disabled={loading} style={{ width: '100%' }}>
              {loading ? <><span className="spinner" /> {t.fertAnalyzing}</> : ` ${t.getRecommendations}`}
            </button>
          </div>

          <div className="card">
            <div className="section-title"> {t.npkView}</div>
            {['nitrogen', 'phosphorus', 'potassium'].map((k, i) => {
              const maxVals = { nitrogen: 400, phosphorus: 200, potassium: 300 };
              const pct = Math.min((form[k] / maxVals[k]) * 100, 100);
              const color = pct < 35 ? '#EF4444' : pct < 65 ? '#F59E0B' : '#4ADE80';
              return (
                <div key={k} style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px' }}>
                    <span style={{ color: '#CBD5E1' }}>{[t.nitrogen, t.phosphorus, t.potassium][i].split('—')[0]}</span>
                    <span style={{ color, fontWeight: 700 }}>{form[k]} kg/ha</span>
                  </div>
                  <div className="progress-bar" style={{ height: '10px' }}>
                    <div className="progress-fill" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}60, ${color})` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          {!result && !loading && <div className="card" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}><div style={{ fontSize: '48px', marginBottom: '14px' }}></div><div style={{ fontWeight: 600 }}>{t.enterSoilData}</div></div>}
          {loading && <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}><div className="spinner" style={{ width: '40px', height: '40px', margin: '0 auto 16px' }} /><div style={{ color: '#4ADE80', fontWeight: 600 }}>{t.fertAnalyzing}</div></div>}
          {result && (
            <div className="fade-in">
              <div className="card mb-20">
                <div className="section-title"> {t.nutrientStatus}</div>
                {Object.entries(result.soil_analysis).map(([nutrient, info]) => (
                  <div key={nutrient} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: 'var(--bg)', borderRadius: '10px', marginBottom: '8px', border: '1px solid var(--border)' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '14px', textTransform: 'capitalize' }}>{nutrient}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{info.value} {info.unit || ''}</div>
                    </div>
                    <span className={`tag ${levelTag[info.level || info.status] || 'tag-green'}`}>{(info.level || info.status).toUpperCase()}</span>
                  </div>
                ))}
              </div>
              <div className="card mb-20">
                <div className="section-title"> {t.prescription}</div>
                {result.recommendations.filter(r => r.fertilizer !== 'None needed').map((r, i) => (
                  <div key={i} style={{ padding: '14px', background: 'var(--bg)', borderRadius: '12px', marginBottom: '10px', border: `1px solid ${levelColor[r.level]}30` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 700, fontSize: '14px' }}>{r.fertilizer}</span>
                      <span style={{ fontWeight: 700, color: levelColor[r.level], fontSize: '13px' }}>{r.dose}</span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{r.nutrient} · <span style={{ color: levelColor[r.level] }}>{r.level.toUpperCase()}</span></div>
                  </div>
                ))}
              </div>
              <div className="card mb-20" style={{ background: 'rgba(167,139,250,0.06)', border: '1px solid rgba(167,139,250,0.2)' }}>
                <div className="section-title"> {t.phCorrection}</div>
                <p style={{ fontSize: '13px', color: '#CBD5E1', lineHeight: 1.7 }}>{getLocalizedApiText(result.ph_recommendation, lang)}</p>
              </div>
              <div className="grid-2">
                <div className="card card-accent-green" style={{ textAlign: 'center', padding: '20px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>{t.totalCost}</div>
                  <div style={{ fontSize: '32px', fontWeight: 900, color: '#4ADE80', letterSpacing: '-1px' }}>₹{result.total_cost_inr.toLocaleString()}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>{form.area} ha</div>
                </div>
                <div className="card">
                  <div className="section-title"> {t.applySchedule}</div>
                  {result.application_schedule.map((s, i) => (
                    <div key={i} style={{ fontSize: '12px', padding: '6px 0', borderBottom: i < 2 ? '1px solid var(--border)' : 'none' }}>
                      <div style={{ color: '#22D3EE', fontWeight: 600, marginBottom: '2px' }}>{s.timing}</div>
                      <div style={{ color: '#94A3B8' }}>{s.apply}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card" style={{ marginTop: '16px', background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.2)' }}>
                <div style={{ fontSize: '13px', color: '#4ADE80' }}> <strong>{t.organicAlt}:</strong> <span style={{ color: '#CBD5E1' }}>{getLocalizedApiText(result.organic_option, lang)}</span></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
