import React, { useState, useRef, useEffect } from 'react';
import { FiCheck, FiChevronDown, FiChevronUp, FiGlobe } from 'react-icons/fi';
import { useLang } from '../context/LanguageContext';

export default function LanguageSwitcher() {
  const { lang, setLang, translations } = useLang();
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const current = translations[lang];

  return (
    <div ref={ref} style={{ position: 'relative', userSelect: 'none' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '7px',
          background: 'var(--sidebar-hover)',
          border: '1px solid rgba(54,194,117,0.25)',
          padding: '8px 12px',
          color: 'var(--text)',
          cursor: 'pointer',
          fontSize: '13px',
          fontWeight: 700,
          fontFamily: 'inherit',
        }}
      >
        <FiGlobe size={15} />
        <span>{current.name}</span>
        <span style={{ color: 'var(--text-muted)', display: 'inline-flex' }}>
          {open ? <FiChevronUp size={13} /> : <FiChevronDown size={13} />}
        </span>
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          right: 0,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          minWidth: '170px',
          overflow: 'hidden',
          boxShadow: '0 16px 40px rgba(0,0,0,0.35)',
          zIndex: 999,
          animation: 'fadeIn 0.15s ease',
        }}>
          {Object.entries(translations).map(([code, tr]) => (
            <button
              key={code}
              onClick={() => { setLang(code); setOpen(false); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                width: '100%',
                padding: '11px 14px',
                background: lang === code ? 'var(--sidebar-active)' : 'transparent',
                border: 'none',
                borderBottom: '1px solid var(--border)',
                color: lang === code ? 'var(--green)' : 'var(--text-muted)',
                fontSize: '13px',
                fontWeight: lang === code ? 800 : 500,
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: 'inherit',
              }}
            >
              <span style={{ fontSize: '11px', fontWeight: 900, minWidth: '24px', textTransform: 'uppercase' }}>{code}</span>
              <span>{tr.name}</span>
              {lang === code && <FiCheck style={{ marginLeft: 'auto' }} size={14} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
