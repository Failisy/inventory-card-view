export function getRemainingBadgeColor(days) {
  const maxThreshold = 20;
  const d = parseFloat(days);
  if (isNaN(d)) return "#555";
  if (d <= 0) return "#FF0000"; // 0일 이하: 빨강
  if (d >= maxThreshold) return "#4CAF50"; // 20일 이상: 초록 (Material Design green)
  const ratio = d / maxThreshold; // 0~1 사이 값
  // 선형 보간: red (255,0,0) -> green (76,175,80)
  const r = Math.round((1 - ratio) * 255 + ratio * 76);
  const g = Math.round((1 - ratio) * 0   + ratio * 175);
  const b = Math.round((1 - ratio) * 0   + ratio * 80);
  return `rgb(${r}, ${g}, ${b})`;
}
