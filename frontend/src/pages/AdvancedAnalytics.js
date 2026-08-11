import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

export default function AdvancedAnalytics() {
  const [timeRange, setTimeRange] = useState('6months');
  const [selectedMetric, setSelectedMetric] = useState('yield');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const exportReport = () => {
    if (!data) return;
    const content = JSON.stringify({ timeRange, selectedMetric, generatedAt: new Date().toISOString(), data }, null, 2);
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([content], { type: 'application/json' }));
    link.download = `analytics-${timeRange}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  useEffect(() => {
    // Mock analytics data
    setTimeout(() => {
      setData({
        yieldTrend: [
          { month: 'Jan', rice: 4.2, wheat: 3.8, cotton: 2.1, tomato: 5.2 },
          { month: 'Feb', rice: 4.5, wheat: 4.0, cotton: 2.3, tomato: 5.5 },
          { month: 'Mar', rice: 4.8, wheat: 4.2, cotton: 2.5, tomato: 5.8 },
          { month: 'Apr', rice: 5.1, wheat: 4.5, cotton: 2.8, tomato: 6.1 },
          { month: 'May', rice: 4.9, wheat: 4.3, cotton: 2.6, tomato: 5.9 },
          { month: 'Jun', rice: 5.3, wheat: 4.7, cotton: 3.0, tomato: 6.3 }
        ],
        resourceEfficiency: [
          { category: 'Water', current: 78, target: 85, benchmark: 72 },
          { category: 'Fertilizer', current: 82, target: 90, benchmark: 75 },
          { category: 'Pesticides', current: 71, target: 80, benchmark: 68 },
          { category: 'Labor', current: 85, target: 88, benchmark: 80 },
          { category: 'Energy', current: 73, target: 82, benchmark: 70 }
        ],
        farmPerformance: [
          { farm: 'Green Valley', yield: 4.8, efficiency: 85, sustainability: 78, profitability: 82 },
          { farm: 'Sunshine Acres', yield: 5.2, efficiency: 92, sustainability: 88, profitability: 91 },
          { farm: 'Golden Harvest', yield: 4.3, efficiency: 78, sustainability: 72, profitability: 75 },
          { farm: 'Terra Nova', yield: 5.1, efficiency: 89, sustainability: 85, profitability: 87 },
          { farm: 'Blue Fields', yield: 4.6, efficiency: 83, sustainability: 80, profitability: 79 }
        ],
        costAnalysis: [
          { month: 'Jan', seeds: 12000, fertilizer: 18000, labor: 25000, water: 8000, total: 63000 },
          { month: 'Feb', seeds: 8000, fertilizer: 15000, labor: 23000, water: 7000, total: 53000 },
          { month: 'Mar', seeds: 15000, fertilizer: 22000, labor: 28000, water: 9000, total: 74000 },
          { month: 'Apr', seeds: 10000, fertilizer: 20000, labor: 26000, water: 8500, total: 64500 },
          { month: 'May', seeds: 12000, fertilizer: 19000, labor: 27000, water: 8200, total: 66200 },
          { month: 'Jun', seeds: 14000, fertilizer: 21000, labor: 29000, water: 8800, total: 72800 }
        ]
      });
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', paddingTop: '80px' }}>
        <div className="spinner" style={{ width: '40px', height: '40px' }} />
        <div style={{ marginTop: '20px', color: 'var(--text-muted)' }}>Loading Analytics...</div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <div className="page-title"> Advanced Analytics</div>
          <div className="page-sub">Enterprise-level insights and performance metrics</div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <select 
            className="select" 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="1year">Last Year</option>
          </select>
          <button className="btn btn-blue" onClick={exportReport}>Export Report</button>
        </div>
      </div>

      {/* Metric Selector */}
      <div className="card mb-20">
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['yield', 'efficiency', 'cost', 'sustainability', 'profitability'].map(metric => (
            <button
              key={metric}
              className={`btn ${selectedMetric === metric ? 'btn-blue' : 'btn-gray'}`}
              onClick={() => setSelectedMetric(metric)}
              style={{ fontSize: '12px', padding: '6px 12px' }}
            >
              {metric.charAt(0).toUpperCase() + metric.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Yield Trends */}
      <div className="grid-2">
        <div className="card">
          <div className="section-title"> Crop Yield Trends (t/ha)</div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.yieldTrend}>
              <CartesianGrid stroke="#1E293B" strokeDasharray="4 4" />
              <XAxis dataKey="month" stroke="#64748B" />
              <YAxis stroke="#64748B" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="rice" stroke="#4ADE80" strokeWidth={2} />
              <Line type="monotone" dataKey="wheat" stroke="#F59E0B" strokeWidth={2} />
              <Line type="monotone" dataKey="cotton" stroke="#3B82F6" strokeWidth={2} />
              <Line type="monotone" dataKey="tomato" stroke="#EF4444" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="section-title"> Resource Efficiency</div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.resourceEfficiency}>
              <CartesianGrid stroke="#1E293B" strokeDasharray="4 4" />
              <XAxis dataKey="category" stroke="#64748B" />
              <YAxis stroke="#64748B" />
              <Tooltip />
              <Legend />
              <Bar dataKey="current" fill="#4ADE80" name="Current" />
              <Bar dataKey="target" fill="#3B82F6" name="Target" />
              <Bar dataKey="benchmark" fill="#F59E0B" name="Industry Avg" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Farm Performance Radar */}
      <div className="grid-2">
        <div className="card">
          <div className="section-title"> Farm Performance Comparison</div>
          <ResponsiveContainer width="100%" height={350}>
            <RadarChart data={data.farmPerformance}>
              <PolarGrid stroke="#1E293B" />
              <PolarAngleAxis dataKey="farm" stroke="#64748B" />
              <PolarRadiusAxis stroke="#64748B" />
              <Radar name="Yield" dataKey="yield" stroke="#4ADE80" fill="#4ADE80" fillOpacity={0.6} />
              <Radar name="Efficiency" dataKey="efficiency" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="section-title"> Cost Analysis</div>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={data.costAnalysis}>
              <CartesianGrid stroke="#1E293B" strokeDasharray="4 4" />
              <XAxis dataKey="month" stroke="#64748B" />
              <YAxis stroke="#64748B" />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="seeds" stackId="1" stroke="#4ADE80" fill="#4ADE80" />
              <Area type="monotone" dataKey="fertilizer" stackId="1" stroke="#F59E0B" fill="#F59E0B" />
              <Area type="monotone" dataKey="labor" stackId="1" stroke="#3B82F6" fill="#3B82F6" />
              <Area type="monotone" dataKey="water" stackId="1" stroke="#8B5CF6" fill="#8B5CF6" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Key Insights */}
      <div className="card">
        <div className="section-title"> Key Insights</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
          <div style={{ padding: '16px', background: 'rgba(74, 222, 128, 0.1)', borderRadius: '8px', border: '1px solid rgba(74, 222, 128, 0.3)' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#4ADE80', marginBottom: '8px' }}> Yield Improvement</div>
            <div style={{ fontSize: '12px', color: 'var(--text)', lineHeight: 1.5 }}>
              Overall yield increased by 12% compared to last quarter. Tomato crops showing strongest performance with 6.3 t/ha average.
            </div>
          </div>
          <div style={{ padding: '16px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#3B82F6', marginBottom: '8px' }}> Water Efficiency</div>
            <div style={{ fontSize: '12px', color: 'var(--text)', lineHeight: 1.5 }}>
              Water usage optimized by 15% through smart irrigation. Sunshine Acres leading with 92% efficiency.
            </div>
          </div>
          <div style={{ padding: '16px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#F59E0B', marginBottom: '8px' }}> Cost Optimization</div>
            <div style={{ fontSize: '12px', color: 'var(--text)', lineHeight: 1.5 }}>
              Monthly operational costs reduced by 8% through precision farming. Fertilizer costs down 12%.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
