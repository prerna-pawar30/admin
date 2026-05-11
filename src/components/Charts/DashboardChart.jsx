import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Pie, Bar, Doughnut } from 'react-chartjs-2';

// Register ChartJS modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
);

const AdminChart = ({ stats = [] }) => {
  const [activeChart, setActiveChart] = useState('bar');

  // 🍊 Tailwind Orange Shades (100 → 600)
  const bgColors = [
    'rgba(255, 237, 213, 0.9)', // orange-100
    'rgba(254, 215, 170, 0.9)', // orange-200
    'rgba(253, 186, 116, 0.9)', // orange-300
    'rgba(251, 146, 60, 0.9)',  // orange-400
    'rgba(249, 115, 22, 0.9)',  // orange-500
    'rgba(234, 88, 12, 0.9)',   // orange-600
  ];

  const chartData = {
    labels: stats.map(item => item.label),
    datasets: [
      {
        label: 'Analytics Data',
        data: stats.map(item => item.value),
        backgroundColor: bgColors.slice(0, stats.length),
        borderColor: bgColors
          .slice(0, stats.length)
          .map(c => c.replace('0.9', '1')),
        borderWidth: 1,
        borderRadius: 8,
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { padding: 16 },
      },
    },
    scales: activeChart === 'bar'
      ? {
          y: {
            beginAtZero: true,
            grid: { color: '#f3f4f6' },
          },
          x: {
            grid: { display: false },
          },
        }
      : {},
  };

  const renderChart = () => {
    switch (activeChart) {
      case 'line':
        return <Line data={chartData} options={options} />;
      case 'pie':
        return <Pie data={chartData} options={options} />;
      case 'doughnut':
        return <Doughnut data={chartData} options={options} />;
      default:
        return <Bar data={chartData} options={options} />;
    }
  };

  return (
    <div className="w-full bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h3 className="text-lg font-bold text-gray-800 uppercase tracking-wider">
          Visual Analytics
        </h3>

        {/* Chart Type Switch */}
        <div className="flex bg-gray-100 p-1 rounded-lg">
          {['bar', 'line', 'doughnut', 'pie'].map(type => (
            <button
              key={type}
              onClick={() => setActiveChart(type)}
              className={`px-4 py-2 text-xs font-semibold rounded-md transition-all capitalize ${
                activeChart === type
                  ? 'bg-orange-400 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Area */}
      <div className="h-96 w-full">
        {stats.length > 0 ? (
          renderChart()
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
            No data available
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminChart;
