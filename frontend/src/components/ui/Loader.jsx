// src/components/ui/Loader.jsx

import './Loader.css'

function Loader() {

  return (
    <div className="loader-container">

      <div className="loader-spinner"></div>

      <h3 className="loader-title">
        Cargando información
      </h3>

      <p className="loader-text">
        Espere un momento...
      </p>

    </div>
  )
}

export default Loader