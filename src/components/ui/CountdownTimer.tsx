"use client";

import React, { useState, useEffect } from "react";

interface CountdownTimerProps {
  endDate: string | Date;
  onExpire?: () => void;
}

export function CountdownTimer({ endDate, onExpire }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  useEffect(() => {
    const target = new Date(endDate).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        onExpire?.();
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isExpired: false });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [endDate, onExpire]);

  if (timeLeft.isExpired) {
    return (
      <span className="text-xs tracking-wider uppercase font-semibold text-rose-600">
        Offer Expired
      </span>
    );
  }

  const units = [
    { label: "D", value: timeLeft.days },
    { label: "H", value: timeLeft.hours },
    { label: "M", value: timeLeft.minutes },
    { label: "S", value: timeLeft.seconds },
  ];

  return (
    <div className="flex items-center gap-1.5 font-mono text-sm">
      {units.map((unit, i) => (
        <div key={unit.label} className="flex items-center">
          <div className="bg-[#241813] text-[#FAF8F5] px-2 py-1 rounded min-w-[2.2rem] text-center font-bold">
            {String(unit.value).padStart(2, "0")}
          </div>
          <span className="text-[10px] uppercase font-sans text-[#96867B] ml-0.5 mr-1">
            {unit.label}
          </span>
          {i < units.length - 1 && <span className="text-[#A6875C] mr-1 font-bold">:</span>}
        </div>
      ))}
    </div>
  );
}
