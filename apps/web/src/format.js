export function formatNumber(value, digits = 2) {
  return Number(value ?? 0).toFixed(digits);
}

export function formatPercent(value) {
  return `${Math.round((value ?? 0) * 100)}%`;
}

export function eloDelta(before, after) {
  const delta = after - before;
  return `${delta >= 0 ? '+' : ''}${delta}`;
}

export function clampPercent(value) {
  return Math.max(0, Math.min(100, value));
}
