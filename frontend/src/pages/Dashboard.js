import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { FiSave, FiX } from 'react-icons/fi';
import { getDashboard, getFieldDashboard, updateFieldCrop } from '../context/api';
import { useLang } from '../context/LanguageContext';
import { useLocation } from '../context/LocationContext';

function StatCard({ icon, label, value, suffix, accent }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0; const target = parseFloat(value); const step = target / 40;
    const t = setInterval(() => { start += step; if (start >= target) { setDisplay(target); clearInterval(t); } else setDisplay(Math.round(start * 10) / 10); }, 25);
    return () => clearInterval(t);
  }, [value]);
  return (
    <div className="card" style={{ borderColor: accent + '30', background: `linear-gradient(135deg, ${accent}08, var(--surface))` }}>
      <div style={{ fontSize: '26px', marginBottom: '10px' }}>{icon}</div>
      <div className="stat-value" style={{ color: accent }}>{display}{suffix}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) return (
    <div style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: '8px', padding: '10px 14px', fontSize: '12px' }}>
      <div style={{ color: '#94A3B8', marginBottom: '4px' }}>{label}</div>
      {payload.map((p, i) => <div key={i} style={{ color: p.color, fontWeight: 700 }}>{p.name}: {p.value}</div>)}
    </div>
  );
  return null;
};

const seasonColors = { Kharif: '#4ADE80', Rabi: '#F59E0B', Zaid: '#22D3EE', Summer: '#F97316', Boro: '#A78BFA' };

