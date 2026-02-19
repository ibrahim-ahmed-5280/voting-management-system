export const formatDate = (value) =>
  value ? new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "-";

export const formatDateRange = (start, end) => `${formatDate(start)} - ${formatDate(end)}`;

export const formatPercent = (value, total) => {
  if (!total) return "0%";
  return `${((value / total) * 100).toFixed(1)}%`;
};

