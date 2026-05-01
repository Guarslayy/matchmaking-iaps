export function MetricCard({ label, value, detail, tone = 'neutral' }) {
  return (
    <div className={`metric-card metric-card-${tone} card border-0`}>
      <span className="text-uppercase">{label}</span>
      <strong>{value}</strong>
      {detail ? <small>{detail}</small> : null}
    </div>
  );
}
