// src/components/ui/Empty.jsx

import './Empty.css'

function Empty({ message }) {

  return (
    <div className="empty-container">

      <div className="empty-icon">
        ⚾
      </div>

      <h2 className="empty-title">
        {message}
      </h2>

      <p className="empty-description">
        No hay información disponible en este momento.
      </p>

    </div>
  )
}

export default Empty