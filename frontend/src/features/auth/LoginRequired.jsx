export default function LoginRequired({
  onClose,
  onLogin,
  onRegister
}) {
  return (
    <div
      className="login-required-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-required-title"
    >
      <div className="login-required-card">
        <button
          type="button"
          className="auth-close"
          onClick={onClose}
          aria-label="Cerrar"
        >
          ×
        </button>

        <div className="auth-logo">G</div>

        <h2 id="login-required-title">
          Únete a GeoFastPe
        </h2>

        <p>
          Inicia sesión o crea una cuenta para
          publicar servicios, reportar emergencias
          y conectar con tu comunidad.
        </p>

        <div className="auth-actions">
          <button
            type="button"
            className="auth-login-btn"
            onClick={onLogin}
          >
            Iniciar sesión
          </button>

          <button
            type="button"
            className="auth-register-btn"
            onClick={onRegister}
          >
            Crear cuenta
          </button>
        </div>

        <button
          type="button"
          className="auth-explore"
          onClick={onClose}
        >
          Seguir explorando el mapa
        </button>
      </div>
    </div>
  );
}
