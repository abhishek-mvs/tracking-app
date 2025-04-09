import { useMemo } from 'react';
import { getNormalizedCurrentDate } from '../utils/program';
import { mintNft } from '@/lib/mintNft';

interface DailyTrackingStatusProps {
  trackerList: { date: number; count: number }[];
  onTrack: (succeeded: boolean) => Promise<void>;
}

const DailyTrackingStatus = ({ trackerList, onTrack }: DailyTrackingStatusProps) => {
  const lastTracked = useMemo(() => {
    if (!trackerList.length) return null;
    
    // Sort by date in descending order and get the latest entry
    const sortedList = [...trackerList].sort((a, b) => b.date - a.date);
    return sortedList[0];
  }, [trackerList]);

  const isToday = lastTracked?.date === getNormalizedCurrentDate();

  if (!lastTracked || !isToday) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-center mb-4">
          Did you maintain your streak today?
        </h2>
        <button
          className="w-full py-4 px-6 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
          onClick={() => onTrack(true)}
        >
          Hurray! 🎉
        </button>
        <button
          className="w-full py-4 px-6 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
          onClick={() => onTrack(false)}
        >
          Nah! 😔
        </button>
      </div>
    );
  }

  return (
    <div className="text-center p-6 rounded-lg bg-gray-50">
      {lastTracked.count === 1 ? (
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-green-600">
            Amazing work today! 🌟
          </h3>
          <p className="text-gray-600">
            You're building a great streak. Keep it up!
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-blue-600">
            Tomorrow is a new day! 💪
          </h3>
          <p className="text-gray-600">
            Every setback is a setup for a comeback. We believe in you!
          </p>
        </div>
      )}
    </div>
  );
};

export default DailyTrackingStatus; 