const StatCard = ({ title, value, tone = 'primary', subtitle }) => (
  <div className={`stat-card stat-${tone}`}>
    <span>{title}</span>
    <strong>{value ?? 0}</strong>
    {subtitle && <small>{subtitle}</small>}
  </div>
);

export default StatCard;
