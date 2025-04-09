import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { format } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface TrackerStat {
  date: number;
  totalCount: number;
  uniqueUsers: number;
}

interface TrackerStatsGraphProps {
  stats: TrackerStat[];
}

export default function TrackerStatsGraph({ stats }: TrackerStatsGraphProps) {
  const data = {
    labels: stats.map(stat => format(new Date(stat.date * 1000), 'MMM dd, yyyy')),
    datasets: [
      {
        label: 'Success Rate (%)',
        data: stats.map(stat => (stat.totalCount / stat.uniqueUsers) * 100),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
        yAxisID: 'y',
      },
    ],
  };

  const options = {
    responsive: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        min: 0,
        max: 100,
        title: {
          display: true,
          text: 'Success Rate (%)'
        }
      },
    },
    plugins: {
      title: {
        display: true,
        text: 'Daily Success Rate'
      }
    }
  };

  return (
    <div className="w-full h-[400px]">
      <Line options={options} data={data} />
    </div>
  );
} 