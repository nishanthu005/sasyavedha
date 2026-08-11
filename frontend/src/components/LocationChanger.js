import React, { useState } from 'react';
import { useLocation } from '../context/LocationContext';
import { useLang } from '../context/LanguageContext';

export default function LocationChanger({ onClose }) {
  const { state, district, season, setState, setDistrict, setSeason, allStates, locationData } = useLocation();
  const { t } = useLang();

  const [tempState, setTempState] = useState(state);
  const [tempDistrict, setTempDistrict] = useState(district);
  const [tempSeason, setTempSeason] = useState(season);
  const [search, setSearch] = useState('');

  const tempDistricts = locationData[tempState]?.districts || [];
  const tempSeasons = locationData[tempState]?.seasons || [];

  const handleStateClick = (s) => {
    setTempState(s);
    setTempDistrict(locationData[s]?.districts[0] || '');
    setTempSeason(locationData[s]?.seasons[0] || 'Kharif');
  };

  const handleApply = () => {
    setState(tempState);
    setDistrict(tempDistrict);
    setSeason(tempSeason);
    onClose();
  };

  const filteredStates = allStates.filter(s => s.toLowerCase().includes(search.toLowerCase()));
  const seasonColors = { Kharif: '#4ADE80', Rabi: '#F59E0B', Zaid: '#22D3EE', Summer: '#F97316', Boro: '#A78BFA' };
  const seasonIcon = s => s === 'Kharif' ? '' : s === 'Rabi' ? '' : s === 'Zaid' ? '' : s === 'Boro' ? '' : '';

  const seasonDesc = {
    Kharif: t.kharifDesc,
    Rabi: t.rabiDesc,
    Zaid: t.zaidDesc,
    Summer: t.summerDesc,
    Boro: t.boroDesc,
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(4px)',
    }} onClick={onClose}>
      <div style={{
        background: '#0F172A', border: '1px solid #1E293B',
        borderRadius: '20px', width: '700px', maxWidth: '95vw',
        maxHeight: '85vh', overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
        animation: 'fadeIn 0.2s ease',
      }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ padding: '22px 24px 16px', borderBottom: '1px solid #1E293B', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#E2E8F0' }}>{t.changeLocation}</div>
            <div style={{ fontSize: '12px', color: '#64748B', marginTop: '3px' }}>{t.changeLocationSub}</div>
          </div>
          <button onClick={onClose} style={{ background: '#1E293B', border: 'none', color: '#94A3B8', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}></button>
        </div>

        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* States list */}
          <div style={{ width: '220px', borderRight: '1px solid #1E293B', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
            <div style={{ padding: '12px' }}>
              <input
                type="text"
                placeholder={t.searchState}
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ width: '100%', background: '#1E293B', border: '1px solid #334155', color: '#CBD5E1', borderRadius: '8px', padding: '8px 10px', fontSize: '12px', fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none' }}
              />
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px 12px' }}>
              {filteredStates.map(s => (
                <button key={s} onClick={() => handleStateClick(s)} style={{
                  width: '100%', textAlign: 'left', padding: '9px 12px',
                  borderRadius: '8px', border: 'none', cursor: 'pointer',
                  background: tempState === s ? 'rgba(74,222,128,0.12)' : 'transparent',
                  color: tempState === s ? '#4ADE80' : '#94A3B8',
                  fontSize: '13px', fontWeight: tempState === s ? 700 : 400,
                  fontFamily: 'inherit', marginBottom: '2px',
                  transition: 'all 0.15s',
                  borderLeft: tempState === s ? '3px solid #4ADE80' : '3px solid transparent',
                }}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Right panel */}
          <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
            {/* Selected state banner */}
            <div style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: '12px', padding: '14px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ fontSize: '28px' }}></div>
              <div>
                <div style={{ fontWeight: 800, color: '#4ADE80', fontSize: '16px' }}>{tempState}</div>
                <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                  {locationData[tempState]?.districts.length} {t.districts} · {locationData[tempState]?.seasons.join(', ')} {t.seasons}
                </div>
              </div>
              <div style={{ marginLeft: 'auto' }}>
                <span style={{ background: 'rgba(74,222,128,0.15)', color: '#4ADE80', border: '1px solid rgba(74,222,128,0.3)', borderRadius: '8px', padding: '4px 10px', fontSize: '11px', fontWeight: 700 }}>
                  {t.defaultCrop}: {locationData[tempState]?.defaultCrop}
                </span>
              </div>
            </div>

            {/* District selector */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px', display: 'block' }}>{t.selectDistrict}</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                {tempDistricts.map(d => (
                  <button key={d} onClick={() => setTempDistrict(d)} style={{
                    padding: '8px 10px', borderRadius: '8px',
                    border: `1px solid ${tempDistrict === d ? 'rgba(34,211,238,0.4)' : '#1E293B'}`,
                    background: tempDistrict === d ? 'rgba(34,211,238,0.1)' : '#0A1628',
                    color: tempDistrict === d ? '#22D3EE' : '#64748B',
                    fontSize: '12px', fontWeight: tempDistrict === d ? 700 : 400,
                    cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                    transition: 'all 0.15s',
                  }}>
                    {tempDistrict === d && ' '}{d}
                  </button>
                ))}
              </div>
            </div>

            {/* Season selector */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px', display: 'block' }}>{t.farmingSeason}</label>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {tempSeasons.map(s => {
                  const color = seasonColors[s] || '#94A3B8';
                  const active = tempSeason === s;
                  return (
                    <button key={s} onClick={() => setTempSeason(s)} style={{
                      padding: '10px 20px', borderRadius: '10px',
                      border: `1px solid ${active ? color + '60' : '#1E293B'}`,
                      background: active ? color + '18' : '#0A1628',
                      color: active ? color : '#64748B',
                      fontWeight: active ? 700 : 400, fontSize: '13px',
                      cursor: 'pointer', fontFamily: 'inherit',
                      transition: 'all 0.2s',
                    }}>
                      {seasonIcon(s)} {s}
                    </button>
                  );
                })}
              </div>
              {seasonDesc[tempSeason] && (
                <div style={{ marginTop: '10px', fontSize: '12px', color: '#475569' }}>
                  {seasonDesc[tempSeason]}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid #1E293B', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0A1628' }}>
          <div style={{ fontSize: '13px', color: '#64748B' }}>
             <span style={{ color: '#CBD5E1', fontWeight: 600 }}>{tempDistrict}, {tempState}</span>
            <span style={{ margin: '0 8px', color: '#334155' }}>·</span>
            <span style={{ color: seasonColors[tempSeason] || '#94A3B8', fontWeight: 600 }}>{tempSeason} {t.locationSeason}</span>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={onClose} style={{ padding: '9px 18px', borderRadius: '9px', background: 'transparent', border: '1px solid #334155', color: '#94A3B8', cursor: 'pointer', fontFamily: 'inherit', fontSize: '13px' }}>
              {t.cancel}
            </button>
            <button onClick={handleApply} style={{ padding: '9px 22px', borderRadius: '9px', background: 'linear-gradient(135deg, #4ADE80, #22C55E)', border: 'none', color: '#0A1628', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: '13px' }}>
              {t.applyLocation}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
