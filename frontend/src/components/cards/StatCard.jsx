import './StatCard.css'

function StatCard({
  title,
  value,
  color = 'green',
  icon,
  subtitle,
}) {

  return (

    <div className={`stat-card stat-card-${color}`}>

      <div className="stat-card-top">

        <div>

          <p className="stat-card-title">
            {title}
          </p>

          {subtitle && (
            <span className="stat-card-subtitle">
              {subtitle}
            </span>
          )}

        </div>

        {icon && (
          <div className="stat-card-icon">
            {icon}
          </div>
        )}

      </div>

      <div className="stat-card-value">
        {value}
      </div>

      <div className="stat-card-glow"></div>

    </div>
  )
}

export default StatCard