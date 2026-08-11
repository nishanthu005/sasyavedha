import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import jsPDF from 'jspdf';

export default function ReportGeneration() {
  const { user } = useAuth();
  const [farms, setFarms] = useState([]);
  const [selectedFarm, setSelectedFarm] = useState('');
  const [reportType, setReportType] = useState('comprehensive');
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [reportData, setReportData] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [exportingFormat, setExportingFormat] = useState(null);
  const [generatedReports, setGeneratedReports] = useState([]);
  const [message, setMessage] = useState('');

  const reportsStorageKey = 'sasyavedha_reports';

  const formatDateTimeForFile = (dateValue = new Date()) => {
    const date = new Date(dateValue);
    const pad = (value) => String(value).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}_${pad(date.getHours())}-${pad(date.getMinutes())}-${pad(date.getSeconds())}`;
  };

  const cleanFilePart = (value) =>
    String(value || 'farm')
      .trim()
      .replace(/[<>:"/\\|?*]+/g, '')
      .replace(/\s+/g, '_')
      .replace(/_+/g, '_');

  const getReportBaseName = (report, dateValue = report?.generatedAt || new Date()) =>
    `${cleanFilePart(report?.farmName)}_${formatDateTimeForFile(dateValue)}`;

  const getReportFileName = (report, format, dateValue = new Date()) => {
    const extension = format === 'excel' ? 'xls' : 'pdf';
    return `${getReportBaseName(report, dateValue)}.${extension}`;
  };

  const getReportDisplayName = (report) =>
    report?.reportName || `${report?.farmName || 'Farm'}_${formatDateTimeForFile(report?.generatedAt || new Date())}`;

  const getReportTypeLabel = (type = 'report') =>
    `${type.charAt(0).toUpperCase()}${type.slice(1)}`;

  const saveReports = (reports) => {
    setGeneratedReports(reports);
    localStorage.setItem(reportsStorageKey, JSON.stringify(reports));
  };

  useEffect(() => {
    loadFarms();
    loadGeneratedReports();
  }, []);

  const loadFarms = async () => {
    try {
      // Simulate API call - replace with actual backend call
      const mockFarms = [
        { id: '1', name: 'Green Valley Farm', location: 'Pune, Maharashtra', size: 45 },
        { id: '2', name: 'Sunrise Acres', location: 'Nashik, Maharashtra', size: 32 },
        { id: '3', name: 'Golden Harvest', location: 'Satara, Maharashtra', size: 28 },
        { id: '4', name: 'Royal Fields', location: 'Kolhapur, Maharashtra', size: 51 }
      ];
      setFarms(mockFarms);
    } catch (error) {
      console.error('Error loading farms:', error);
      setMessage('Error loading farms');
    }
  };

  const loadGeneratedReports = async () => {
    try {
      const savedReports = localStorage.getItem(reportsStorageKey);
      if (savedReports) {
        const parsedReports = JSON.parse(savedReports);
        const normalizedReports = parsedReports.map(report => ({
          ...report,
          reportName: report.reportName || getReportBaseName(report),
          exportedFiles: report.exportedFiles || []
        }));
        setGeneratedReports(normalizedReports);
      }
    } catch (error) {
      console.error('Error loading reports:', error);
    }
  };

  const generateReport = async () => {
    if (!selectedFarm) {
      setMessage('Please select a farm');
      return;
    }

    setIsGenerating(true);
    setMessage('');

    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000));

      const farm = farms.find(f => f.id === selectedFarm);
      const generatedAt = new Date().toISOString();
      const report = {
        id: Date.now().toString(),
        farmId: selectedFarm,
        farmName: farm.name,
        reportName: getReportBaseName({ farmName: farm.name, generatedAt }),
        reportType,
        dateRange: { ...dateRange },
        generatedAt,
        generatedBy: user?.name || 'Unknown',
        data: generateReportData(reportType, farm, dateRange),
        exportedFiles: []
      };

      setReportData(report);
      
      // Save to generated reports
      const updatedReports = [report, ...generatedReports];
      saveReports(updatedReports);
      
      setMessage('Report generated successfully!');
    } catch (error) {
      console.error('Error generating report:', error);
      setMessage('Error generating report');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateReportData = (type, farm, dateRange) => {
    const baseData = {
      farm: {
        name: farm.name,
        location: farm.location,
        size: farm.size,
        totalArea: farm.size
      },
      period: {
        start: dateRange.start,
        end: dateRange.end,
        days: Math.ceil((new Date(dateRange.end) - new Date(dateRange.start)) / (1000 * 60 * 60 * 24))
      }
    };

    switch (type) {
      case 'comprehensive':
        return {
          ...baseData,
          summary: {
            totalYield: Math.floor(Math.random() * 500 + 100),
            averageYieldPerHa: Math.floor(Math.random() * 10 + 3),
            totalRevenue: Math.floor(Math.random() * 500000 + 100000),
            totalCosts: Math.floor(Math.random() * 200000 + 50000),
            profit: Math.floor(Math.random() * 300000 + 50000),
            efficiency: Math.floor(Math.random() * 30 + 70)
          },
          crops: [
            { name: 'Rice', area: 20, yield: 4.5, revenue: 180000 },
            { name: 'Wheat', area: 15, yield: 3.8, revenue: 114000 },
            { name: 'Maize', area: 10, yield: 5.2, revenue: 104000 }
          ],
          weather: {
            avgTemperature: 28.5,
            totalRainfall: 450,
            humidity: 65,
            sunnyDays: 25
          },
          recommendations: [
            'Increase wheat cultivation by 10% for better profitability',
            'Implement drip irrigation to reduce water usage by 30%',
            'Consider crop rotation to improve soil health'
          ]
        };
      
      case 'yield':
        return {
          ...baseData,
          yieldAnalysis: {
            totalYield: Math.floor(Math.random() * 500 + 100),
            yieldByCrop: [
              { crop: 'Rice', yield: 4.5, area: 20, percentage: 45 },
              { crop: 'Wheat', yield: 3.8, area: 15, percentage: 28 },
              { crop: 'Maize', yield: 5.2, area: 10, percentage: 27 }
            ],
            yieldTrend: [
              { month: 'Jan', yield: 3.8 },
              { month: 'Feb', yield: 4.2 },
              { month: 'Mar', yield: 4.5 },
              { month: 'Apr', yield: 4.8 },
              { month: 'May', yield: 5.1 }
            ],
            factors: {
              weather: 35,
              soil: 25,
              irrigation: 20,
              fertilizers: 20
            }
          }
        };
      
      case 'financial':
        return {
          ...baseData,
          financials: {
            totalRevenue: Math.floor(Math.random() * 500000 + 100000),
            totalCosts: Math.floor(Math.random() * 200000 + 50000),
            profit: Math.floor(Math.random() * 300000 + 50000),
            profitMargin: Math.floor(Math.random() * 30 + 20),
            costBreakdown: {
              seeds: 15,
              fertilizers: 20,
              irrigation: 10,
              labor: 25,
              equipment: 20,
              other: 10
            },
            revenueByCrop: [
              { crop: 'Rice', revenue: 180000, percentage: 45 },
              { crop: 'Wheat', revenue: 114000, percentage: 28 },
              { crop: 'Maize', revenue: 104000, percentage: 27 }
            ]
          }
        };
      
      case 'sustainability':
        return {
          ...baseData,
          sustainability: {
            waterUsage: Math.floor(Math.random() * 10000 + 5000),
            waterEfficiency: Math.floor(Math.random() * 30 + 70),
            carbonFootprint: Math.floor(Math.random() * 50 + 20),
            biodiversity: Math.floor(Math.random() * 30 + 70),
            soilHealth: Math.floor(Math.random() * 30 + 70),
            practices: [
              'Drip irrigation implemented',
              'Organic fertilizers used',
              'Crop rotation practiced',
              'Precision farming techniques applied'
            ],
            recommendations: [
              'Install rainwater harvesting systems',
              'Increase organic farming practices',
              'Implement solar-powered irrigation'
            ]
          }
        };
      
      default:
        return baseData;
    }
  };

  const downloadReport = async (format = 'pdf') => {
    if (!reportData || exportingFormat) return;

    const exportedAt = new Date();
    const fileName = getReportFileName(reportData, format, exportedAt);
    setExportingFormat(format);

    try {
      if (format === 'pdf') {
        await generatePDFReport(reportData, fileName);
      } else if (format === 'excel') {
        generateExcelReport(reportData, fileName);
      }
      registerDownloadedReport(reportData, format, fileName, exportedAt.toISOString());
    } finally {
      setExportingFormat(null);
    }
  };

  const registerDownloadedReport = (report, format, fileName, exportedAt) => {
    const fileEntry = { format, fileName, generatedAt: exportedAt };
    const updateReport = (item) => {
      if (item.id !== report.id) return item;
      return {
        ...item,
        reportName: item.reportName || getReportBaseName(item),
        exportedFiles: [fileEntry, ...(item.exportedFiles || [])]
      };
    };
    const reportExists = generatedReports.some(item => item.id === report.id);
    const updatedReports = reportExists
      ? generatedReports.map(updateReport)
      : [{ ...report, exportedFiles: [fileEntry] }, ...generatedReports];

    saveReports(updatedReports);
    setReportData(prev => prev && prev.id === report.id ? updateReport(prev) : prev);
  };

  const generatePDFReport = async (report, fileName) => {
    try {
      setMessage('Generating PDF report...');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const margin = 16;
      let y = 18;

      const addLine = (text, options = {}) => {
        const { size = 10, weight = 'normal', gap = 6, indent = 0 } = options;
        pdf.setFont('helvetica', weight);
        pdf.setFontSize(size);
        pdf.setTextColor(30, 30, 30);
        const wrapped = pdf.splitTextToSize(String(text), pdfWidth - margin * 2 - indent);
        if (y + wrapped.length * gap > pdfHeight - 16) {
          pdf.addPage();
          y = 18;
        }
        pdf.text(wrapped, margin + indent, y);
        y += wrapped.length * gap;
      };

      const addSection = (title) => {
        y += 3;
        addLine(title.toUpperCase(), { size: 11, weight: 'bold', gap: 7 });
        pdf.setDrawColor(170, 170, 170);
        pdf.line(margin, y - 4, pdfWidth - margin, y - 4);
      };

      addLine('SasyaVedha Farm Report', { size: 18, weight: 'bold', gap: 9 });
      addLine(getReportDisplayName(report), { size: 12, weight: 'bold' });
      addLine(`${report.farmName} | ${report.data.farm.location} | ${report.data.farm.size} hectares`);
      addLine(`${getReportTypeLabel(report.reportType)} report for ${report.data.period.start} to ${report.data.period.end}`);
      addLine(`Generated ${new Date(report.generatedAt).toLocaleString()} by ${report.generatedBy}`);

      if (report.reportType === 'comprehensive') {
        addSection('Summary');
        addLine(`Total yield: ${report.data.summary.totalYield} tons`);
        addLine(`Average yield/ha: ${report.data.summary.averageYieldPerHa} tons`);
        addLine(`Total revenue: Rs. ${report.data.summary.totalRevenue.toLocaleString()}`);
        addLine(`Total costs: Rs. ${report.data.summary.totalCosts.toLocaleString()}`);
        addLine(`Profit: Rs. ${report.data.summary.profit.toLocaleString()}`);
        addLine(`Efficiency: ${report.data.summary.efficiency}%`);
        addSection('Crop Performance');
        report.data.crops.forEach(crop => {
          addLine(`${crop.name}: ${crop.area} ha, ${crop.yield} t/ha, Rs. ${crop.revenue.toLocaleString()}`, { indent: 4 });
        });
        addSection('Recommendations');
        report.data.recommendations.forEach(rec => addLine(`- ${rec}`, { indent: 4 }));
      }

      if (report.reportType === 'yield') {
        addSection('Yield Analysis');
        addLine(`Total yield: ${report.data.yieldAnalysis.totalYield} tons`);
        addLine(`Crop types: ${report.data.yieldAnalysis.yieldByCrop.length}`);
        report.data.yieldAnalysis.yieldByCrop.forEach(crop => {
          addLine(`${crop.crop}: ${crop.area} ha, ${crop.yield} t/ha, ${crop.percentage}% share`, { indent: 4 });
        });
      }

      if (report.reportType === 'financial') {
        addSection('Financial Analysis');
        addLine(`Total revenue: Rs. ${report.data.financials.totalRevenue.toLocaleString()}`);
        addLine(`Total costs: Rs. ${report.data.financials.totalCosts.toLocaleString()}`);
        addLine(`Profit: Rs. ${report.data.financials.profit.toLocaleString()}`);
        addLine(`Profit margin: ${report.data.financials.profitMargin}%`);
        addSection('Revenue by Crop');
        report.data.financials.revenueByCrop.forEach(crop => {
          addLine(`${crop.crop}: Rs. ${crop.revenue.toLocaleString()} (${crop.percentage}%)`, { indent: 4 });
        });
      }

      if (report.reportType === 'sustainability') {
        addSection('Sustainability Analysis');
        addLine(`Water usage: ${report.data.sustainability.waterUsage.toLocaleString()} L`);
        addLine(`Water efficiency: ${report.data.sustainability.waterEfficiency}%`);
        addLine(`Carbon footprint: ${report.data.sustainability.carbonFootprint} kg CO2`);
        addLine(`Biodiversity: ${report.data.sustainability.biodiversity}%`);
        addLine(`Soil health: ${report.data.sustainability.soilHealth}%`);
        addSection('Practices');
        report.data.sustainability.practices.forEach(practice => addLine(`- ${practice}`, { indent: 4 }));
      }

      pdf.setFontSize(9);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Generated on ${new Date().toLocaleString()}`, margin, pdfHeight - 8);
      pdf.save(fileName);
      setMessage('PDF report downloaded successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      setMessage('Error generating PDF report');
      throw error;
    }
  };

  const generateExcelReport = (report, fileName) => {
    try {
      setMessage('Generating Excel report...');
      const excelContent = generateExcelContent(report);
      const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setMessage('Report exported to Excel successfully!');
    } catch (error) {
      console.error('Error generating Excel:', error);
      setMessage('Error generating Excel report');
      throw error;
    }
  };

  const escapeExcelCell = (value) =>
    String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

  const buildRows = (rows) =>
    rows.map(row => `
      <tr>
        ${row.map(cell => `<td>${escapeExcelCell(cell)}</td>`).join('')}
      </tr>
    `).join('');

  const generateExcelContent = (report) => {
    const rows = [
      ['SasyaVedha Farm Report'],
      ['Report Name', getReportDisplayName(report)],
      ['Farm', report.farmName],
      ['Location', report.data.farm.location],
      ['Size (hectares)', report.data.farm.size],
      ['Report Type', getReportTypeLabel(report.reportType)],
      ['Period Start', report.data.period.start],
      ['Period End', report.data.period.end],
      ['Generated At', new Date(report.generatedAt).toLocaleString()],
      ['Generated By', report.generatedBy],
      []
    ];

    if (report.reportType === 'comprehensive') {
      rows.push(
        ['Summary'],
        ['Total Yield (tons)', report.data.summary.totalYield],
        ['Average Yield/Ha', report.data.summary.averageYieldPerHa],
        ['Total Revenue', report.data.summary.totalRevenue],
        ['Total Costs', report.data.summary.totalCosts],
        ['Profit', report.data.summary.profit],
        ['Efficiency (%)', report.data.summary.efficiency],
        [],
        ['Crop Data'],
        ['Crop', 'Area (ha)', 'Yield (t/ha)', 'Revenue']
      );
      report.data.crops.forEach(crop => {
        rows.push([crop.name, crop.area, crop.yield, crop.revenue]);
      });
      rows.push([], ['Recommendations']);
      report.data.recommendations.forEach(rec => rows.push([rec]));
    }

    if (report.reportType === 'yield') {
      rows.push(
        ['Yield Analysis'],
        ['Total Yield (tons)', report.data.yieldAnalysis.totalYield],
        [],
        ['Crop', 'Area (ha)', 'Yield (t/ha)', 'Share (%)']
      );
      report.data.yieldAnalysis.yieldByCrop.forEach(crop => {
        rows.push([crop.crop, crop.area, crop.yield, crop.percentage]);
      });
      rows.push(
        [],
        ['Yield Factors'],
        ['Weather (%)', report.data.yieldAnalysis.factors.weather],
        ['Soil (%)', report.data.yieldAnalysis.factors.soil],
        ['Irrigation (%)', report.data.yieldAnalysis.factors.irrigation],
        ['Fertilizers (%)', report.data.yieldAnalysis.factors.fertilizers]
      );
    }

    if (report.reportType === 'financial') {
      rows.push(
        ['Financial Analysis'],
        ['Total Revenue', report.data.financials.totalRevenue],
        ['Total Costs', report.data.financials.totalCosts],
        ['Profit', report.data.financials.profit],
        ['Profit Margin (%)', report.data.financials.profitMargin],
        [],
        ['Cost Breakdown'],
        ['Category', 'Percentage']
      );
      Object.entries(report.data.financials.costBreakdown).forEach(([category, percentage]) => {
        rows.push([category, percentage]);
      });
      rows.push([], ['Revenue by Crop'], ['Crop', 'Revenue', 'Share (%)']);
      report.data.financials.revenueByCrop.forEach(crop => {
        rows.push([crop.crop, crop.revenue, crop.percentage]);
      });
    }

    if (report.reportType === 'sustainability') {
      rows.push(
        ['Sustainability Analysis'],
        ['Water Usage (L)', report.data.sustainability.waterUsage],
        ['Water Efficiency (%)', report.data.sustainability.waterEfficiency],
        ['Carbon Footprint (kg CO2)', report.data.sustainability.carbonFootprint],
        ['Biodiversity (%)', report.data.sustainability.biodiversity],
        ['Soil Health (%)', report.data.sustainability.soilHealth],
        [],
        ['Practices']
      );
      report.data.sustainability.practices.forEach(practice => rows.push([practice]));
      rows.push([], ['Recommendations']);
      report.data.sustainability.recommendations.forEach(rec => rows.push([rec]));
    }

    return `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
        <head>
          <meta charset="UTF-8" />
          <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Report</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
        </head>
        <body>
          <table border="1">
            ${buildRows(rows)}
          </table>
        </body>
      </html>
    `;
  };

  const deleteReport = (reportId) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      const updatedReports = generatedReports.filter(r => r.id !== reportId);
      saveReports(updatedReports);
      if (reportData && reportData.id === reportId) {
        setReportData(null);
      }
      setMessage('Report deleted successfully');
    }
  };

  const loadReport = (report) => {
    setReportData(report);
    setSelectedFarm(report.farmId);
    setReportType(report.reportType);
    setDateRange(report.dateRange);
  };

  return (
    <div className="report-page">
      <div className="page-header">
        <div>
          <div className="page-title"> Report Generation</div>
          <div className="page-sub">Generate comprehensive farm analytics reports</div>
        </div>
      </div>

      {message && (
        <div className="card mb-20" style={{
          background: 'var(--surface2)',
          color: 'var(--text)',
          border: '1px solid var(--border)'
        }}>
          {message}
        </div>
      )}

      <div className="card mb-20">
        <div className="section-title"> Report Configuration</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label>Select Farm</label>
            <select
              value={selectedFarm}
              onChange={(e) => setSelectedFarm(e.target.value)}
              className="select"
            >
              <option value="">Choose a farm...</option>
              {farms.map(farm => (
                <option key={farm.id} value={farm.id}>
                  {farm.name} ({farm.size} ha)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="select"
            >
              <option value="comprehensive"> Comprehensive Report</option>
              <option value="yield"> Yield Analysis</option>
              <option value="financial"> Financial Report</option>
              <option value="sustainability"> Sustainability Report</option>
            </select>
          </div>
          <div>
            <label>Date Range</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                style={{ flex: 1 }}
              />
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                style={{ flex: 1 }}
              />
            </div>
          </div>
        </div>
        <button
          onClick={generateReport}
          disabled={isGenerating || Boolean(exportingFormat) || !selectedFarm}
          className="btn btn-blue"
        >
          {isGenerating ? ' Generating Report...' : ' Generate Report'}
        </button>
      </div>

      {reportData && (
        <div className="card mb-20">
          <div className="section-title"> Generated Report</div>
          
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: '0 0 8px 0' }}>{reportData.farmName}</h3>
                <p style={{ margin: '0', color: 'var(--text-muted)' }}>
                  {getReportTypeLabel(reportData.reportType)} Report • {getReportDisplayName(reportData)}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => downloadReport('pdf')}
                  disabled={Boolean(exportingFormat)}
                  className="btn btn-secondary"
                  style={{ fontSize: '12px', padding: '6px 12px' }}
                >
                  {exportingFormat === 'pdf' ? ' Creating PDF...' : ' Download PDF'}
                </button>
                <button
                  onClick={() => downloadReport('excel')}
                  disabled={Boolean(exportingFormat)}
                  className="btn btn-secondary"
                  style={{ fontSize: '12px', padding: '6px 12px' }}
                >
                  {exportingFormat === 'excel' ? ' Creating Excel...' : ' Export Excel'}
                </button>
              </div>
            </div>

            {reportData.reportType === 'comprehensive' && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' }}>
                  <div className="card">
                    <div className="stat-value">{reportData.data.summary.totalYield}</div>
                    <div className="stat-label">Total Yield (tons)</div>
                  </div>
                  <div className="card">
                    <div className="stat-value">?{reportData.data.summary.totalRevenue.toLocaleString()}</div>
                    <div className="stat-label">Total Revenue</div>
                  </div>
                  <div className="card">
                    <div className="stat-value">?{reportData.data.summary.profit.toLocaleString()}</div>
                    <div className="stat-label">Profit</div>
                  </div>
                  <div className="card">
                    <div className="stat-value">{reportData.data.summary.efficiency}%</div>
                    <div className="stat-label">Efficiency</div>
                  </div>
                </div>

                <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: 'var(--text)' }}> Crop Performance</div>
                <div style={{ display: 'grid', gap: '12px' }}>
                  {reportData.data.crops.map((crop, index) => (
                    <div key={index} className="card" style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong>{crop.name}</strong>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            {crop.area} ha • {crop.yield} t/ha
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: '600' }}>?{crop.revenue.toLocaleString()}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            {Math.round((crop.revenue / reportData.data.summary.totalRevenue) * 100)}% of total
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', marginTop: '20px', color: 'var(--text)' }}> Recommendations</div>
                <div style={{ background: 'var(--surface)', padding: '16px', borderRadius: 0, border: '1px solid var(--border)' }}>
                  <ul style={{ margin: '0', paddingLeft: '20px' }}>
                    {reportData.data.recommendations.map((rec, index) => (
                      <li key={index} style={{ marginBottom: '8px' }}>{rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {reportData.reportType === 'yield' && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
                  <div className="card">
                    <div className="stat-value">{reportData.data.yieldAnalysis.totalYield}</div>
                    <div className="stat-label">Total Yield (tons)</div>
                  </div>
                  <div className="card">
                    <div className="stat-value">{reportData.data.yieldAnalysis.yieldByCrop.length}</div>
                    <div className="stat-label">Crop Types</div>
                  </div>
                  <div className="card">
                    <div className="stat-value">{reportData.data.yieldAnalysis.factors.weather}%</div>
                    <div className="stat-label">Weather Impact</div>
                  </div>
                </div>

                <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: 'var(--text)' }}> Yield by Crop</div>
                <div style={{ display: 'grid', gap: '12px' }}>
                  {reportData.data.yieldAnalysis.yieldByCrop.map((crop, index) => (
                    <div key={index} className="card" style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong>{crop.crop}</strong>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            {crop.area} ha • {crop.yield} t/ha
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: '600' }}>{crop.percentage}%</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            of total yield
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', marginTop: '20px', color: 'var(--text)' }}> Yield Factors</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                  <div className="card" style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Weather</span>
                      <strong>{reportData.data.yieldAnalysis.factors.weather}%</strong>
                    </div>
                  </div>
                  <div className="card" style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Soil</span>
                      <strong>{reportData.data.yieldAnalysis.factors.soil}%</strong>
                    </div>
                  </div>
                  <div className="card" style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Irrigation</span>
                      <strong>{reportData.data.yieldAnalysis.factors.irrigation}%</strong>
                    </div>
                  </div>
                  <div className="card" style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Fertilizers</span>
                      <strong>{reportData.data.yieldAnalysis.factors.fertilizers}%</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {reportData.reportType === 'financial' && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
                  <div className="card">
                    <div className="stat-value">?{reportData.data.financials.totalRevenue.toLocaleString()}</div>
                    <div className="stat-label">Total Revenue</div>
                  </div>
                  <div className="card">
                    <div className="stat-value">?{reportData.data.financials.profit.toLocaleString()}</div>
                    <div className="stat-label">Profit</div>
                  </div>
                  <div className="card">
                    <div className="stat-value">{reportData.data.financials.profitMargin}%</div>
                    <div className="stat-label">Profit Margin</div>
                  </div>
                </div>

                <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: 'var(--text)' }}> Cost Breakdown</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                  {Object.entries(reportData.data.financials.costBreakdown).map(([category, percentage]) => (
                    <div key={category} className="card" style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ textTransform: 'capitalize' }}>{category}</span>
                        <strong>{percentage}%</strong>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', marginTop: '20px', color: 'var(--text)' }}> Revenue by Crop</div>
                <div style={{ display: 'grid', gap: '12px' }}>
                  {reportData.data.financials.revenueByCrop.map((crop, index) => (
                    <div key={index} className="card" style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong>{crop.crop}</strong>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: '600' }}>?{crop.revenue.toLocaleString()}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            {crop.percentage}% of total
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {reportData.reportType === 'sustainability' && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
                  <div className="card">
                    <div className="stat-value">{reportData.data.sustainability.waterEfficiency}%</div>
                    <div className="stat-label">Water Efficiency</div>
                  </div>
                  <div className="card">
                    <div className="stat-value">{reportData.data.sustainability.soilHealth}%</div>
                    <div className="stat-label">Soil Health</div>
                  </div>
                  <div className="card">
                    <div className="stat-value">{reportData.data.sustainability.biodiversity}%</div>
                    <div className="stat-label">Biodiversity</div>
                  </div>
                </div>

                <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: 'var(--text)' }}> Sustainability Metrics</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                  <div className="card" style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Water Usage</span>
                      <strong>{reportData.data.sustainability.waterUsage.toLocaleString()} L</strong>
                    </div>
                  </div>
                  <div className="card" style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Carbon Footprint</span>
                      <strong>{reportData.data.sustainability.carbonFootprint} kg CO2</strong>
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', marginTop: '20px', color: 'var(--text)' }}> Sustainable Practices</div>
                <div style={{ background: 'var(--surface)', padding: '16px', borderRadius: 0, border: '1px solid var(--border)' }}>
                  <ul style={{ margin: '0', paddingLeft: '20px' }}>
                    {reportData.data.sustainability.practices.map((practice, index) => (
                      <li key={index} style={{ marginBottom: '8px' }}>{practice}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="card">
        <div className="section-title"> Previous Reports</div>
        
        {generatedReports.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}></div>
            <div>No reports generated yet</div>
            <div style={{ fontSize: '14px', marginTop: '8px' }}>Generate your first report to see it here</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '12px' }}>
            {generatedReports.map((report) => (
              <div key={report.id} className="card" style={{ padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                      {getReportDisplayName(report)}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {getReportTypeLabel(report.reportType)} Report • Generated: {new Date(report.generatedAt).toLocaleString()} by {report.generatedBy}
                    </div>
                    {report.exportedFiles?.length > 0 && (
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
                        Files: {report.exportedFiles.slice(0, 3).map(file => file.fileName).join(', ')}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => loadReport(report)}
                      className="btn btn-secondary"
                      style={{ fontSize: '12px', padding: '6px 12px' }}
                    >
                       View
                    </button>
                    <button
                      onClick={() => deleteReport(report.id)}
                      className="btn btn-danger"
                      style={{ fontSize: '12px', padding: '6px 12px' }}
                    >
                       Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}



