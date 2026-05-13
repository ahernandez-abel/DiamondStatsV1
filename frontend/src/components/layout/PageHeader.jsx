import './PageHeader.css'

function PageHeader({ title, subtitle }) {

  return (

    <div className="page-header">

      <div className="page-header-content">

        <span className="page-header-badge">
          DiamondStats
        </span>

        <h1 className="page-header-title">
          {title}
        </h1>

        {subtitle && (
          <p className="page-header-subtitle">
            {subtitle}
          </p>
        )}

      </div>

      <div className="page-header-glow"></div>

    </div>
  )
}

export default PageHeader