import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

interface TrackerStreakGraphProps {
  trackerList: { date: number; count: number }[];
  trackerStatsList: { date: number; totalCount: number; uniqueUsers: number }[];
}

const TrackerStreakGraph = ({ trackerList, trackerStatsList }: TrackerStreakGraphProps) => {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current || !trackerList.length) return;

    // Sort data by date
    const sortedData = [...trackerList].sort((a, b) => a.date - b.date);

    // Calculate streak for each day
    let currentStreak = 0;
    const streakData = sortedData.map((item) => {
      if (item.count === 1) {
        currentStreak++;
      } else {
        currentStreak = 0;
      }
      return {
        date: new Date(item.date * 1000).toLocaleDateString(),
        streak: currentStreak,
      };
    });

    // Calculate track status percentage
    const trackStatusData = sortedData.map((item, index) => {
      const successfulDays = sortedData.slice(0, index + 1).filter(d => d.count === 1).length;
      const totalDays = index + 1;
      return {
        date: new Date(item.date * 1000).toLocaleDateString(),
        percentage: (successfulDays / totalDays) * 100,
      };
    });

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: streakData.map(d => d.date),
        datasets: [
          {
            label: 'User Streak',
            data: streakData.map(d => d.streak),
            backgroundColor: 'rgba(99, 102, 241, 0.5)',
            yAxisID: 'y',
            order: 2,
          },
          {
            label: 'Track Status %',
            data: trackStatusData.map(d => d.percentage),
            borderColor: 'rgb(255, 99, 132)',
            type: 'line',
            yAxisID: 'y1',
            order: 1,
          },
        ],
      },
      options: {
        responsive: true,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        scales: {
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: {
              display: true,
              text: 'User Streak (Days)',
            },
            min: 0,
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            title: {
              display: true,
              text: 'Track Status %',
            },
            min: 0,
            max: 100,
            grid: {
              drawOnChartArea: false,
            },
          },
        },
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [trackerList, trackerStatsList]);

  return (
    <div className="w-full h-[400px]">
      <canvas ref={chartRef}></canvas>
    </div>
  );
};

export default TrackerStreakGraph; 