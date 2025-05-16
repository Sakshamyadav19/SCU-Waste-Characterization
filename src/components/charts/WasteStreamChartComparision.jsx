import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';

const STREAMS = ['Recycle', 'Compost', 'Landfill'];
const COLORS = {
  Recycle: '#2F855A', // Dark green
  Compost: '#F6E05E',   // Yellow
  Landfill: '#E53E3E',  // Red
};

export default function WasteStreamComparison({ data }) {
  // State for selected streams
  const [selected, setSelected] = useState(new Set(STREAMS));
  // State for animation
  const [animate, setAnimate] = useState(false);

  // Animation effect on mount
  useEffect(() => {
    setAnimate(true);
  }, []);

  // Build year categories
  const years = Array.from(new Set(data.map(d => d.year))).sort();

  // prepare a row per year with each stream's total
  const series = years.map(year => {
    const row = { year };
    STREAMS.forEach(cat => {
      row[cat] = data
        .filter(d => d.year === year && d.category === cat)
        .reduce((sum, d) => sum + d.weight, 0);
    });
    return row;
  });

  // KPI: year with highest TOTAL waste across selected streams
  const totals = series.map(r => ({
    year: r.year,
    total: STREAMS.filter(s => selected.has(s))
                  .reduce((s, cat) => s + r[cat], 0)
  }));
  
  const peak = totals.reduce((m, c) => (c.total > m.total ? c : m), totals[0]);
  const trough = totals.reduce((m, c) => (c.total < m.total ? c : m), totals[0]);

  // Calculate trend percent change from first to last year
  const firstYear = totals[0];
  const lastYear = totals[totals.length - 1];
  const percentChange = firstYear && lastYear && firstYear.total > 0
    ? ((lastYear.total - firstYear.total) / firstYear.total * 100).toFixed(1)
    : 0;
  
  // Toggle category visibility
  const toggle = (cat) => {
    const next = new Set(selected);
    next.has(cat) ? next.delete(cat) : next.add(cat);
    // at least one stays selected
    if (next.size) setSelected(next);
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      // Calculate total for this year
      const yearTotal = payload.reduce((sum, entry) => sum + entry.value, 0);
      
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-lg rounded-lg">
          <p className="font-bold text-gray-800 border-b pb-1 mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="flex justify-between items-center">
              <span className="font-medium mr-6">{entry.name}:</span> 
              <span>{Math.round(entry.value).toLocaleString()} lbs</span>
            </p>
          ))}
          <div className="h-0.5 bg-gray-100 my-1"></div>
          <p className="font-bold flex justify-between">
            <span>Total:</span>
            <span>{Math.round(yearTotal).toLocaleString()} lbs</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <section className={`relative bg-white rounded-2xl shadow-xl border-t-4 border-green-600 overflow-hidden transition-all duration-500 ${animate ? 'opacity-100' : 'opacity-0'}`}>

      <div className="p-6">
        {/* Header with toggles */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-green-800">Waste Stream Comparison</h2>
            <p className="text-sm text-gray-500">Toggle categories to compare different waste streams</p>
          </div>
          <div className="flex space-x-2">
            {STREAMS.map(cat => {
              const isSelected = selected.has(cat);
              const bgColor = isSelected 
                ? cat === 'Recycle' ? 'bg-green-600' 
                  : cat === 'Compost' ? 'bg-yellow-500' 
                  : 'bg-red-600'
                : 'bg-white';
              const textColor = isSelected ? 'text-white' : `text-gray-700`;
              
              return (
                <button
                  key={cat}
                  onClick={() => toggle(cat)}
                  className={`px-4 py-2 rounded-full border-2 transition-all duration-300 transform ${
                    isSelected ? 'shadow-md scale-105' : 'shadow'
                  } ${bgColor} ${textColor} border-${
                    cat === 'Recycle' ? 'green-600' : cat === 'Compost' ? 'yellow-500' : 'red-600'
                  } font-medium`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Grouped BarChart */}
        <ResponsiveContainer width="100%" height={300}>
          <BarChart 
            data={series} 
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            barGap={2}
            barCategoryGap="15%"
          >
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
            <Legend 
              verticalAlign="top" 
              height={36}
              formatter={(value) => (
                <span style={{ color: COLORS[value], fontWeight: 'bold' }}>
                  {value}
                </span>
              )}
            />
            {STREAMS.filter(cat => selected.has(cat)).map(cat => (
              <Bar 
                key={cat} 
                dataKey={cat} 
                fill={COLORS[cat]}
                radius={[4, 4, 0, 0]}
                animationDuration={1500}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>

        {/* KPIs aligned under chart */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-600 shadow-sm">
            <div className="text-sm text-gray-600">Peak Total Year</div>
            <div className="font-bold text-green-800 text-xl">
              {peak.year}
            </div>
            <div className="text-green-600">
              {Math.round(peak.total).toLocaleString()} lbs
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500 shadow-sm">
            <div className="text-sm text-gray-600">Overall Trend</div>
            <div className="font-bold text-blue-800 text-xl">
              {percentChange > 0 ? '+' : ''}{percentChange}%
            </div>
            <div className="text-blue-600">
              {firstYear?.year} to {lastYear?.year}
            </div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500 shadow-sm">
            <div className="text-sm text-gray-600">Lowest Total Year</div>
            <div className="font-bold text-purple-800 text-xl">
              {trough.year}
            </div>
            <div className="text-purple-600">
              {Math.round(trough.total).toLocaleString()} lbs
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}