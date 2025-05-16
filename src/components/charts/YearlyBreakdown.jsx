import React, { useState } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

// Improved color scheme for sustainability theme
const COLORS = {
  'Recycle': '#2F855A', // Dark green for recycling
  'Compost': '#F6E05E',   // Yellow for compost
  'Landfill': '#E53E3E'   // Red for landfill
};

// Custom render for the labels
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
  const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor="middle" 
      dominantBaseline="central"
      fontWeight="bold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function YearlyBreakdown({ data }) {
  // Get unique years and categories
  const years = [...new Set(data.map(d => d.year))].sort();
  const cats = [...new Set(data.map(d => d.category))];
  const [year, setYear] = useState(years.at(-2)); // Start with most recent year
  
  // Filter data for selected year and prepare for pie chart
  const slice = data.filter(d => d.year === year);
  const summary = {};
  slice.forEach(d => summary[d.category] = (summary[d.category] || 0) + d.weight);
  
  // Calculate percentages and prepare pie data
  const total = cats.reduce((sum, cat) => sum + (summary[cat] || 0), 0);
  const pieData = cats.map(cat => ({ 
    name: cat, 
    value: summary[cat] || 0,
    percentage: total ? ((summary[cat] || 0) / total * 100).toFixed(1) + '%' : '0%',
    amount: Math.round(summary[cat] || 0).toLocaleString() + ' lbs'
  }));

  // Custom tooltip to show both percentage and weight
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip" style={{ backgroundColor: '#fff', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
          <p className="label" style={{ fontWeight: 'bold', color: COLORS[data.name] }}>{`${data.name}`}</p>
          <p className="intro" style={{ margin: '5px 0' }}>{`${data.percentage} (${data.amount})`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-green-800">
          Waste Distribution {year}
        </h3>
        <select 
          value={year} 
          onChange={e => setYear(+e.target.value)} 
          className="p-2 border border-green-300 rounded-md text-green-800 bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-400"
        >
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>
      
      {/* Main chart */}
      <ResponsiveContainer width="100%" height={230}>
        <PieChart>
          <Pie
            data={pieData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={85}
            innerRadius={40}
            labelLine={false}
            label={renderCustomizedLabel}
          >
            {pieData.map((entry) => (
              <Cell 
                key={entry.name} 
                fill={COLORS[entry.name]} 
                stroke="#fff"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            layout="horizontal" 
            verticalAlign="bottom" 
            align="center"
            formatter={(value) => <span style={{ color: COLORS[value], fontWeight: 'bold' }}>{value}</span>} 
          />
        </PieChart>
      </ResponsiveContainer>
      
      {/* Summary statistics */}
      <div className="grid grid-cols-3 gap-2 mt-4 text-center">
        {pieData.map(item => (
          <div 
            key={item.name} 
            className="p-2 rounded bg-gray-50 border-t-2" 
            style={{ borderColor: COLORS[item.name] }}
          >
            <div className="text-xs text-gray-500">{item.name}</div>
            <div className="font-bold text-sm" style={{ color: COLORS[item.name] }}>
              {item.percentage}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}