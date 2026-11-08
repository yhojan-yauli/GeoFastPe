import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

// Campo de contraseña con botón de ojo para mostrar u ocultar el texto.
export default function PasswordInput({ label, ...inputProps }) {
  const [visible, setVisible] = useState(false);

  return (
    <label className="password-input-field">
      {label}
      <span className="password-input-wrap">
        <input {...inputProps} type={visible ? 'text' : 'password'} />
        <button
          type="button"
          className="password-input-eye"
          onClick={() => setVisible((value) => !value)}
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          title={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </span>
    </label>
  );
}