export default function Dashboard() {
  const { t } = useLang();
  const { state, district, season } = useLocation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedField, setSelectedField] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [tempCrop, setTempCrop] = useState('');
  
  const availableCrops = ['Rice', 'Wheat', 'Maize', 'Tomato', 'Cotton', 'Sugarcane', 'Soybean', 'Barley', 'Mustard'];

  // Crop change handler
  const handleCropChange = async (fieldId, newCrop) => {
    try {
      setLoading(true);
      await updateFieldCrop(fieldId, newCrop);
      
      // Refresh the dashboard data to reflect the change
      if (selectedField) {
        const response = await getFieldDashboard(selectedField);
        setData(response.data);
      } else {
        const response = await getDashboard();
        setData(response.data);
      }
      
      setEditingField(null);
      setTempCrop('');
    } catch (error) {
      console.error('Failed to update crop:', error);
      // Fallback: update local state optimistically
      setData(prevData => ({
        ...prevData,
        fields: prevData.fields.map(field =>
          field.id === fieldId ? { ...field, crop: newCrop } : field
        )
      }));
      setEditingField(null);
      setTempCrop('');
    } finally {
      setLoading(false);
    }
  };

  // Offline-aware data fetch
  useEffect(() => {
    setLoading(true);

    // 1. Load any cached snapshot instantly so the UI shows something right away
    try {
      const cached = localStorage.getItem('sasyavedha_dashboard_cache');
      if (cached) {
        setData(JSON.parse(cached));
        setLoading(false); // show stale data immediately; network response will overwrite
      }
    } catch {}

    // 2. Fetch fresh data from the API
    getDashboard()
      .then(r => {
        setData(r.data);
        setLoading(false);

        // 3. Persist to localStorage so the Service Worker's offline.html
        //    and the OfflineBanner can show last-known values
        try {
          localStorage.setItem('sasyavedha_dashboard_cache',    JSON.stringify(r.data));
          localStorage.setItem('sasyavedha_dashboard_cache_at', new Date().toISOString());
        } catch {}
      })
      .catch(() => {
        // Network failed - stale data (if any) is already shown, just clear the spinner
        setLoading(false);
      });
  }, [state, district, season]);

  // Refresh when offline queue flushes (farmer comes back online)
  useEffect(() => {
    const refresh = () => {
      getDashboard()
        .then(r => {
          setData(r.data);
          try {
            localStorage.setItem('sasyavedha_dashboard_cache',    JSON.stringify(r.data));
            localStorage.setItem('sasyavedha_dashboard_cache_at', new Date().toISOString());
          } catch {}
        })
        .catch(() => {});
    };

    window.addEventListener('sasyavedha:queue-flushed', refresh);
    return () => window.removeEventListener('sasyavedha:queue-flushed', refresh);
  }, []);

  // Fetch field-specific data when a field is selected
  useEffect(() => {
    if (selectedField) {
      setLoading(true);
      getFieldDashboard(selectedField)
        .then(r => {
          setData(r.data);
          setLoading(false);
          try {
            localStorage.setItem('sasyavedha_dashboard_cache', JSON.stringify(r.data));
            localStorage.setItem('sasyavedha_dashboard_cache_at', new Date().toISOString());
          } catch {}
        })
        .catch(() => {
          // If field-specific API fails, fall back to general dashboard
          getDashboard()
            .then(r => {
              setData(r.data);
              setLoading(false);
            })
            .catch(() => setLoading(false));
        });
    }
  }, [selectedField]);
  // End field-specific fetch

  if (loading) return <div style={{ textAlign: 'center', paddingTop: '80px' }}><div className="spinner" style={{ width: '40px', height: '40px' }} /></div>;
  if (!data) return <div style={{ color: 'var(--text-muted)', paddingTop: '40px' }}>{t.dashLoadError}</div>;

  const sColor = seasonColors[season] || '#4ADE80';

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <div className="page-title"> {t.dashTitle}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
            <span style={{ fontSize: '13px', color: '#64748B' }}> {district}, {state}</span>
          </div>
        </div>
      </div>

      <div style={{ background: `${sColor}08`, border: `1px solid ${sColor}20`, borderRadius: '12px', padding: '12px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
        <span style={{ fontSize: '24px' }}></span>
        <div>
          <span style={{ fontWeight: 700, color: '#CBD5E1' }}>{district} District, {state}</span>
          <span style={{ color: '#475569', fontSize: '13px', marginLeft: '8px' }}>- {t.cropAdvisory}</span>
        </div>
        <div style={{ marginLeft: 'auto', fontSize: '12px', color: '#64748B' }}>
          {selectedField ? (
            <>
              {t.selectedField}: <span style={{ color: '#22D3EE', fontWeight: 700 }}>Field {selectedField}</span>
              <br />
              {t.defaultCrop}: <span style={{ color: sColor, fontWeight: 700 }}>
                {data.fields?.find(f => f.id === selectedField)?.crop || data.fields?.[0]?.crop || 'Rice'}
              </span>
            </>
          ) : (
            <>
              {t.defaultCrop}: <span style={{ color: sColor, fontWeight: 700 }}>{data.fields?.[0]?.crop || 'Rice'}</span>
            </>
          )}
        </div>
      </div>

      <div className="grid-4">
        <StatCard icon="" label={t.cropHealth} value={data.farm_stats.health_score} suffix="%" accent="#4ADE80" />
        <StatCard icon="" label={t.predictedYield} value={data.farm_stats.predicted_yield} suffix=" t/ha" accent="#22D3EE" />
        <StatCard icon="" label={t.waterSaved} value={data.farm_stats.water_saved_pct} suffix="%" accent="#3B82F6" />
        <StatCard icon="" label={t.activeAlerts} value={data.farm_stats.active_alerts} suffix="" accent="#EF4444" />
      </div>

      <div className="grid-2">
        <div className="card mb-20">
          <div className="section-title"> {t.weeklyWeather} • {district}</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={data.weather} barGap={4}>
              <CartesianGrid stroke="#1E293B" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="temp" name={t.temp} fill="#F59E0B" radius={[4, 4, 0, 0]} />
              <Bar dataKey="rain" name={t.moisture} fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card mb-20">
          <div className="section-title"> {t.smartAlerts}</div>
          {data.alerts.map((a, i) => {
            const colors = { high: '#EF4444', medium: '#F59E0B', low: '#22C55E' };
            const color = colors[a.severity] || '#64748B';
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '11px 0', borderBottom: i < data.alerts.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '17px', flexShrink: 0 }}>{a.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', color: '#CBD5E1', lineHeight: 1.45 }}>{a.message}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px' }}>{a.time}</div>
                </div>
                <span className={`tag tag-${a.severity === 'high' ? 'red' : a.severity === 'medium' ? 'orange' : 'green'}`} style={{ flexShrink: 0 }}>{a.severity}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="section-title"> {t.yieldTrend}</div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={data.yield_trend}>
              <CartesianGrid stroke="#1E293B" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="yield" name={t.predictedYield} stroke={sColor} strokeWidth={2.5} dot={{ fill: sColor, r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="section-title"> {t.myFields} • {state}</div>
          {data.fields.map((f, i) => {
            const isSelected = selectedField === f.id;
            const healthLabel = f.health === 'Good' ? t.healthGood : t.healthAlert;
            const stageMap = { Flowering: t.stageFlowering, Tillering: t.stageTillering, Vegetative: t.stageVegetative };
            const stageLabel = stageMap[f.stage] || f.stage;
            return (
              <div
                key={i}
                onClick={() => {
                  const newSelection = isSelected ? null : f.id;
                  setSelectedField(newSelection);
                  // Clear loading state to show immediate visual feedback
                  if (!newSelection) {
                    setLoading(true);
                    getDashboard()
                      .then(r => {
                        setData(r.data);
                        setLoading(false);
                      })
                      .catch(() => setLoading(false));
                  }
                }}
                style={{
                  padding: '12px',
                  background: isSelected ? sColor + '10' : 'var(--bg)',
                  borderRadius: '10px',
                  marginBottom: i < data.fields.length - 1 ? '10px' : 0,
                  border: isSelected ? `1px solid ${sColor}50` : '1px solid var(--border)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  outline: 'none',
                  transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                  boxShadow: isSelected ? `0 4px 12px ${sColor}20` : 'none',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div>
                    <span style={{ fontWeight: 700, fontSize: '14px', color: isSelected ? sColor : undefined }}>
                      {t.field} {f.id}
                    </span>
                    {isSelected && <span style={{ fontSize: '10px', color: sColor, marginLeft: '6px', fontWeight: 600 }}> {t.viewDetails}</span>}
                    <span style={{ color: 'var(--text-muted)', fontSize: '12px', marginLeft: '8px' }}>{f.crop} • {f.area} ha</span>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <span className={`tag ${f.health === 'Good' ? 'tag-green' : 'tag-orange'}`}>{healthLabel}</span>
                    <span className="tag tag-gray">{stageLabel}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div className="progress-bar" style={{ flex: 1, height: '6px' }}>
                    <div className="progress-fill" style={{ width: `${f.soil_moisture}%`, background: f.soil_moisture < 45 ? '#EF4444' : sColor }} />
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', minWidth: '70px' }}> {f.soil_moisture}%</span>
                </div>
                {isSelected && (
                  <div style={{ marginTop: '10px', padding: '8px 10px', background: 'var(--surface)', borderRadius: '8px', fontSize: '12px', color: '#94A3B8' }}>
                    {loading ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="spinner" style={{ width: '12px', height: '12px' }} />
                        <span>Loading field data...</span>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                          <span> {f.area} ha</span>
                          <span> {t.soilMoistureLabel}: {f.soil_moisture}%</span>
                          <span style={{ color: sColor, fontWeight: 600 }}> Field-specific data loaded</span>
                        </div>
                        
                        {/* Crop Change Section */}
                        <div 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '4px', borderTop: '1px solid var(--border)' }}
                        >
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}> {t.cropType}:</span>
                          {editingField === f.id ? (
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flex: 1 }}>
                              <select 
                                className="select" 
                                value={tempCrop} 
                                onChange={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setTempCrop(e.target.value);
                                }}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                }}
                                style={{ fontSize: '11px', padding: '2px 6px', height: '24px' }}
                              >
                                {availableCrops.map(crop => (
                                  <option key={crop} value={crop}>{crop}</option>
                                ))}
                              </select>
                              <button 
                                className="btn btn-green" 
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleCropChange(f.id, tempCrop);
                                }}
                                style={{ fontSize: '10px', padding: '2px 8px', height: '24px' }}
                              >
                                <FiSave /> Save
                              </button>
                              <button 
                                className="btn btn-gray" 
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setEditingField(null);
                                  setTempCrop('');
                                }}
                                style={{ fontSize: '10px', padding: '2px 8px', height: '24px' }}
                              >
                                <FiX /> Cancel
                              </button>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flex: 1 }}>
                              <span style={{ fontWeight: 600, color: sColor }}>{f.crop}</span>
                              <button 
                                className="btn btn-blue" 
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setEditingField(f.id);
                                  setTempCrop(f.crop);
                                }}
                                style={{ fontSize: '9px', padding: '2px 6px', height: '20px' }}
                              >
                                 Change
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
