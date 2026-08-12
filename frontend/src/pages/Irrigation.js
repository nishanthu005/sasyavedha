import React, { useState } from 'react';
import { getIrrigation } from '../context/api';
import { useLang } from '../context/LanguageContext';
import { getCropLabel, getLocalizedApiText } from '../context/cropLocalization';

const crops = ['Rice', 'Wheat', 'Tomato', 'Maize', 'Cotton'];
const defaults = { crop: 'Rice', location: 'Pune, Maharashtra', field_area: 2 };
const urgencyStyle = {
  HIGH: { color: '#EF4444', tagClass: 'tag-red', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.3)' },
  MEDIUM: { color: '#F59E0B', tagClass: 'tag-orange', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.3)' },
  LOW: { color: '#22C55E', tagClass: 'tag-green', bg: 'rgba(74,222,128,0.08)', border: 'rgba(74,222,128,0.3)' },
};

export default function Irrigation() {
  const { t, lang } = useLang();
  const [form, setForm] = useState(defaults);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    setLoading(true); setError(''); setResult(null);
    try { const res = await getIrrigation(form); setResult(res.data); }
    catch { setError('Backend not reachable. Run: cd backend && python app.py'); }
    setLoading(false);
  };

  const s = result ? (urgencyStyle[result.urgency] || urgencyStyle.LOW) : null;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <div className="page-title"> {t.irrigationTitle}</div>
          <div className="page-sub">{t.irrigationSub}</div>
        </div>
      </div>

      {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', color: '#EF4444', fontSize: '13px' }}> {error}</div>}

      <div className="grid-2">
        <div className="card mb-20">
          <div className="section-title">Farm details</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '18px' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label>{t.cropType}</label>
              <select className="select" value={form.crop} onChange={e => update('crop', e.target.value)}>
                {crops.map(c => <option key={c} value={c}>{getCropLabel(c, lang)}</option>)}
              </select>
            </div>
            {[{ key: 'location', label: 'Farm location', type: 'text' }, { key: 'field_area', label: t.fieldArea, step: 0.1 }].map(f => (
              <div key={f.key}>
                <label>{f.label}</label>
                <input type={f.type || 'number'} className="input" value={form[f.key]} step={f.step || 1} onChange={e => update(f.key, f.type === 'text' ? e.target.value : parseFloat(e.target.value) || 0)} />
              </div>
            ))}
          </div>
          <button className="btn btn-blue" onClick={submit} disabled={loading} style={{ width: '100%' }}>
            {loading ? <><span className="spinner" /> {t.calculating}</> : ` ${t.getAdvice}`}
          </button>
        </div>

        <div>
          {!result && !loading && <div className="card" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}><div style={{ fontSize: '48px', marginBottom: '14px' }}></div><div style={{ fontWeight: 600 }}>{t.getAdvice}</div></div>}
          {loading && <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}><div className="spinner" style={{ width: '40px', height: '40px', margin: '0 auto 16px' }} /><div style={{ color: '#4ADE80', fontWeight: 600 }}>{t.calculating}</div></div>}
          {result && (
            <div className="fade-in">
              <div style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: '16px', padding: '22px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div style={{ fontSize: '14px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Weather-based water need</div>
                  <span className={`tag ${s.tagClass}`}>{result.urgency}</span>
                </div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: s.color, marginBottom: '12px' }}>{getLocalizedApiText(result.moisture_status, lang)}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{result.weather.location}: {result.weather.temperature}°C, {result.weather.humidity}% humidity, {result.weather.forecast_rainfall} mm forecast rain</div>
              </div>
              <div className="card mb-20">
                <div className="section-title"> {t.recommendation}</div>
                <div style={{ padding: '14px', background: 'var(--bg)', borderRadius: '10px', border: '1px solid var(--border)', marginBottom: '12px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>{t.actionRequired}</div>
                  <div style={{ fontWeight: 700, color: '#CBD5E1' }}>{getLocalizedApiText(result.recommended_time, lang)}</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div style={{ padding: '12px', background: 'var(--bg)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>{t.waterNeeded}</div>
                    <div style={{ fontWeight: 700, color: '#3B82F6', fontSize: '18px' }}>{result.water_needed_liters}L</div>
                  </div>
                  <div style={{ padding: '12px', background: 'var(--bg)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>{t.evapotranspiration}</div>
                    <div style={{ fontWeight: 700, color: '#F59E0B', fontSize: '18px' }}>{result.evapotranspiration_mm} mm</div>
                  </div>
                </div>
              </div>
              <div className="card" style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)' }}>
                <div style={{ fontSize: '13px', color: '#3B82F6', fontWeight: 600 }}> {getLocalizedApiText(result.water_saving_tip, lang)}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {result && (
        <div className="card fade-in">
          <div className="section-title"> {t.weeklySchedule}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px' }}>
            {result.weekly_schedule.map((day, i) => (
              <div key={i} style={{ background: day.rain > 0 ? 'rgba(59,130,246,0.08)' : day.irrigate ? 'rgba(239,68,68,0.08)' : 'rgba(74,222,128,0.06)', border: `1px solid ${day.rain > 0 ? 'rgba(59,130,246,0.25)' : day.irrigate ? 'rgba(239,68,68,0.25)' : 'rgba(74,222,128,0.2)'}`, borderRadius: '12px', padding: '12px 8px', textAlign: 'center' }}>
                <div style={{ fontWeight: 700, fontSize: '12px', color: '#CBD5E1', marginBottom: '6px' }}>{day.date.split(' ')[0]}</div>
                <div style={{ fontSize: '24px', marginBottom: '6px' }}>{day.rain > 0 ? '' : day.irrigate ? '' : ''}</div>
                <div style={{ fontSize: '11px', color: '#94A3B8' }}>{day.temp}°C</div>
                {day.rain > 0 ? <div style={{ fontSize: '10px', color: '#3B82F6', marginTop: '4px', fontWeight: 600 }}>{day.rain}mm</div>
                  : day.irrigate ? <div style={{ fontSize: '10px', color: '#EF4444', marginTop: '4px', fontWeight: 600 }}>{t.irrigate}</div>
                  : <div style={{ fontSize: '10px', color: '#4ADE80', marginTop: '4px', fontWeight: 600 }}>{t.skip}</div>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
