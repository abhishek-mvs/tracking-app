import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { format } from 'date-fns';

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
    const sortedStatsData = [...trackerStatsList].sort((a, b) => a.date - b.date);

    // Calculate streak for each day
    let currentStreak = 0;
    let maxStreak = 0;
    const streakData = sortedData.map((item) => {
      if (item.count === 1) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
      return {
        date: format(new Date(item.date * 1000), 'MMM dd, yyyy'),
        timestamp: item.date,
        streak: currentStreak,
      };
    });

    // Create a map of dates to community success rates
    const statsMap = new Map(
      sortedStatsData.map(item => [
        format(new Date(item.date * 1000), 'MMM dd, yyyy'),
        item.uniqueUsers > 0 ? Number((item.totalCount / item.uniqueUsers * 100).toFixed(2)) : 0
      ])
    );

    // Use streak dates as source of truth and get corresponding community success rates
    const communitySuccessData = streakData.map(streakItem => ({
      date: streakItem.date,
      percentage: statsMap.get(streakItem.date) || 0
    }));
    
    console.log("Aligned communitySuccessData", communitySuccessData);
    console.log("Streak data", streakData);

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
            barThickness: 20,
          },
          {
            label: 'Community Success Rate %',
            data: communitySuccessData.map(d => d.percentage),
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.1)',
            type: 'line',
            yAxisID: 'y1',
            order: 1,
            fill: true,
            tension: 0.1,
            pointRadius: 4,
            pointHoverRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        scales: {
          x: {
            ticks: {
              maxRotation: 45,
              minRotation: 45
            }
          },
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: {
              display: true,
              text: 'User Streak (Days)',
              font: {
                size: 12
              }
            },
            min: 0,
            max: maxStreak + 1,
            ticks: {
              stepSize: 1,
              font: {
                size: 11
              }
            }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            title: {
              display: true,
              text: 'Community Success Rate %',
              font: {
                size: 12
              }
            },
            min: 0,
            max: 100,
            grid: {
              drawOnChartArea: false,
            },
            ticks: {
              callback: function(value) {
                return value + '%';
              },
              stepSize: 20,
              font: {
                size: 11
              }
            }
          },
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              font: {
                size: 12
              }
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.dataset.label || '';
                const value = context.parsed.y;
                if (label.includes('Success Rate')) {
                  return `${label}: ${value.toFixed(1)}%`;
                }
                return `${label}: ${value} days`;
              }
            }
          }
        }
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [trackerList, trackerStatsList]);

  return (
    <div className="w-full h-[300px] sm:h-[400px]">
      <canvas ref={chartRef}></canvas>
    </div>
  );
};

export default TrackerStreakGraph; 