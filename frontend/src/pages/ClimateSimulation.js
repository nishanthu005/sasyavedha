import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, Area, AreaChart } from 'recharts';
import { useLang } from '../context/LanguageContext';
import { getCropLabel } from '../context/cropLocalization';
import { climateLabel } from '../context/climateLocalization';

export default function ClimateSimulation() {
  const { t, lang } = useLang();
  const [selectedCrop, setSelectedCrop] = useState('Rice');
  const [selectedScenario, setSelectedScenario] = useState('moderate');
  const [timeHorizon, setTimeHorizon] = useState('2050');
  const [simulationData, setSimulationData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [customScenario, setCustomScenario] = useState({
    temperature: 0,
    rainfall: 0,
    co2: 0
  });

  const crops = ['Rice', 'Wheat', 'Maize', 'Cotton', 'Tomato', 'Sugarcane'];
  const scenarios = [
    { id: 'optimistic', name: 'Optimistic (+1°C)', temp: 1, rainfall: 5, co2: 50 },
    { id: 'moderate', name: 'Moderate (+2°C)', temp: 2, rainfall: -10, co2: 100 },
    { id: 'pessimistic', name: 'Pessimistic (+3°C)', temp: 3, rainfall: -25, co2: 200 },
    { id: 'extreme', name: 'Extreme (+4°C)', temp: 4, rainfall: -40, co2: 400 }
  ];

  const climateModels = {
    // Temperature Impact Models (based on IPCC research)
    temperatureImpact: (baseYield, tempChange, crop) => {
      const sensitivity = {
        'Rice': -0.08, 'Wheat': -0.06, 'Maize': -0.10, 
        'Cotton': -0.05, 'Tomato': -0.12, 'Sugarcane': -0.04
      };
      return baseYield * (1 + sensitivity[crop] * tempChange);
    },

    // Rainfall Impact Models
    rainfallImpact: (baseYield, rainfallChange, crop) => {
      const sensitivity = {
        'Rice': 0.03, 'Wheat': 0.02, 'Maize': 0.04,
        'Cotton': 0.01, 'Tomato': 0.05, 'Sugarcane': 0.02
      };
      return baseYield * (1 + sensitivity[crop] * (rainfallChange / 100));
    },

    // CO2 Fertilization Effect
    co2Impact: (baseYield, co2Change, crop) => {
      const sensitivity = {
        'Rice': 0.0003, 'Wheat': 0.0004, 'Maize': 0.0002,
        'Cotton': 0.0001, 'Tomato': 0.0003, 'Sugarcane': 0.0002
      };
      return baseYield * (1 + sensitivity[crop] * co2Change);
    },

    // Irrigation Need Calculation
    irrigationNeed: (baseIrrigation, tempChange, rainfallChange) => {
      const tempFactor = 1 + (tempChange * 0.15); // 15% increase per °C
      const rainfallFactor = 1 - (rainfallChange / 100 * 0.5); // 50% of rainfall reduction affects irrigation
      return baseIrrigation * tempFactor * rainfallFactor;
    },

    // Crop Suitability Score
    suitabilityScore: (baseScore, tempChange, rainfallChange, crop) => {
      const optimalTemp = {
        'Rice': 25, 'Wheat': 15, 'Maize': 20,
        'Cotton': 30, 'Tomato': 22, 'Sugarcane': 28
      };
      const currentTemp = optimalTemp[crop];
      const futureTemp = currentTemp + tempChange;
      
      const tempSuitability = Math.max(0, 1 - Math.abs(futureTemp - optimalTemp[crop]) / 20);
      const rainfallSuitability = Math.max(0, 1 + (rainfallChange / 100));
      
      return (tempSuitability * 0.6 + rainfallSuitability * 0.4) * 100;
    }
  };

  const runSimulation = async () => {
    setLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const scenario = scenarios.find(s => s.id === selectedScenario) || customScenario;
    const baseYield = selectedCrop === 'Rice' ? 4.5 : 
                     selectedCrop === 'Wheat' ? 3.8 :
                     selectedCrop === 'Maize' ? 5.2 :
                     selectedCrop === 'Cotton' ? 2.1 :
                     selectedCrop === 'Tomato' ? 6.0 : 8.5;
    
    const baseIrrigation = 500; // mm per season
    const baseSuitability = 85; // percentage

    // Generate yearly projections
    const years = parseInt(timeHorizon) - 2025;
    const yearlyData = [];
    
    for (let i = 0; i <= years; i++) {
      const year = 2025 + i;
      const progressFactor = i / years;
      const tempChange = scenario.temp * progressFactor;
      const rainfallChange = scenario.rainfall * progressFactor;
      const co2Change = scenario.co2 * progressFactor;
      
      const yieldWithTemp = climateModels.temperatureImpact(baseYield, tempChange, selectedCrop);
      const yieldWithRain = climateModels.rainfallImpact(yieldWithTemp, rainfallChange, selectedCrop);
      const finalYield = climateModels.co2Impact(yieldWithRain, co2Change, selectedCrop);
      
      const irrigation = climateModels.irrigationNeed(baseIrrigation, tempChange, rainfallChange);
      const suitability = climateModels.suitabilityScore(baseSuitability, tempChange, rainfallChange, selectedCrop);
      
      yearlyData.push({
        year,
        yield: Math.round(finalYield * 100) / 100,
        irrigation: Math.round(irrigation),
        suitability: Math.round(suitability),
        temperature: (25 + tempChange).toFixed(1),
        rainfall: (1000 + rainfallChange * 10).toFixed(0),
        co2: (400 + co2Change).toFixed(0)
      });
    }

    // Generate impact comparison data
    const currentYear = yearlyData[0];
    const futureYear = yearlyData[yearlyData.length - 1];
    
    const impactData = [
      {
        metric: 'Yield',
        current: currentYear.yield,
        future: futureYear.yield,
        change: ((futureYear.yield - currentYear.yield) / currentYear.yield * 100).toFixed(1),
        unit: 't/ha'
      },
      {
        metric: 'Irrigation',
        current: currentYear.irrigation,
        future: futureYear.irrigation,
        change: ((futureYear.irrigation - currentYear.irrigation) / currentYear.irrigation * 100).toFixed(1),
        unit: 'mm/season'
      },
      {
        metric: 'Suitability',
        current: currentYear.suitability,
        future: futureYear.suitability,
        change: (futureYear.suitability - currentYear.suitability).toFixed(1),
        unit: '%'
      }
    ];

    // Generate adaptation recommendations
    const recommendations = [];
    
    if (parseFloat(impactData[0].change) < -10) {
      recommendations.push({
        priority: 'high',
        category: 'cropManagement',
        action: 'resilientVarieties',
        impact: 'yieldLoss'
      });
    }
    
    if (parseFloat(impactData[1].change) > 20) {
      recommendations.push({
        priority: 'high',
        category: 'waterManagement',
        action: 'dripConservation',
        impact: 'waterReduction'
      });
    }
    
    if (parseFloat(impactData[2].change) < -15) {
      recommendations.push({
        priority: 'medium',
        category: 'landManagement',
        action: 'rotation',
        impact: 'soilHealth'
      });
    }

    recommendations.push({
      priority: 'medium',
      category: 'technology',
      action: 'precision',
      impact: 'resourceUse'
    });

    setSimulationData({
      yearlyProjections: yearlyData,
      impactComparison: impactData,
      recommendations,
      scenario: scenario,
      crop: selectedCrop
    });
    
    setLoading(false);
  };

  useEffect(() => {
    runSimulation();
  }, [selectedCrop, selectedScenario, timeHorizon]);

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <div className="page-title"> {climateLabel('title', lang)}</div>
          <div className="page-sub">{climateLabel('subtitle', lang)}</div>
        </div>
        <button className="btn btn-blue" onClick={runSimulation} disabled={loading}>
          {loading ? ` ${climateLabel('simulate', lang)}` : ` ${climateLabel('run', lang)}`}
        </button>
      </div>

      {/* Control Panel */}
      <div className="card mb-20">
        <div className="section-title"> {climateLabel('parameters', lang)}</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          <div>
            <label>{t.selectCrop}</label>
            <select className="select" value={selectedCrop} onChange={(e) => setSelectedCrop(e.target.value)}>
              {crops.map(crop => <option key={crop} value={crop}>{getCropLabel(crop, lang)}</option>)}
            </select>
          </div>
          <div>
            <label>{t.climateScenario}</label>
            <select className="select" value={selectedScenario} onChange={(e) => setSelectedScenario(e.target.value)}>
              <option value="custom">{t.customScenario}</option>
              {scenarios.map(scenario => (
                <option key={scenario.id} value={scenario.id}>{t[`${scenario.id}Scenario`] || scenario.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label>{climateLabel('timeHorizon', lang)}</label>
            <select className="select" value={timeHorizon} onChange={(e) => setTimeHorizon(e.target.value)}>
              <option value="2030">2030</option>
              <option value="2040">2040</option>
              <option value="2050">2050</option>
              <option value="2070">2070</option>
              <option value="2100">2100</option>
            </select>
          </div>
          <div>
            <label>{climateLabel('modelVersion', lang)}</label>
            <select className="select" defaultValue="ipcc-ar6">
              <option value="ipcc-ar6">IPCC AR6 (2021)</option>
              <option value="custom">{climateLabel('customModel', lang)}</option>
            </select>
          </div>
        </div>

        {selectedScenario === 'custom' && (
          <div style={{ marginTop: '16px', padding: '16px', background: 'var(--surface2)', borderRadius: '8px' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}> {climateLabel('customParameters', lang)}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              <div>
                <label>{climateLabel('temperatureChange', lang)}</label>
                <input 
                  type="range" 
                  min="-2" 
                  max="6" 
                  step="0.5" 
                  value={customScenario.temperature}
                  onChange={(e) => setCustomScenario({...customScenario, temperature: parseFloat(e.target.value)})}
                  style={{ width: '100%' }}
                />
                <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
                  {customScenario.temperature > 0 ? '+' : ''}{customScenario.temperature}°C
                </div>
              </div>
              <div>
                <label>{climateLabel('rainfallChange', lang)}</label>
                <input 
                  type="range" 
                  min="-50" 
                  max="50" 
                  step="5" 
                  value={customScenario.rainfall}
                  onChange={(e) => setCustomScenario({...customScenario, rainfall: parseFloat(e.target.value)})}
                  style={{ width: '100%' }}
                />
                <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
                  {customScenario.rainfall > 0 ? '+' : ''}{customScenario.rainfall}%
                </div>
              </div>
              <div>
                <label>{climateLabel('co2Increase', lang)}</label>
                <input 
                  type="range" 
                  min="0" 
                  max="500" 
                  step="25" 
                  value={customScenario.co2}
                  onChange={(e) => setCustomScenario({...customScenario, co2: parseFloat(e.target.value)})}
                  style={{ width: '100%' }}
                />
                <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
                  +{customScenario.co2} ppm
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <div className="spinner" style={{ width: '40px', height: '40px' }} />
          <div style={{ marginTop: '20px', color: 'var(--text-muted)' }}>{climateLabel('running', lang)}</div>
        </div>
      ) : simulationData && (
        <>
          {/* Impact Summary Cards */}
          <div className="grid-3">
            {simulationData.impactComparison.map((impact, index) => (
              <div key={impact.metric} className="card">
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>
                  {impact.metric === 'Yield' ? '' : impact.metric === 'Irrigation' ? '' : ''}
                </div>
                <div className="section-title">{climateLabel(`${impact.metric.toLowerCase()}Series`, lang)}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                  <div>
                    <div className="stat-value" style={{ 
                      color: parseFloat(impact.change) < 0 ? '#EF4444' : parseFloat(impact.change) > 0 ? '#4ADE80' : '#F59E0B' 
                    }}>
                      {impact.future}
                    </div>
                    <div className="stat-label">{impact.unit}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ 
                      fontSize: '14px', 
                      fontWeight: 600,
                      color: parseFloat(impact.change) < 0 ? '#EF4444' : parseFloat(impact.change) > 0 ? '#4ADE80' : '#F59E0B'
                    }}>
                      {impact.change > 0 ? '+' : ''}{impact.change}%
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{climateLabel('vsCurrent', lang)}</div>
                  </div>
                </div>
                <div style={{ 
                  height: '4px', 
                  background: 'var(--surface2)', 
                  borderRadius: '2px', 
                  overflow: 'hidden' 
                }}>
                  <div style={{ 
                    height: '100%', 
                    width: `${Math.min(100, Math.abs(parseFloat(impact.change)) * 2)}%`,
                    background: parseFloat(impact.change) < 0 ? '#EF4444' : parseFloat(impact.change) > 0 ? '#4ADE80' : '#F59E0B',
                    transition: 'width 0.8s ease'
                  }} />
                </div>
              </div>
            ))}
          </div>

          {/* Climate Projections Chart */}
          <div className="card mb-20">
            <div className="section-title"> {climateLabel('projections', lang)} ({timeHorizon})</div>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={simulationData.yearlyProjections}>
                <CartesianGrid stroke="#1E293B" strokeDasharray="4 4" />
                <XAxis dataKey="year" stroke="#64748B" />
                <YAxis yAxisId="left" stroke="#64748B" />
                <YAxis yAxisId="right" orientation="right" stroke="#64748B" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="yield" stroke="#4ADE80" strokeWidth={2} name={climateLabel('yieldSeries', lang)} />
                <Line yAxisId="right" type="monotone" dataKey="irrigation" stroke="#3B82F6" strokeWidth={2} name={climateLabel('irrigationSeries', lang)} />
                <Line yAxisId="left" type="monotone" dataKey="suitability" stroke="#F59E0B" strokeWidth={2} name={climateLabel('suitabilitySeries', lang)} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Environmental Factors */}
          <div className="grid-2 mb-20">
            <div className="card">
              <div className="section-title"> {climateLabel('environmental', lang)}</div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={simulationData.yearlyProjections}>
                  <CartesianGrid stroke="#1E293B" strokeDasharray="4 4" />
                  <XAxis dataKey="year" stroke="#64748B" />
                  <YAxis stroke="#64748B" />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="temperature" stackId="1" stroke="#EF4444" fill="#EF4444" fillOpacity={0.6} name={`${climateLabel('temperature', lang)} (°C)`} />
                  <Area type="monotone" dataKey="rainfall" stackId="2" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} name={`${climateLabel('rainfall', lang)} (mm)`} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="card">
              <div className="section-title"> {climateLabel('multiFactor', lang)}</div>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={[
                  { factor: climateLabel('temperature', lang), impact: Math.abs(simulationData.scenario.temp * 10), fullMark: 50 },
                  { factor: climateLabel('rainfall', lang), impact: Math.abs(simulationData.scenario.rainfall * 0.8), fullMark: 50 },
                  { factor: climateLabel('co2', lang), impact: Math.abs(simulationData.scenario.co2 * 0.05), fullMark: 50 },
                  { factor: climateLabel('yieldChange', lang), impact: Math.abs(parseFloat(simulationData.impactComparison[0].change)), fullMark: 50 },
                  { factor: climateLabel('waterStress', lang), impact: Math.abs(parseFloat(simulationData.impactComparison[1].change)), fullMark: 50 }
                ]}>
                  <PolarGrid stroke="#1E293B" />
                  <PolarAngleAxis dataKey="factor" stroke="#64748B" />
                  <PolarRadiusAxis stroke="#64748B" />
                  <Radar name={climateLabel('impactLevel', lang)} dataKey="impact" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.6} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Adaptation Recommendations */}
          <div className="card">
            <div className="section-title"> {climateLabel('recommendations', lang)}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '16px' }}>
              {simulationData.recommendations.map((rec, index) => (
                <div key={index} style={{
                  padding: '16px',
                  background: rec.priority === 'high' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                  border: `1px solid ${rec.priority === 'high' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`,
                  borderRadius: '8px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: rec.priority === 'high' ? '#EF4444' : '#3B82F6', marginBottom: '4px' }}>
                        {climateLabel(rec.category, lang)}
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--text)', marginBottom: '8px' }}>
                        {climateLabel(rec.action, lang)}
                      </div>
                    </div>
                    <span className={`tag ${rec.priority === 'high' ? 'tag-red' : 'tag-blue'}`} style={{ fontSize: '10px' }}>
                      {climateLabel(rec.priority, lang)}
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                     {climateLabel(rec.impact, lang)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Scientific Methodology */}
          <div className="card">
            <div className="section-title"> {climateLabel('methodology', lang)}</div>
            <div style={{ fontSize: '12px', lineHeight: 1.6, color: 'var(--text-muted)' }}>
              <div style={{ marginBottom: '12px' }}>
                <strong>{climateLabel('climateModels', lang)}:</strong> {climateLabel('climateModelsText', lang)}
              </div>
              <div style={{ marginBottom: '12px' }}>
                <strong>{climateLabel('impactAlgorithms', lang)}:</strong> {climateLabel('impactAlgorithmsText', lang)}
              </div>
              <div>
                <strong>{climateLabel('uncertainty', lang)}:</strong> {climateLabel('uncertaintyText', lang)}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
