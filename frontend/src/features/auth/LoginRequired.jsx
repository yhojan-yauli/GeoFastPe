import './LoginRequired.css';

export default function LoginRequired({ onClose, onLogin, onRegister }) {
  return (
    <div className="login-required-overlay" role="dialog" aria-modal="true" aria-labelledby="login-required-title">
      <div className="login-required-card gf-join-card">
        <button type="button" className="gf-join-close" onClick={onClose} aria-label="Cerrar ventana">×</button>
        <div className="gf-join-logo" aria-hidden="true">G</div>
        <h2 id="login-required-title" className="gf-join-title">Únete a GeoFastPe</h2>
        <p className="gf-join-description">Inicia sesión o crea una cuenta para publicar servicios, reportar emergencias y conectar con tu comunidad.</p>
        <div className="gf-join-actions">
          <button type="button" className="gf-join-button gf-join-primary" onClick={onLogin}>Iniciar sesión</button>
          <button type="button" className="gf-join-button gf-join-secondary" onClick={onRegister}>Crear cuenta</button>
        </div>
        <button type="button" className="gf-join-explore" onClick={onClose}>Seguir explorando el mapa</button>
      </div>
    </div>
  );
}
