export function getRemainingColor(days) {
  const maxThreshold = 20;
  const d = parseFloat(days);
  if (isNaN(d)) return "#555";
  if (d <= 0) return "#FF0000";
  if (d >= maxThreshold) return "#555";
  const r = 255 + (85 - 255) * (d / maxThreshold);
  const g = 0 + (85 - 0) * (d / maxThreshold);
  const b = 0 + (85 - 0) * (d / maxThreshold);
  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
}
