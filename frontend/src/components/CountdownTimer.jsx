import useCountdown from "../hooks/useCountdown";

export default function CountdownTimer({ targetDate, endedText = "Completed" }) {
  const { total, days, hours, minutes, seconds } = useCountdown(targetDate);
  if (total <= 0) return <span className="text-sm font-semibold text-brand-primary">{endedText}</span>;

  return (
    <div className="text-sm font-semibold text-slate-700">
      <span>{days}d </span>
      <span>{hours}h </span>
      <span>{minutes}m </span>
      <span className="animate-pulse-soft text-brand-primary">{seconds}s</span>
    </div>
  );
}

