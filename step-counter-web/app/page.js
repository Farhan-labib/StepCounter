'use client';

import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const [stepData, setStepData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalSteps, setTotalSteps] = useState(0);

  // Fetch data from API
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/steps');
      const result = await response.json();
      
      if (result.success) {
        setStepData(result.data);
        
        // Calculate total steps
        const total = result.data.reduce((sum, item) => sum + item.stepCount, 0);
        setTotalSteps(total);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  // Fetch data on mount
  useEffect(() => {
    fetchData();
    
    // Auto-refresh every 5 seconds
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  // Prepare chart data
  const chartData = {
    labels: stepData.map(item => {
      const date = new Date(item.timestamp);
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }),
    datasets: [
      {
        label: 'Step Count',
        data: stepData.map(item => item.stepCount),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Step Count Over Time',
        font: {
          size: 18,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Steps',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Time',
        },
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Step Counter Dashboard
          </h1>
          <p className="text-gray-600">
            Real-time step tracking and visualization
          </p>
        </div>

        {/* Total Steps Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8 text-center">
          <div className="text-lg text-gray-500 mb-2">Total Steps</div>
          <div className="text-6xl font-bold text-blue-600">
            {totalSteps.toLocaleString()}
          </div>
        </div>

        {/* Refresh Button */}
        <div className="flex justify-end mb-6">
          <button
            onClick={fetchData}
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors shadow-lg"
          >
            🔄 Refresh Data
          </button>
        </div>

        {/* Chart */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-gray-500 text-xl">Loading data...</div>
            </div>
          ) : stepData.length === 0 ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="text-gray-500 text-xl mb-2">No data available</div>
                <div className="text-gray-400">
                  Start walking with your mobile app to see data here!
                </div>
              </div>
            </div>
          ) : (
            <div className="h-96">
              <Line data={chartData} options={chartOptions} />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-600">
          <p>Data updates automatically every 5 seconds</p>
        </div>
      </div>
    </div>
  );
}