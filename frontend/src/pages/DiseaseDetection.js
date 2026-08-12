import React, { useState, useRef } from 'react';
import { detectDisease } from '../context/api';
import { useLang } from '../context/LanguageContext';
import { getCropLabel, getDiseaseLabel } from '../context/cropLocalization';
import DiseaseAdvice from '../components/DiseaseAdvice';

const crops = ['Tomato', 'Rice', 'Wheat', 'Maize', 'Cotton'];
const severityColor = { High: '#EF4444', Medium: '#F59E0B', Low: '#22C55E', None: '#4ADE80' };
const severityClass = { High: 'tag-red', Medium: 'tag-orange', Low: 'tag-green', None: 'tag-green' };

export default function DiseaseDetection() {
  const { t, lang } = useLang();
  const [crop, setCrop] = useState('Tomato');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState('');
  const fileRef = useRef();

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) { setError('Please upload a valid image file.'); return; }
    setError('');
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
      runAnalysis(e.target.result.split(',')[1]);
    };
    reader.readAsDataURL(file);
  };

  const runAnalysis = async (base64 = null) => {
    setLoading(true); setResult(null); setError('');
    try {
      const res = await detectDisease(crop, base64);
      setResult(res.data);
    } catch {
      setError('Backend not reachable. Start Flask server: cd backend && python app.py');
    }
    setLoading(false);
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <div className="page-title"> {t.diseaseTitle}</div>
          <div className="page-sub">{t.diseaseSub}</div>
        </div>
      </div>

      {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', color: '#EF4444', fontSize: '13px' }}> {error}</div>}

      <div className="grid-2">
        <div>
          <div className="card mb-20">
            <div className="section-title"> {t.cropSelection}</div>
            <label>{t.selectCrop}</label>
            <select className="select" value={crop} onChange={e => setCrop(e.target.value)}>
              {crops.map(c => <option key={c} value={c}>{getCropLabel(c, lang)}</option>)}
            </select>
          </div>

          <div className="card mb-20">
            <div className="section-title"> {t.uploadImage}</div>
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
              onClick={() => fileRef.current.click()}
              style={{ border: `2px dashed ${dragOver ? '#4ADE80' : '#1E3A2F'}`, borderRadius: '14px', padding: '36px 20px', textAlign: 'center', cursor: 'pointer', background: dragOver ? 'rgba(74,222,128,0.05)' : '#0A1628', transition: 'all 0.2s', marginBottom: '14px' }}
            >
              {imagePreview
                ? <img src={imagePreview} alt="Leaf" style={{ maxHeight: '160px', maxWidth: '100%', borderRadius: '8px' }} />
                : <><div style={{ fontSize: '44px', marginBottom: '12px' }}></div>
                  <div style={{ color: '#4ADE80', fontWeight: 600, fontSize: '14px' }}>{t.dropImage}</div>
                  <div style={{ color: '#475569', fontSize: '12px', marginTop: '6px' }}>{t.clickBrowse}</div>
                  <div style={{ color: '#334155', fontSize: '11px', marginTop: '10px' }}>{t.supported}</div></>
              }
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-green" onClick={() => runAnalysis()} disabled={loading} style={{ flex: 1 }}>
                {loading ? <><span className="spinner" /> {t.analyzing}</> : ` ${t.analyzeNow}`}
              </button>
              {imagePreview && <button className="btn btn-outline" onClick={() => { setImagePreview(null); setResult(null); }}>{t.clear}</button>}
            </div>
          </div>

          <div className="card card-accent-cyan">
            <div className="section-title"> {t.modelInfo}</div>
            {[[t.architecture, 'MobileNetV2 transfer-learning CNN'], [t.dataset, 'Labelled PlantVillage leaf images'], [t.classes, 'Classes in trained model'], [t.accuracy, 'Shown after local validation'], [t.framework, 'TensorFlow / Keras']].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: '13px' }}>
                <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                <span style={{ color: '#CBD5E1', fontWeight: 600 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          {loading && (
            <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px', animation: 'spin 2s linear infinite', display: 'inline-block' }}></div>
              <div style={{ color: '#4ADE80', fontWeight: 700, fontSize: '16px' }}>{t.runningCNN}</div>
              <div style={{ background: 'var(--surface2)', borderRadius: '6px', height: '6px', marginTop: '24px', overflow: 'hidden' }}>
                <div style={{ height: '100%', background: 'linear-gradient(90deg, #4ADE80, #22D3EE)', animation: 'progress 2s ease-in-out forwards', borderRadius: '6px' }} />
              </div>
              <style>{`@keyframes progress { from { width: 0% } to { width: 88% } }`}</style>
            </div>
          )}
          {!loading && !result && (
            <div className="card" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '48px', marginBottom: '14px' }}></div>
              <div style={{ fontWeight: 600, marginBottom: '8px' }}>{t.uploadToStart}</div>
              <div style={{ fontSize: '13px' }}>Upload a leaf image to begin analysis.</div>
            </div>
          )}
          {!loading && result && (
            <div className="fade-in">
              <div className="card card-accent-red mb-20">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>{t.cropAnalyzed}</div>
                    <div style={{ fontWeight: 700, fontSize: '16px' }}>{getCropLabel(result.crop, lang)}</div>
                  </div>
                  <span className={`tag ${severityClass[result.severity] || 'tag-gray'}`}>{result.severity}</span>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>{t.diseaseDetected}</div>
                  <div style={{ fontSize: '24px', fontWeight: 900, color: result.disease === 'Healthy' ? '#4ADE80' : '#EF4444', letterSpacing: '-0.5px' }}>
                    {result.disease === 'Healthy' ? ' ' : ' '}{getDiseaseLabel(result.disease, lang)}
                  </div>
                  {result.pathogen !== 'None' && <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', fontStyle: 'italic' }}>{result.pathogen}</div>}
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{t.confidence}</span>
                    <span style={{ fontWeight: 700, color: severityColor[result.severity] }}>{result.confidence}%</span>
                  </div>
                  <div className="progress-bar" style={{ height: '10px' }}>
                    <div className="progress-fill" style={{ width: `${result.confidence}%`, background: `linear-gradient(90deg, ${severityColor[result.severity]}80, ${severityColor[result.severity]})` }} />
                  </div>
                </div>
              </div>
              <DiseaseAdvice result={result} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
