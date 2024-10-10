import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface StatisticsChartProps {
  data: { hour: number; duration: number }[];
}

const StatisticsChart: React.FC<StatisticsChartProps> = ({ data }) => {
  const chartData = {
    labels: Array.from({ length: 24 }, (_, i) => i),
    datasets: [
      {
        label: 'Focus Duration',
        data: Array.from({ length: 24 }, (_, i) => {
          const entry = data.find(d => d.hour === i);
          return entry ? entry.duration : 0;
        }),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };

  const options = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Minutes',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Hours',
        },
      },
    },
  };

  return <Bar data={chartData} options={options} />;
};

export default StatisticsChart;