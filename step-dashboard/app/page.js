"use client";

import useSWR from "swr";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import 'chartjs-adapter-date-fns';

ChartJS.register(TimeScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function Home() {
  const { data } = useSWR("/api/steps?limit=50", fetcher, { refreshInterval: 5000 });

  if (!data || !data.length) return <div className="flex items-center justify-center h-screen text-gray-500 text-lg">Loading...</div>;

  const sorted = data.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  const labels = sorted.map(d => new Date(d.timestamp));
  const values = sorted.map(d => d.stepCount);

  const latestStepData = sorted[sorted.length - 1];
  const todaySteps = latestStepData ? latestStepData.stepCount : 0;

  const chartData = {
    labels,
    datasets: [{
      label: "Steps",
      data: values,
      borderColor: "#3b82f6",
      backgroundColor: "#3b82f6",
      tension: 0.3,
      fill: false,
      pointRadius: 4
    }]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top', labels: { font: { size: 14 } } },
      title: { display: true, text: 'Step Dashboard', font: { size: 26 }, padding: { top: 10, bottom: 20 } },
      tooltip: { mode: 'index', intersect: false }
    },
    scales: {
      x: { type: 'time', time: { unit: 'day' }, title: { display: true, text: 'Date', font: { size: 16 } } },
      y: { beginAtZero: true, title: { display: true, text: 'Steps', font: { size: 16 } } }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="bg-white p-8 shadow-2xl rounded-3xl flex flex-col items-center w-full max-w-md">
        <h1 className="text-4xl font-bold text-center mb-6 text-gray-800">Step Dashboard</h1>
        <div className="text-center mb-6">
          <span className="text-gray-500 text-xl">Today's Steps:</span>
          <span className="text-5xl font-extrabold ml-2 text-blue-600">{todaySteps}</span>
        </div>
        <div className="w-full max-w-[350px]">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
}
