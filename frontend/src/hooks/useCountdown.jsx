import { useEffect, useMemo, useState } from "react";

const getRemaining = (targetDate) => {
  const now = Date.now();
  const distance = new Date(targetDate).getTime() - now;
  const safe = Math.max(distance, 0);

  const days = Math.floor(safe / (1000 * 60 * 60 * 24));
  const hours = Math.floor((safe / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((safe / (1000 * 60)) % 60);
  const seconds = Math.floor((safe / 1000) % 60);

  return { total: safe, days, hours, minutes, seconds };
};

export default function useCountdown(targetDate) {
  const [remaining, setRemaining] = useState(() => getRemaining(targetDate));

  useEffect(() => {
    const timer = setInterval(() => {
      setRemaining(getRemaining(targetDate));
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return useMemo(() => remaining, [remaining]);
}

