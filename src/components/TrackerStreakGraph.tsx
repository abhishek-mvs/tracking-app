import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { format, addDays, differenceInDays, parseISO } from 'date-fns';

interface TrackerStreakGraphProps {
  trackerList: { date: number; count: number }[];
  trackerStatsList: { date: number; totalCount: number; uniqueUsers: number }[];
}

const TrackerStreakGraph = ({ trackerList, trackerStatsList }: TrackerStreakGraphProps) => {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current || !trackerList.length) return;

    const sortedData = [...trackerList].sort((a, b) => a.date - b.date);
    const sortedStatsData = [...trackerStatsList].sort((a, b) => a.date - b.date);

    // Fill in missing dates
    const filledData = [];
    let currentStreak = 0;
    
    if (sortedData.length > 0) {
      const startDate = new Date(sortedData[0].date * 1000);
      const endDate = new Date(sortedData[sortedData.length - 1].date * 1000);
      const totalDays = differenceInDays(endDate, startDate) + 1;
      
      const dateMap = new Map(
        sortedData.map(item => [
          format(new Date(item.date * 1000), 'yyyy-MM-dd'),
          item
        ])
      );
      
      for (let i = 0; i < totalDays; i++) {
        const currentDate = addDays(startDate, i);
        const dateKey = format(currentDate, 'yyyy-MM-dd');
        const unixTimestamp = Math.floor(currentDate.getTime() / 1000);
        
        if (dateMap.has(dateKey)) {
          // Use existing data
          const item = dateMap.get(dateKey)!;
          
          if (item.count === 1) {
            currentStreak++;
          } else {
            currentStreak = 0;
          }
          
          filledData.push({
            date: unixTimestamp,
            count: item.count,
            streak: currentStreak,
            formattedDate: format(currentDate, 'MMM dd')
          });
        } else {
          // Add missing date with default values
          currentStreak = 0; // Reset streak for missing dates
          filledData.push({
            date: unixTimestamp,
            count: 0,
            streak: 0,
            formattedDate: format(currentDate, 'MMM dd')
          });
        }
      }
    }

    // Create a map for community stats with date as key
    const statsMap = new Map();
    sortedStatsData.forEach(item => {
      const dateKey = format(new Date(item.date * 1000), 'yyyy-MM-dd');
      statsMap.set(dateKey, {
        uniqueUsers: item.uniqueUsers,
        totalCount: item.totalCount,
        successRate: item.uniqueUsers > 0 ? Number((item.totalCount / item.uniqueUsers * 100).toFixed(2)) : 0
      });
    });

    // Add community success data to filled data
    const communitySuccessData = filledData.map(item => {
      const dateKey = format(new Date(item.date * 1000), 'yyyy-MM-dd');
      const stats = statsMap.get(dateKey);
      return {
        date: item.formattedDate,
        percentage: stats ? stats.successRate : 0
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
        labels: filledData.map(d => d.formattedDate),
        datasets: [
          {
            label: 'User Streak',
            data: filledData.map(d => d.streak),
            backgroundColor: 'rgba(99, 102, 241, 0.7)',
            yAxisID: 'y',
            order: 2,
            barThickness: 'flex',
            categoryPercentage: 1.0,
            borderSkipped: false,
            borderRadius: { topLeft: 5, topRight: 5 },
          },
          {
            label: 'Community Success Rate %',
            data: communitySuccessData.map(d => d.percentage),
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            type: 'line',
            yAxisID: 'y1',
            order: 1,
            fill: true,
            tension: 0.3,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointStyle: 'circle',
            pointBackgroundColor: 'rgb(255, 99, 132)',
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
            grid: {
              display: true,
              color: 'rgba(0, 0, 0, 0.1)',
            },
            ticks: {
              maxRotation: 45,
              minRotation: 45,
            },
          },
          y: {
            beginAtZero: true,
            grid: {
              display: true,
              color: 'rgba(0, 0, 0, 0.1)',
            },
            title: {
              display: true,
              text: 'User Streak (Days)',
              font: {
                size: 12,
                weight: 'normal',
              },
            },
            ticks: {
              stepSize: 1,
            },
          },
          y1: {
            position: 'right',
            title: {
              display: true,
              text: 'Community Success Rate %',
              font: {
                size: 12,
                weight: 'normal',
              },
            },
            min: 0,
            max: 100,
            grid: {
              drawOnChartArea: false,
            },
            ticks: {
              callback: value => `${value}%`,
            },
          },
        },
        plugins: {
          legend: {
            position: 'top',
            align: 'start',
            labels: {
              usePointStyle: true,
              padding: 20,
              boxWidth: 40,
              boxHeight: 8,
              font: {
                size: 12,
              },
            },
          },
          tooltip: {
            callbacks: {
              label: context => {
                const label = context.dataset.label || '';
                const value = context.parsed.y;
                return label.includes('Success Rate') ? `${label}: ${value.toFixed(1)}%` : `${label}: ${value} days`;
              },
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
    <div className="w-full h-[300px] sm:h-[400px]">
      <canvas ref={chartRef}></canvas>
    </div>
  );
};

export default TrackerStreakGraph; 