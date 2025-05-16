import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Cell
} from 'recharts';

const STREAMS = ['All', 'Recycle', 'Compost', 'Landfill'];
const COLORS = {
  All: '#38A169',
  Recycle: '#2F855A',
  Compost: '#F6E05E',
  Landfill: '#E53E3E',
};

export default function YearlyBarChart({ data }) {
  const [stream, setStream] = useState('All');
  const [animate, setAnimate] = useState(false);
  
  // Add animation on mount
  useEffect(() => {
    setAnimate(true);
  }, []);

  // Get sorted unique years
  const years = Array.from(new Set(data.map((d) => d.year))).sort();

  // Build data series for the selected stream
  const series = years.map((year) => {
    const slice = data.filter((d) => d.year === year);
    let value = 0;
    if (stream === 'All') {
      value = slice.reduce((sum, d) => sum + d.weight, 0);
    } else {
      value = slice
        .filter((d) => d.category === stream)
        .reduce((sum, d) => sum + d.weight, 0);
    }
    return { year, value };
  });

  // Filter out zeros for KPI calculation
  const nonZero = series.filter((d) => d.value > 0);

  // Compute max/min with guards
  let max, min;
  if (nonZero.length > 0) {
    max = nonZero.reduce(
      (m, c) => (c.value > m.value ? c : m),
      nonZero[0]
    );
    min = nonZero.reduce(
      (m, c) => (c.value < m.value ? c : m),
      nonZero[0]
    );
  } else {
    max = { year: 'N/A', value: 0 };
    min = { year: 'N/A', value: 0 };
  }

  // Calculate percentage change from first to last year
  const firstYear = nonZero[0];
  const lastYear = nonZero[nonZero.length - 1];
  let percentChange = 0;
  
  if (firstYear && lastYear && firstYear.value > 0) {
    percentChange = ((lastYear.value - firstYear.value) / firstYear.value * 100).toFixed(1);
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const color = COLORS[stream];
      
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-lg rounded-lg">
          <p className="font-bold text-gray-800 border-b pb-1 mb-1">{data.year}</p>
          <p style={{ color }} className="flex justify-between">
            <span className="font-medium mr-4">{stream === 'All' ? 'Total Waste' : stream}:</span> 
            <span>{Math.round(data.value).toLocaleString()} lbs</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <section className={`relative bg-white rounded-2xl shadow-xl border-t-4 overflow-hidden transition-all duration-500 ${animate ? 'opacity-100' : 'opacity-0'}`} style={{borderColor: COLORS[stream]}}>


      <div className="p-6">
        {/* Title & Stream Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold" style={{color: COLORS[stream]}}>
              Yearly {stream} Waste
            </h2>
            <p className="text-sm text-gray-500">
              Showing overall waste trends by year
            </p>
          </div>
          <select
            value={stream}
            onChange={(e) => setStream(e.target.value)}
            className="p-2 px-4 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-700"
            style={{borderColor: COLORS[stream]}}
          >
            {STREAMS.map((s) => (
              <option key={s} value={s}>
                {s === 'All' ? 'All Waste' : s}
              </option>
            ))}
          </select>
        </div>

        {/* Bar Chart */}
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={series} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis 
              dataKey="year" 
              tick={{ fill: '#4A5568' }}
              axisLine={{ stroke: '#E2E8F0' }}
            />
            <YAxis 
              tick={{ fill: '#4A5568' }}
              axisLine={{ stroke: '#E2E8F0' }}
              tickFormatter={(value) => value >= 1000 ? `${(value/1000).toFixed(1)}k` : value}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar
              dataKey="value"
              name={stream === 'All' ? 'Total Waste' : stream}
              radius={[4, 4, 0, 0]}
              animationDuration={1500}
            >
              {series.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[stream]}
                  fillOpacity={0.8 + (index/series.length * 0.2)} // Gives slight gradient effect
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Enhanced KPIs */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-600 shadow-sm">
            <div className="text-sm text-gray-600">Peak Year</div>
            <div className="font-bold text-green-800 text-lg">
              {max.year}
            </div>
            <div className="text-green-600">
              {max.year !== 'N/A' && `${Math.round(max.value).toLocaleString()} lbs`}
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500 shadow-sm">
            <div className="text-sm text-gray-600">Trend</div>
            <div className="font-bold text-blue-800 text-lg flex items-center">
              {percentChange > 0 ? (
                <span className="text-red-600">+{percentChange}% ↑</span> 
              ) : percentChange < 0 ? (
                <span className="text-green-600">{percentChange}% ↓</span>
              ) : (
                <span className="text-gray-600">0% →</span>
              )}
            </div>
            <div className="text-blue-600">
              {firstYear?.year} to {lastYear?.year}
            </div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500 shadow-sm">
            <div className="text-sm text-gray-600">Lowest Year</div>
            <div className="font-bold text-purple-800 text-lg">
              {min.year}
            </div>
            <div className="text-purple-600">
              {min.year !== 'N/A' && `${Math.round(min.value).toLocaleString()} lbs`}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}