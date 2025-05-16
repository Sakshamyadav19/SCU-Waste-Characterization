import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ReferenceLine } from 'recharts';

// Month order for sorting
const MONTH_ORDER = {
  'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4, 'May': 5, 'Jun': 6, 
  'Jul': 7, 'Aug': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12
};

// Full month names
const MONTH_NAMES = {
  'Jan': 'January', 'Feb': 'February', 'Mar': 'March', 'Apr': 'April',
  'May': 'May', 'Jun': 'June', 'Jul': 'July', 'Aug': 'August',
  'Sep': 'September', 'Oct': 'October', 'Nov': 'November', 'Dec': 'December'
};

export default function SeasonalTrend({ data }) {
  // Group data by month and calculate averages
  const monthlyData = {};
  
  data.forEach(d => {
    monthlyData[d.month] = monthlyData[d.month] || [];
    monthlyData[d.month].push(d.weight);
  });
  
  // Calculate averages and prepare chart series
  const series = Object.entries(monthlyData)
    .map(([month, weights]) => ({
      month,
      avg: weights.reduce((a, b) => a + b, 0) / weights.length,
      // Add data for tooltips
      dataPoints: weights.length,
      min: Math.min(...weights),
      max: Math.max(...weights)
    }))
    .sort((a, b) => MONTH_ORDER[a.month] - MONTH_ORDER[b.month]);

  // Calculate important points for reference
  const yearAvg = series.reduce((sum, item) => sum + item.avg, 0) / series.length;
  const highestMonth = series.reduce((max, item) => item.avg > max.avg ? item : max, series[0]);
  const lowestMonth = series.reduce((min, item) => item.avg < min.avg ? item : min, series[0]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-lg rounded-lg">
          <p className="font-bold text-gray-800">{MONTH_NAMES[label]}</p>
          <p className="text-green-700 font-medium">
            Average: {Math.round(data.avg).toLocaleString()} lbs
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-green-100">
      <h3 className="text-xl font-semibold text-green-700 mb-2">Seasonal Waste Patterns</h3>
      <p className="text-gray-600 text-sm mb-4">
        Average monthly waste production across all years
      </p>
      
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={series}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          
          <XAxis 
            dataKey="month" 
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
          />
          
          {/* Reference line for yearly average */}
          <ReferenceLine 
            y={yearAvg} 
            stroke="#718096" 
            strokeDasharray="3 3"
            label={{ 
              value: "Yearly Avg", 
              position: 'insideBottomRight',
              fill: '#718096',
              fontSize: 12
            }} 
          />
          
          <Line 
            type="monotone" 
            dataKey="avg" 
            name="Monthly Average"
            stroke="#2F855A" 
            strokeWidth={3}
            dot={{ 
              stroke: '#2F855A', 
              strokeWidth: 2, 
              r: 4, 
              fill: '#fff' 
            }} 
            activeDot={{ 
              r: 6, 
              stroke: '#fff',
              strokeWidth: 2, 
              fill: '#2F855A' 
            }} 
          />
        </LineChart>
      </ResponsiveContainer>
      
      {/* KPI summary below chart */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        <div className="bg-green-50 p-3 rounded-lg border-l-4 border-green-600">
          <div className="text-sm text-gray-600">Peak Month</div>
          <div className="font-bold text-green-800 text-lg">
            {MONTH_NAMES[highestMonth.month]}
          </div>
          <div className="text-green-600 text-sm">
            {Math.round(highestMonth.avg).toLocaleString()} lbs avg
          </div>
        </div>
        
        <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500">
          <div className="text-sm text-gray-600">Average Monthly</div>
          <div className="font-bold text-blue-800 text-lg">
            {Math.round(yearAvg).toLocaleString()} lbs
          </div>
          <div className="text-blue-600 text-sm">
            across all months
          </div>
        </div>
        
        <div className="bg-yellow-50 p-3 rounded-lg border-l-4 border-yellow-500">
          <div className="text-sm text-gray-600">Lowest Month</div>
          <div className="font-bold text-yellow-800 text-lg">
            {MONTH_NAMES[lowestMonth.month]}
          </div>
          <div className="text-yellow-600 text-sm">
            {Math.round(lowestMonth.avg).toLocaleString()} lbs avg
          </div>
        </div>
      </div>
    </div>
  );
}