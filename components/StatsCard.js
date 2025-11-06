export default function StatsCard({ title, value, icon, loading = false }) {
  return (
    <div className={`stats-card ${loading ? 'loading' : ''}`}>
      <div className="stats-icon">
        {loading ? <div className="loading-spinner"></div> : icon}
      </div>
      <div className="stats-content">
        <h3 className="stats-value">
          {loading ? '--' : value}
        </h3>
        <p className="stats-title">{title}</p>
      </div>
    </div>
  );
}
