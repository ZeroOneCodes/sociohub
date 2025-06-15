import React, { useEffect, useState } from 'react';

const LaunchDate = () => {
  const targetDate = new Date('June 1, 2025 00:00:00').getTime();
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-white  p-8 rounded-lg ">
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-center">🚀 Launching in May!</h1>
      <div className="flex space-x-6 text-center text-3xl sm:text-4xl md:text-5xl font-semibold">
        <div>
          <div>{timeLeft.days}</div>
          <div className="text-sm text-gray-400">Days</div>
        </div>
        <div>
          <div>{timeLeft.hours}</div>
          <div className="text-sm text-gray-400">Hours</div>
        </div>
        <div>
          <div>{timeLeft.minutes}</div>
          <div className="text-sm text-gray-400">Minutes</div>
        </div>
        <div>
          <div>{timeLeft.seconds}</div>
          <div className="text-sm text-gray-400">Seconds</div>
        </div>
      </div>
    </div>
  );
};

export default LaunchDate;
