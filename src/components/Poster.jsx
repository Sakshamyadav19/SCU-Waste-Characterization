import React, { useEffect, useState } from 'react';
import { csvParse } from 'd3';
import YearlyBarChart from './charts/YearlyBarChart';
import CompositionChart from './charts/CompositionChart';
import YearlyBreakdown from './charts/YearlyBreakdown';
import SeasonalTrend from './charts/SeasonalTrend';
import KPIBox from './KPIBox';
import WasteStreamComparison from './charts/WasteStreamChartComparision';

export default function Poster() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch('/assign2_25S_wastedata.csv')
      .then(r => r.text())
      .then(txt => {
        setData(csvParse(txt, d => ({
          year: +d.Year,
          month: d.Month,
          category: d.Category,
          weight: +d['Weight (lbs)'].replace(/,/g, ''),
          event: `${d.Month} ${d.Year}`,
        })));
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load data", err);
        setLoading(false);
      });
  }, []);

  // Calculate total waste and percentages
  const totalWeight = data.reduce((sum, d) => sum + d.weight, 0);
  const categories = ['Recycle', 'Compost', 'Landfill'];
  const categoryTotals = categories.reduce((acc, cat) => {
    acc[cat] = data.filter(d => d.category === cat).reduce((sum, d) => sum + d.weight, 0);
    return acc;
  }, {});

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-green-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-600 mx-auto"></div>
          <p className="mt-4 text-green-800 font-medium">Loading sustainability data...</p>
        </div>
      </div>
    );
  }

  if (!data.length) return null;

  return (
    <div className="bg-gradient-to-b from-green-50 via-white to-green-50 min-h-screen py-8 px-4">
      {/* HEADER WITH SUSTAINABILITY THEME */}
      <div className="max-w-6xl mx-auto text-center mb-8 relative">
        <h1 className="text-5xl sm:text-6xl font-extrabold text-green-800 mt-6">
          SCU Waste Characterization
        </h1>
        <p className="mt-3 text-lg sm:text-xl text-gray-700">
          Tracking Our Journey Toward Campus Sustainability
        </p>
        
        {/* SUMMARY STATS BANNER */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {categories.map(cat => {
            const percentage = totalWeight ? ((categoryTotals[cat] / totalWeight) * 100).toFixed(1) : 0;
            const colorClass = cat === 'Recycle' ? 'bg-green-600' : 
                              cat === 'Compost' ? 'bg-yellow-500' : 'bg-red-600';
            
            return (
              <div key={cat} className="bg-white rounded-xl shadow-lg p-4 border-t-4 border-b-4 border-opacity-75 transform hover:scale-105 transition-transform duration-300" style={{borderColor: cat === 'Recycle' ? '#2F855A' : cat === 'Compost' ? '#F6E05E' : '#E53E3E'}}>
                <h3 className="text-xl font-bold mb-2" style={{color: cat === 'Recycle' ? '#2F855A' : cat === 'Compost' ? '#B7791F' : '#C53030'}}>{cat}</h3>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold">{percentage}%</span>
                  <span className="text-gray-600">{Math.round(categoryTotals[cat]).toLocaleString()} lbs</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                  <div className={`${colorClass} h-2.5 rounded-full`} style={{ width: `${percentage}%` }}></div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 h-1 w-32 bg-green-600 mx-auto rounded-full" />
      </div>

      {/* GRID LAYOUT WITH IMPROVED SPACING */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main comparison chart */}
        <div className="lg:col-span-2 transform transition hover:shadow-xl duration-300">
          <WasteStreamComparison data={data} />
        </div>

        {/* Yearly Trends */}
        <div className="transform transition hover:shadow-xl duration-300">
          <YearlyBarChart data={data} />
        </div>

        {/* Yearly breakdown */}
        <div className="transform transition hover:shadow-xl duration-300">
          <section className="relative bg-white rounded-2xl shadow-lg border-t-4 border-green-600 overflow-hidden h-full">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-green-800 mb-2">
                Yearly Breakdown
              </h2>
              <YearlyBreakdown data={data} />
            </div>
          </section>
        </div>

        {/* Composition over years */}
        <div className="lg:col-span-2 transform transition hover:shadow-xl duration-300">
          <section className="relative bg-white rounded-2xl shadow-lg border-t-4 border-yellow-500 overflow-hidden h-full">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-yellow-700 mb-2">
                Composition Over Years
              </h2>
              <CompositionChart data={data} />
            </div>
          </section>
        </div>

        {/* Seasonal trends spanning both columns */}
        <div className="lg:col-span-2 transform transition hover:shadow-xl duration-300">
          <section className="relative bg-white rounded-2xl shadow-lg border-t-4 border-green-500 overflow-hidden">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-green-700 mb-2">
                Seasonal Trends
              </h2>
              <SeasonalTrend data={data} />
            </div>
          </section>
        </div>

        {/* KPI SECTION - Key insights in small boxes */}
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4 mt-2">
          <KPIBox 
            title="Total Waste" 
            data={data} 
            calc={(d) => `${Math.round(d.reduce((s, i) => s + i.weight, 0)).toLocaleString()} lbs`} 
            color="green-600" 
          />
          <KPIBox 
            title="Peak Waste Month" 
            data={data} 
            calc={(d) => {
              const months = {};
              d.forEach(item => {
                months[item.month] = (months[item.month] || 0) + item.weight;
              });
              const max = Object.entries(months).reduce((m, c) => c[1] > m[1] ? c : m);
              return max[0];
            }}
            color="yellow-500" 
          />
          <KPIBox 
            title="Diversion Rate" 
            data={data} 
            calc={(d) => {
              const recycle = d.filter(i => i.category === 'Recycle').reduce((s, i) => s + i.weight, 0);
              const compost = d.filter(i => i.category === 'Compost').reduce((s, i) => s + i.weight, 0);
              const total = d.reduce((s, i) => s + i.weight, 0);
              return `${Math.round(((recycle + compost) / total) * 100)}%`;
            }}
            color="green-600" 
          />
          <KPIBox 
            title="Most Recent Year" 
            data={data} 
            calc={(d) => {
              const years = [...new Set(d.map(i => i.year))];
              return Math.max(...years);
            }}
            color="green-700" 
          />
        </div>
      </div>

      {/* FOOTER WITH LEAF MOTIF */}
      <div className="max-w-6xl mx-auto text-center mt-10 pb-8 relative">
        <div className="h-0.5 bg-gradient-to-r from-green-200 via-green-500 to-green-200 w-1/2 mx-auto mb-6" />
        <div className="flex justify-center gap-2 mb-2">
          <span className="text-green-700">♻️</span>
          <span className="text-yellow-600">🌱</span>
          <span className="text-green-700">♻️</span>
        </div>
        <p className="text-gray-600">
          Sustainability Report • April 2025 • SCU Environmental Services Division
        </p>
        <p className="text-green-700 text-sm mt-1">
          Working together for a greener campus
        </p>
      </div>
    </div>
  );
}