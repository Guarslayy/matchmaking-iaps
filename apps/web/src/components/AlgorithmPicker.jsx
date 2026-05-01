import { algorithms } from '../algorithms.js';

export function AlgorithmPicker({ selectedAlgorithm, onSelect }) {
  return (
    <div className="algorithm-picker" role="tablist" aria-label="Algorithm">
      {algorithms.map((algorithm) => (
        <button
          key={algorithm.id}
          className={`algorithm-option ${selectedAlgorithm === algorithm.id ? 'active' : ''}`}
          onClick={() => onSelect(algorithm.id)}
          style={{ '--accent': algorithm.accent }}
          type="button"
        >
          <i />
          <span>{algorithm.name}</span>
          <small>{algorithm.focus}</small>
        </button>
      ))}
    </div>
  );
}
