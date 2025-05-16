import React from 'react';

export default function KPIBox({ title, data, calc, color = 'green-600' }) {
  // Safely compute the KPI value
  let value;
  try {
    value = calc(data);
  } catch (error) {
    value = 'N/A';
    console.error(`Error calculating KPI for ${title}:`, error);
  }

  return (
    <div className={`bg-white rounded-xl p-4 shadow-lg border-l-4 border-${color} transform transition-all hover:scale-105 duration-300`}>
      <div className="flex items-center">
        <div className={`w-2 h-10 bg-${color} rounded-full mr-3 hidden sm:block`}></div>
        <div>
          <div className="text-sm sm:text-lg font-medium text-gray-600">{title}</div>
          <div className={`text-xl sm:text-2xl font-bold text-${color} mt-1`}>
            {value}
          </div>
        </div>
      </div>
    </div>
  );
}