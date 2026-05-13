// src/components/ui/Button.jsx

import './Button.css'

function Button({
  children,
  onClick,
  type = 'button',
  className = '',
  disabled = false,
}) {

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`custom-button ${className}`}
    >
      <span className="custom-button-text">
        {children}
      </span>
    </button>
  )
}

export default Button