import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';

// Improved sustainability color palette
const COLORS = {
  'Recycle': '#2F855A', // Dark green for recycling
  'Compost': '#F6E05E',   // Yellow/amber for compost 
  'Landfill': '#E53E3E'   // Red for landfill
};

export default function CompositionChart({ data }) {
  // Get sorted unique years and categories
  const years = [...new Set(data.map(d => d.year))].sort();
  const cats = ['Recycle', 'Compost', 'Landfill']; // Ensure consistent order
  
  // Prepare data for area chart - calculate yearly totals by category
  const series = years.map(y => {
    const row = {year: y};
    let yearTotal = 0;
    
    // Calculate category totals
    cats.forEach(c=> {
      const catTotal = data
        .filter(d => d.year === y && d.category === c)
        .reduce((s, d) => s + d.weight, 0);
      row[c] = catTotal;
      yearTotal += catTotal;
    });
    
    // Also calculate percentages for tooltip
    cats.forEach(c => {
      row[`${c}Pct`] = yearTotal > 0 ? Math.round((row[c] / yearTotal) * 100) : 0;
    });
    
    return row;
  });

  // Custom tooltip to show both weight and percentage
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const totalValue = payload.reduce((sum, entry) => sum + entry.value, 0);
      
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-lg rounded-lg">
          <p className="font-bold text-gray-700">{`Year: ${label}`}</p>
          <div className="h-0.5 bg-gray-200 my-1" />
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="flex justify-between">
              <span className="font-medium mr-4">{entry.name}:</span> 
              <span>{`${Math.round(entry.value).toLocaleString()} lbs (${Math.round((entry.value / totalValue) * 100)}%)`}</span>
            </p>
          ))}
          <div className="h-0.5 bg-gray-200 my-1" />
          <p className="font-medium text-gray-700">
            Total: {Math.round(totalValue).toLocaleString()} lbs
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-lg">
      <h3 className="text-xl font-semibold text-yellow-700 mb-4">Waste Composition Trends</h3>
      
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart 
          data={series}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <defs>
            {cats.map((cat, index) => (
              <linearGradient key={cat} id={`color${cat}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS[cat]} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={COLORS[cat]} stopOpacity={0.2}/>
              </linearGradient>
            ))}
          </defs>
          
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="year" 
            tick={{ fill: '#4A5568' }}
            tickLine={{ stroke: '#CBD5E0' }}
          />
          <YAxis 
            tick={{ fill: '#4A5568' }}
            tickLine={{ stroke: '#CBD5E0' }}
            tickFormatter={(value) => value >= 1000 ? `${value/1000}k` : value}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="top" 
            height={36}
            formatter={(value) => <span style={{ color: COLORS[value], fontWeight: 'bold' }}>{value}</span>}
          />
          
          {cats.map((cat) => (
            <Area 
              key={cat} 
              type="monotone" 
              dataKey={cat} 
              stackId="1" 
              stroke={COLORS[cat]} 
              fill={`url(#color${cat})`}
              activeDot={{ r: 5, stroke: '#fff', strokeWidth: 1 }}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
      
      {/* KPI Summary */}
      <div className="grid grid-cols-3 gap-2 mt-4">
        {cats.map(cat => {
          const total = series.reduce((sum, year) => sum + year[cat], 0);
          const yearCount = series.length;
          const average = yearCount > 0 ? Math.round(total / yearCount) : 0;
          
          return (
            <div 
              key={cat} 
              className="bg-gray-50 p-2 rounded-lg text-center border-b-2" 
              style={{ borderColor: COLORS[cat] }}
            >
              <div className="text-xs text-gray-500">Avg {cat}/Year</div>
              <div 
                className="font-bold"
                style={{ color: COLORS[cat] }}
              >
                {average.toLocaleString()} lbs
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}