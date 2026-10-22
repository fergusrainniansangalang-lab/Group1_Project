export const generateId = () => {
  return Date.now().toString() + Math.random().toString(36).substring(2, 9);
};

// Formats a task's start/end timestamps into a short duration label,
// e.g. "Sep 24, 09:00 AM - 05:00 PM" or, across days,
// "Sep 24, 09:00 AM - Sep 25, 05:00 PM".
export const formatTaskDuration = (startTimestamp, endTimestamp) => {
  const start = new Date(startTimestamp);
  const end = new Date(endTimestamp);

  const formatTime = (d) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formatDate = (d) => d.toLocaleDateString([], { month: 'short', day: 'numeric' });

  const sameDay = start.toDateString() === end.toDateString();

  if (sameDay) {
    return `${formatDate(start)}, ${formatTime(start)} - ${formatTime(end)}`;
  }

  return `${formatDate(start)} ${formatTime(start)} - ${formatDate(end)} ${formatTime(end)}`;
};
