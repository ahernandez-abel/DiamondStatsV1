// src/components/ui/Input.jsx

import './Input.css'

function Input({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  required = false,
}) {

  return (
    <div className="custom-input-group">

      {label && (
        <label className="custom-input-label">
          {label}
        </label>
      )}

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="custom-input"
      />

    </div>
  )
}

export default Input