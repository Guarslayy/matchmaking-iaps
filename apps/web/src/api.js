const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

export async function apiRequest(path, options = {}) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
}

export function fetchDashboardData() {
  return Promise.all([
    apiRequest('/players'),
    apiRequest('/simulation/rounds?limit=24'),
  ]).then(([players, rounds]) => ({ players, rounds }));
}

export function seedDemoData() {
  return apiRequest('/demo/seed', { method: 'POST', body: '{}' });
}

export function runSimulationRound(algorithmId) {
  return apiRequest('/simulation/round', {
    method: 'POST',
    body: JSON.stringify({ algorithm: algorithmId, alpha: 0.7, beta: 0.3 }),
  });
}

export function runAlgorithmComparison() {
  return apiRequest('/simulation/compare', { method: 'POST', body: '{}' });
}
