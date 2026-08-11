import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function EnterpriseOverview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock enterprise data
    setTimeout(() => {
      setData({
        totalFarms: 12,
        totalFields: 48,
        totalArea: 320,
        activeUsers: 8,
        monthlyRevenue: 2400000,
        cropDistribution: [
          { name: 'Rice', value: 35, color: '#4ADE80' },
          { name: 'Wheat', value: 25, color: '#F59E0B' },
          { name: 'Cotton', value: 20, color: '#3B82F6' },
          { name: 'Tomato', value: 15, color: '#EF4444' },
          { name: 'Other', value: 5, color: '#8B5CF6' }
        ],
        performance: [
          { month: 'Jan', yield: 4.2, efficiency: 78 },
          { month: 'Feb', yield: 4.5, efficiency: 82 },
          { month: 'Mar', yield: 4.8, efficiency: 85 },
          { month: 'Apr', yield: 5.1, efficiency: 88 },
          { month: 'May', yield: 4.9, efficiency: 86 },
          { month: 'Jun', yield: 5.3, efficiency: 91 }
        ]
      });
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', paddingTop: '80px' }}>
        <div className="spinner" style={{ width: '40px', height: '40px' }} />
        <div style={{ marginTop: '20px', color: 'var(--text-muted)' }}>Loading Enterprise Overview...</div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <div className="page-title"> Enterprise Overview</div>
          <div className="page-sub">Multi-farm management dashboard</div>
        </div>
        <span className="tag tag-blue">Enterprise</span>
      </div>

      {/* KPI Cards */}
      <div className="grid-4">
        <div className="card">
          <div style={{ fontSize: '24px', marginBottom: '8px' }}></div>
          <div className="stat-value" style={{ color: '#4ADE80' }}>{data.totalFarms}</div>
          <div className="stat-label">Total Farms</div>
        </div>
        <div className="card">
          <div style={{ fontSize: '24px', marginBottom: '8px' }}></div>
          <div className="stat-value" style={{ color: '#3B82F6' }}>{data.totalFields}</div>
          <div className="stat-label">Total Fields</div>
        </div>
        <div className="card">
          <div style={{ fontSize: '24px', marginBottom: '8px' }}></div>
          <div className="stat-value" style={{ color: '#F59E0B' }}>{data.totalArea}</div>
          <div className="stat-label">Total Area (ha)</div>
        </div>
        <div className="card">
          <div style={{ fontSize: '24px', marginBottom: '8px' }}></div>
          <div className="stat-value" style={{ color: '#8B5CF6' }}>{data.activeUsers}</div>
          <div className="stat-label">Active Users</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid-2">
        <div className="card">
          <div className="section-title"> Crop Distribution</div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.cropDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name} ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.cropDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="section-title"> Performance Trends</div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.performance}>
              <CartesianGrid stroke="#1E293B" strokeDasharray="4 4" />
              <XAxis dataKey="month" stroke="#64748B" />
              <YAxis stroke="#64748B" />
              <Tooltip />
              <Line type="monotone" dataKey="yield" stroke="#4ADE80" strokeWidth={2} name="Yield (t/ha)" />
              <Line type="monotone" dataKey="efficiency" stroke="#3B82F6" strokeWidth={2} name="Efficiency (%)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
