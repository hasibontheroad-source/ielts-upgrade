import React, { useState } from 'react';
import {
  TrendingUp,
  BarChart3,
  PieChart,
  GitBranch,
  MapPin,
  Table,
  Eye,
  Layers,
  Sparkles,
  Maximize2,
  Info
} from 'lucide-react';
import { WritingChartData } from '../data/cambridgeTests';

interface WritingChartVisualizerProps {
  chartData: WritingChartData;
  onSendToEvaluator?: () => void;
}

export default function WritingChartVisualizer({
  chartData,
  onSendToEvaluator,
}: WritingChartVisualizerProps) {
  const [viewMode, setViewMode] = useState<'vector' | 'diagram' | 'table'>('vector');
  const [hoveredPoint, setHoveredPoint] = useState<string | null>(null);

  // Line Chart Renderer
  const renderLineChart = () => {
    const categories = chartData.categories || ['2010', '2014', '2018', '2022', '2026'];
    const series = chartData.series || [
      { name: 'Renewables', color: '#0284c7', data: [15, 24, 38, 52, 68] },
      { name: 'Fossil Fuels', color: '#dc2626', data: [75, 68, 55, 42, 28] },
    ];

    const width = 640;
    const height = 300;
    const paddingLeft = 50;
    const paddingRight = 30;
    const paddingTop = 30;
    const paddingBottom = 40;

    const plotWidth = width - paddingLeft - paddingRight;
    const plotHeight = height - paddingTop - paddingBottom;

    // Determine max value
    const allValues = series.flatMap((s) => s.data);
    const maxVal = Math.ceil(Math.max(...allValues, 100) / 20) * 20;

    const getX = (index: number) => paddingLeft + (index / (categories.length - 1)) * plotWidth;
    const getY = (val: number) => height - paddingBottom - (val / maxVal) * plotHeight;

    return (
      <div className="relative w-full overflow-x-auto bg-slate-950 p-4 rounded-2xl border border-slate-800">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto min-w-[500px]">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const val = Math.round(maxVal * ratio);
            const y = getY(val);
            return (
              <g key={ratio}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="#334155"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={paddingLeft - 10}
                  y={y + 4}
                  fill="#94a3b8"
                  fontSize="10"
                  textAnchor="end"
                  className="font-mono"
                >
                  {val}{chartData.unit ? ` ${chartData.unit}` : ''}
                </text>
              </g>
            );
          })}

          {/* X Axis Categories */}
          {categories.map((cat, i) => {
            const x = getX(i);
            return (
              <g key={cat}>
                <line
                  x1={x}
                  y1={height - paddingBottom}
                  x2={x}
                  y2={height - paddingBottom + 6}
                  stroke="#64748b"
                  strokeWidth="1.5"
                />
                <text
                  x={x}
                  y={height - paddingBottom + 20}
                  fill="#cbd5e1"
                  fontSize="11"
                  textAnchor="middle"
                  className="font-mono font-medium"
                >
                  {cat}
                </text>
              </g>
            );
          })}

          {/* Series Lines & Area */}
          {series.map((s) => {
            const points = s.data.map((val, idx) => `${getX(idx)},${getY(val)}`).join(' ');
            return (
              <g key={s.name}>
                <polyline
                  fill="none"
                  stroke={s.color}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={points}
                />
                {s.data.map((val, idx) => {
                  const x = getX(idx);
                  const y = getY(val);
                  const pointKey = `${s.name}-${categories[idx]}`;
                  const isHovered = hoveredPoint === pointKey;
                  return (
                    <g
                      key={idx}
                      onMouseEnter={() => setHoveredPoint(pointKey)}
                      onMouseLeave={() => setHoveredPoint(null)}
                      className="cursor-pointer"
                    >
                      <circle
                        cx={x}
                        cy={y}
                        r={isHovered ? 7 : 5}
                        fill={s.color}
                        stroke="#0f172a"
                        strokeWidth="2.5"
                        className="transition-all"
                      />
                      {isHovered && (
                        <g>
                          <rect
                            x={x - 35}
                            y={y - 32}
                            width="70"
                            height="22"
                            rx="6"
                            fill="#0f172a"
                            stroke={s.color}
                            strokeWidth="1.5"
                          />
                          <text
                            x={x}
                            y={y - 17}
                            fill="#ffffff"
                            fontSize="11"
                            fontWeight="bold"
                            textAnchor="middle"
                            className="font-mono"
                          >
                            {val} {chartData.unit || ''}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}
              </g>
            );
          })}
        </svg>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-3 pt-3 border-t border-slate-800/80">
          {series.map((s) => (
            <div key={s.name} className="flex items-center gap-2 text-xs">
              <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: s.color }} />
              <span className="text-slate-300 font-semibold">{s.name}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Bar Chart Renderer
  const renderBarChart = () => {
    const categories = chartData.categories || ['UK', 'USA', 'Australia', 'Canada', 'NZ'];
    const series = chartData.series || [
      { name: 'Undergraduates', color: '#2563eb', data: [45, 62, 38, 55, 30] },
      { name: 'Postgraduates', color: '#10b981', data: [25, 40, 22, 34, 18] },
    ];

    const width = 640;
    const height = 300;
    const paddingLeft = 50;
    const paddingRight = 30;
    const paddingTop = 30;
    const paddingBottom = 40;

    const plotWidth = width - paddingLeft - paddingRight;
    const plotHeight = height - paddingTop - paddingBottom;

    const allValues = series.flatMap((s) => s.data);
    const maxVal = Math.ceil(Math.max(...allValues, 80) / 20) * 20;

    const groupWidth = plotWidth / categories.length;
    const barWidth = Math.min(24, (groupWidth * 0.7) / series.length);

    return (
      <div className="relative w-full overflow-x-auto bg-slate-950 p-4 rounded-2xl border border-slate-800">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto min-w-[500px]">
          {/* Horizontal Grid */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const val = Math.round(maxVal * ratio);
            const y = height - paddingBottom - (val / maxVal) * plotHeight;
            return (
              <g key={ratio}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="#334155"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={paddingLeft - 10}
                  y={y + 4}
                  fill="#94a3b8"
                  fontSize="10"
                  textAnchor="end"
                  className="font-mono"
                >
                  {val}{chartData.unit ? ` ${chartData.unit}` : ''}
                </text>
              </g>
            );
          })}

          {/* Grouped Bars */}
          {categories.map((cat, catIdx) => {
            const groupX = paddingLeft + catIdx * groupWidth + groupWidth / 2;
            const totalSeriesWidth = series.length * barWidth + (series.length - 1) * 4;
            const startX = groupX - totalSeriesWidth / 2;

            return (
              <g key={cat}>
                {series.map((s, sIdx) => {
                  const val = s.data[catIdx];
                  const barH = (val / maxVal) * plotHeight;
                  const bx = startX + sIdx * (barWidth + 4);
                  const by = height - paddingBottom - barH;
                  const barKey = `${s.name}-${cat}`;
                  const isHovered = hoveredPoint === barKey;

                  return (
                    <g
                      key={s.name}
                      onMouseEnter={() => setHoveredPoint(barKey)}
                      onMouseLeave={() => setHoveredPoint(null)}
                      className="cursor-pointer"
                    >
                      <rect
                        x={bx}
                        y={by}
                        width={barWidth}
                        height={barH}
                        rx="4"
                        fill={s.color}
                        opacity={isHovered ? 1 : 0.9}
                      />
                      {isHovered && (
                        <text
                          x={bx + barWidth / 2}
                          y={by - 6}
                          fill="#ffffff"
                          fontSize="10"
                          fontWeight="bold"
                          textAnchor="middle"
                          className="font-mono"
                        >
                          {val}
                        </text>
                      )}
                    </g>
                  );
                })}
                <text
                  x={groupX}
                  y={height - paddingBottom + 20}
                  fill="#cbd5e1"
                  fontSize="11"
                  textAnchor="middle"
                  className="font-mono font-medium"
                >
                  {cat}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-3 pt-3 border-t border-slate-800/80">
          {series.map((s) => (
            <div key={s.name} className="flex items-center gap-2 text-xs">
              <span className="w-3.5 h-3.5 rounded" style={{ backgroundColor: s.color }} />
              <span className="text-slate-300 font-semibold">{s.name}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Pie / Donut Chart Renderer
  const renderPieChart = () => {
    const segments = chartData.pieSegments || [
      { label: 'Housing', value: 35, color: '#3b82f6' },
      { label: 'Food & Groceries', value: 25, color: '#10b981' },
      { label: 'Transport', value: 15, color: '#f59e0b' },
      { label: 'Leisure', value: 15, color: '#8b5cf6' },
      { label: 'Savings', value: 10, color: '#ec4899' },
    ];

    const size = 320;
    const center = size / 2;
    const radius = 110;
    const innerRadius = 55;

    const total = segments.reduce((sum, s) => sum + s.value, 0);

    let cumulativeAngle = 0;

    const slicePaths = segments.map((seg) => {
      const angle = (seg.value / total) * 360;
      const startAngle = cumulativeAngle;
      const endAngle = cumulativeAngle + angle;
      cumulativeAngle = endAngle;

      const startRad = (startAngle - 90) * (Math.PI / 180);
      const endRad = (endAngle - 90) * (Math.PI / 180);

      const x1 = center + radius * Math.cos(startRad);
      const y1 = center + radius * Math.sin(startRad);
      const x2 = center + radius * Math.cos(endRad);
      const y2 = center + radius * Math.sin(endRad);

      const ix1 = center + innerRadius * Math.cos(endRad);
      const iy1 = center + innerRadius * Math.sin(endRad);
      const ix2 = center + innerRadius * Math.cos(startRad);
      const iy2 = center + innerRadius * Math.sin(startRad);

      const largeArc = angle > 180 ? 1 : 0;

      const pathData = `
        M ${x1} ${y1}
        A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}
        L ${ix1} ${iy1}
        A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${ix2} ${iy2}
        Z
      `;

      return { ...seg, pathData, angle, percentage: Math.round((seg.value / total) * 100) };
    });

    return (
      <div className="flex flex-col md:flex-row items-center justify-around gap-6 bg-slate-950 p-6 rounded-2xl border border-slate-800">
        <div className="relative">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {slicePaths.map((slice) => {
              const isHovered = hoveredPoint === slice.label;
              return (
                <path
                  key={slice.label}
                  d={slice.pathData}
                  fill={slice.color}
                  stroke="#0f172a"
                  strokeWidth="2"
                  opacity={isHovered ? 1 : 0.9}
                  className="transition-all cursor-pointer hover:opacity-100"
                  onMouseEnter={() => setHoveredPoint(slice.label)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xs text-slate-400 font-mono">Total</span>
            <span className="text-xl font-bold text-white font-mono">100%</span>
          </div>
        </div>

        <div className="space-y-2.5 w-full md:w-64">
          <h5 className="text-xs font-bold text-slate-400 tracking-wider">Breakdown</h5>
          {slicePaths.map((slice) => (
            <div
              key={slice.label}
              onMouseEnter={() => setHoveredPoint(slice.label)}
              onMouseLeave={() => setHoveredPoint(null)}
              className={`flex items-center justify-between p-2 rounded-xl transition-colors cursor-pointer ${
                hoveredPoint === slice.label ? 'bg-slate-800/90' : 'bg-slate-900/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: slice.color }} />
                <span className="text-xs font-semibold text-slate-200">{slice.label}</span>
              </div>
              <span className="text-xs font-mono font-bold text-slate-300">{slice.percentage}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Process / Flowchart Diagram Renderer
  const renderProcessDiagram = () => {
    const steps = chartData.processSteps || [
      { stepNumber: 1, title: 'Harvesting', description: 'Ripe coffee cherries are hand-picked.' },
      { stepNumber: 2, title: 'Pulping & Fermenting', description: 'Fruit flesh is removed in water tanks.' },
      { stepNumber: 3, title: 'Sun Drying', description: 'Beans dried on raised patio beds.' },
      { stepNumber: 4, title: 'Hulling & Sorting', description: 'Parchment skin removed by machine.' },
      { stepNumber: 5, title: 'Roasting & Packaging', description: 'Heated to 200°C and vacuum sealed.' },
    ];

    return (
      <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {steps.map((st, idx) => (
            <div
              key={st.stepNumber}
              className="relative p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col items-center text-center space-y-2"
            >
              <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center text-xs font-black font-mono">
                {st.stepNumber}
              </div>
              <h5 className="text-xs font-bold text-white">{st.title}</h5>
              <p className="text-[11px] text-slate-400 leading-snug">{st.description}</p>
              {idx < steps.length - 1 && (
                <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-slate-600 font-bold text-sm">
                  →
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-400 flex-shrink-0" />
          <span>IELTS Task 1 Process Rule: Use passive voice and sequential linkers (Initially, Subsequently, Prior to).</span>
        </div>
      </div>
    );
  };

  // Comparative Map Diagram Renderer
  const renderMapDiagram = () => {
    const features = chartData.mapFeatures || [
      { area: 'North Coast', past: 'Industrial docklands & warehouses', present: 'Luxury marina & waterfront promenade' },
      { area: 'Center', past: 'Farmland & derelict rail junction', present: 'Technology research park & shopping mall' },
      { area: 'South Coast', past: 'Small fishing village & beach huts', present: 'Pedestrianized resort hotels & sports club' },
    ];

    return (
      <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Past Era */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-amber-400 font-mono">Year: 2000 (Past Layout)</span>
              <span className="text-[11px] text-slate-400">Baseline Plan</span>
            </div>
            <div className="space-y-2">
              {features.map((f, i) => (
                <div key={i} className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
                  <span className="font-bold text-slate-200 block">{f.area}</span>
                  <span className="text-slate-400 text-[11px]">{f.past}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Present / Proposed Era */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-blue-900/40 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-blue-400 font-mono">Year: 2026 (Modern Redevelopment)</span>
              <span className="text-[11px] text-emerald-400 font-semibold">Transformations</span>
            </div>
            <div className="space-y-2">
              {features.map((f, i) => (
                <div key={i} className="p-2.5 rounded-xl bg-blue-950/20 border border-blue-800/40 text-xs">
                  <span className="font-bold text-blue-200 block">{f.area}</span>
                  <span className="text-slate-300 text-[11px]">{f.present}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
          <Info className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>IELTS Map Comparison: Focus on spatial prepositions (to the north of, replaced by, erected, converted).</span>
        </div>
      </div>
    );
  };

  // Tabular Data View Renderer
  const renderTableView = () => {
    if (chartData.type === 'pie') {
      const segments = chartData.pieSegments || [];
      return (
        <div className="overflow-x-auto bg-slate-950 p-4 rounded-2xl border border-slate-800">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-900 text-slate-400 font-mono border-b border-slate-800">
              <tr>
                <th className="p-3">Category</th>
                <th className="p-3 text-right">Percentage / Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {segments.map((s, idx) => (
                <tr key={idx} className="hover:bg-slate-900/50">
                  <td className="p-3 font-semibold text-slate-200">{s.label}</td>
                  <td className="p-3 text-right font-mono text-blue-400 font-bold">{s.value}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    if (chartData.type === 'process') {
      const steps = chartData.processSteps || [];
      return (
        <div className="overflow-x-auto bg-slate-950 p-4 rounded-2xl border border-slate-800">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-900 text-slate-400 font-mono border-b border-slate-800">
              <tr>
                <th className="p-3 w-16">Step</th>
                <th className="p-3">Phase Title</th>
                <th className="p-3">Technical Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {steps.map((st) => (
                <tr key={st.stepNumber} className="hover:bg-slate-900/50">
                  <td className="p-3 font-mono font-bold text-blue-400">#{st.stepNumber}</td>
                  <td className="p-3 font-semibold text-slate-200">{st.title}</td>
                  <td className="p-3 text-slate-300">{st.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    const categories = chartData.categories || [];
    const series = chartData.series || [];

    return (
      <div className="overflow-x-auto bg-slate-950 p-4 rounded-2xl border border-slate-800">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-900 text-slate-400 font-mono border-b border-slate-800">
            <tr>
              <th className="p-3">Variable / Category</th>
              {categories.map((c) => (
                <th key={c} className="p-3 text-right">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-850">
            {series.map((s, idx) => (
              <tr key={idx} className="hover:bg-slate-900/50">
                <td className="p-3 font-semibold text-slate-200 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                  {s.name}
                </td>
                {s.data.map((val, dIdx) => (
                  <td key={dIdx} className="p-3 text-right font-mono text-slate-300">
                    {val} {chartData.unit || ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Realistic Diagram View (Authentic Cambridge Exam Paper Style)
  const renderDiagramView = () => {
    return (
      <div className="relative p-6 rounded-2xl bg-[#f8fafc] text-slate-900 border border-slate-300 shadow-inner font-serif">
        <div className="text-center pb-4 mb-4 border-b border-slate-200">
          <span className="text-[11px] uppercase tracking-wider text-slate-500 font-sans font-bold block">
            IELTS Academic Writing Task 1 Graphic Reference
          </span>
          <h4 className="text-base font-bold text-slate-900 mt-1 font-serif">
            {chartData.title}
          </h4>
          {chartData.subtitle && (
            <p className="text-xs text-slate-600 mt-0.5 font-sans">{chartData.subtitle}</p>
          )}
        </div>

        {/* Embedded Vector inside Exam Paper Surface */}
        <div className="filter contrast-125 saturate-75">
          {chartData.type === 'line' && renderLineChart()}
          {chartData.type === 'bar' && renderBarChart()}
          {chartData.type === 'pie' && renderPieChart()}
          {chartData.type === 'process' && renderProcessDiagram()}
          {chartData.type === 'map' && renderMapDiagram()}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 font-sans">
          <span>Source: Cambridge IELTS Academic Examination Papers</span>
          <span>Authentic Question Graphics</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Top Header & Visual Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950 border border-blue-800 text-blue-300 uppercase tracking-wider">
              Task 1 Visual
            </span>
            <span className="text-xs text-slate-400 capitalize">{chartData.type} Chart</span>
          </div>
          <h4 className="text-sm font-bold text-white mt-1">{chartData.title}</h4>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setViewMode('vector')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              viewMode === 'vector'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Interactive Vector</span>
          </button>

          <button
            onClick={() => setViewMode('diagram')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              viewMode === 'diagram'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Exam Paper View</span>
          </button>

          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              viewMode === 'table'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>Data Table</span>
          </button>
        </div>
      </div>

      {/* Main Visual Display */}
      <div>
        {viewMode === 'vector' && (
          <>
            {chartData.type === 'line' && renderLineChart()}
            {chartData.type === 'bar' && renderBarChart()}
            {chartData.type === 'pie' && renderPieChart()}
            {chartData.type === 'process' && renderProcessDiagram()}
            {chartData.type === 'map' && renderMapDiagram()}
          </>
        )}

        {viewMode === 'diagram' && renderDiagramView()}
        {viewMode === 'table' && renderTableView()}
      </div>

      {/* Action Footer */}
      {onSendToEvaluator && (
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-slate-400">
            Write an overview and detail paragraphs (minimum 150 words).
          </span>
          <button
            onClick={onSendToEvaluator}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-600/20 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Practice in AI Writing Evaluator</span>
          </button>
        </div>
      )}
    </div>
  );
}
