
import { useState } from 'react';
import { useAuth } from './AuthContext.jsx';

export default function AuthModal({
  mode,
  onClose,
  onDemoLogin
}) {
  const { login } = useAuth();

  const [currentMode, setCurrentMode] = useState(mode);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: ''
  });

  const isRegister = currentMode === 'register';

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    alert(
      'La autenticación real estará disponible cuando conectemos el backend. Por ahora puedes utilizar el modo demostración.'
    );
  };

  // Acceso temporal para probar el frontend
  const enterDemoMode = () => {
    const demoUser = {
      id: 'demo-user',
      name: 'Usuario Demo',
      email: 'demo@geofastpe.local',
      role: 'user',
      isDemo: true
    };

    login(demoUser);

    if (onDemoLogin) {
      onDemoLogin();
    } else {
      onClose();
    }
  };

  return (
    <div
      className="login-required-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="login-required-card">

        <button
          className="auth-close"
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
        >
          ×
        </button>

        <div className="auth-logo">G</div>

        <h2 id="auth-modal-title">
          {isRegister ? 'Crear cuenta' : 'Iniciar sesión'}
        </h2>

        <p>
          {isRegister
            ? 'Regístrate para participar en tu comunidad.'
            : 'Bienvenido de nuevo a GeoFastPe.'}
        </p>

        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >
          {isRegister && (
            <input
              name="name"
              type="text"
              placeholder="Nombre completo"
              autoComplete="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          )}

          <input
            name="email"
            type="email"
            placeholder="Correo electrónico"
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
            required
          />

          <input
            name="password"
            type="password"
            placeholder="Contraseña"
            autoComplete={
              isRegister
                ? 'new-password'
                : 'current-password'
            }
            value={form.password}
            onChange={handleChange}
            minLength={8}
            required
          />

          <button
            type="submit"
            className="auth-login-btn"
          >
            {isRegister
              ? 'Crear mi cuenta'
              : 'Ingresar'}
          </button>
        </form>

        <button
          type="button"
          className="auth-explore"
          onClick={() => {
            setCurrentMode(
              isRegister ? 'login' : 'register'
            );
          }}
        >
          {isRegister
            ? '¿Ya tienes cuenta? Inicia sesión'
            : '¿No tienes cuenta? Regístrate'}
        </button>

        <div className="auth-demo-section">
          <div className="auth-demo-divider">
            <span>O continúa sin backend</span>
          </div>

          <button
            type="button"
            className="auth-demo-button"
            onClick={enterDemoMode}
          >
            Entrar en modo demostración
          </button>

          <small>
            Acceso temporal para probar las funciones
            del frontend. No crea una cuenta real.
          </small>
        </div>

      </div>
    </div>
  );
}
