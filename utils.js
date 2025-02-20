export function getRemainingBadgeColor(days) {
  const maxThreshold = 7;  // 7일 기준
  const d = parseFloat(days);
  if (isNaN(d)) return "#555";
  if (d <= 0) return "#FF0000";  // 0 이하 -> 빨강
  if (d >= maxThreshold) return "#4CAF50";  // 7 이상 -> 초록
  const ratio = d / maxThreshold; // 0 ~ 1 사이
  // 빨강(255, 0, 0) -> 초록(76, 175, 80) 선형 보간
  const r = Math.round((1 - ratio) * 255 + ratio * 76);
  const g = Math.round((1 - ratio) * 0   + ratio * 175);
  const b = Math.round((1 - ratio) * 0   + ratio * 80);
  return `rgb(${r}, ${g}, ${b})`;
}
