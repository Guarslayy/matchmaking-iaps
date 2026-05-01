export const algorithms = [
  {
    id: 'baseline',
    name: 'Baseline',
    shortName: 'Base',
    accent: '#2563eb',
    focus: 'Best rating proximity',
    formula: 'min |eloA - eloB|',
  },
  {
    id: 'greedy',
    name: 'Greedy',
    shortName: 'Greedy',
    accent: '#059669',
    focus: 'Fast queue service',
    formula: 'oldest player + closest valid opponent',
  },
  {
    id: 'batch_lite',
    name: 'Batch Lite',
    shortName: 'Batch',
    accent: '#d97706',
    focus: 'Batch-local pairing',
    formula: 'sort batch by ELO, pair neighbours',
  },
  {
    id: 'hybrid_weighted',
    name: 'Hybrid Weighted',
    shortName: 'Hybrid',
    accent: '#be185d',
    focus: 'Rating + wait-time score',
    formula: '0.7 rating + 0.3 wait',
  },
];

export function getAlgorithm(id) {
  return algorithms.find((algorithm) => algorithm.id === id) ?? algorithms[0];
}
