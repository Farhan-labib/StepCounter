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
  Legend,
} from "chart.js";
import "chartjs-adapter-date-fns";

ChartJS.register(TimeScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function Home() {
  const { data, error } = useSWR("/api/steps?limit=50", fetcher, { refreshInterval: 5000 });

  if (error) return <div className="text-center mt-10">Error loading steps</div>;
  if (!data) return <div className="text-center mt-10">Loading...</div>;
  if (!Array.isArray(data) || data.length === 0)
    return <div className="text-center mt-10">No steps data available</div>;

  const sorted = data.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  const labels = sorted.map((d) => new Date(d.timestamp));
  const values = sorted.map((d) => d.stepCount);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Steps",
        data: values,
        borderColor: "blue",
        fill: false,
      },
    ],
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStep = data.find((d) => new Date(d.timestamp).setHours(0, 0, 0, 0) === today.getTime());
  const todaysSteps = todayStep ? todayStep.stepCount : 0;

  return (
    <div className="max-w-xl mx-auto mt-10 px-4">
      <h1 className="text-2xl font-bold text-center mb-4">Step Dashboard</h1>
      <p className="text-center text-xl mb-6">Today's Steps: <span className="font-semibold">{todaysSteps}</span></p>
      <Line data={chartData} />
    </div>
  );
}
