import React from 'react';

const sectionStyle = { color: '#CBD5E1', fontSize: '13px', lineHeight: 1.7, margin: 0 };

export default function DiseaseAdvice({ result }) {
  const products = result.products || [];
  return <div className="fade-in">
    <section className="card mb-20"><div className="section-title">Disease overview</div><p style={sectionStyle}>{result.description || result.symptoms}</p></section>
    <section className="card mb-20"><div className="section-title">Symptoms observed</div><p style={sectionStyle}>{result.symptoms}</p></section>
    <section className="card card-accent-green mb-20"><div className="section-title">General treatment and prevention</div><p style={sectionStyle}>{result.general_measures || result.prevention}</p></section>
    <section className="card mb-20"><div className="section-title">Chemical treatment</div><p style={sectionStyle}>{result.chemical_treatment || result.treatment}</p></section>
    <section className="card mb-20"><div className="section-title">Recommended products and use</div>
      {products.length ? products.map(product => <div key={product.name} style={{ borderTop: '1px solid var(--border)', padding: '10px 0' }}><strong>{product.name}</strong> <span style={{ color: 'var(--text-muted)' }}>({product.type})</span><p style={sectionStyle}>{product.use}</p></div>) : <p style={sectionStyle}>No product is required for this result.</p>}
    </section>
    <p style={{ color: 'var(--text-muted)', fontSize: '11px' }}>Always follow the product label, use personal protective equipment, and confirm local registration and crop-stage suitability with an agricultural advisor.</p>
  </div>;
}
