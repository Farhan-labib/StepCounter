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

  if (!data) return <div>Loading...</div>;

  const sorted = data.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  const labels = sorted.map(d => new Date(d.timestamp));
  const values = sorted.map(d => d.stepCount);

  const chartData = {
    labels,
    datasets: [{
      label: "Steps",
      data: values,
      borderColor: "blue",
      fill: false,
    }]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Step Dashboard',
      },
    },
    scales: {
      x: {
        type: 'time',  
        time: {
          unit: 'day', 
        },
      },
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div style={{ maxWidth: 800, margin: "20px auto" }}>
      <h1>Step Dashboard</h1>
      <Line data={chartData} options={chartOptions} />
    </div>
  );
}
