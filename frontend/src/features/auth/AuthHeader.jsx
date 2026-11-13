import { useAuth } from './AuthContext.jsx';
import { usePreferences } from '../../preferences/PreferencesContext.jsx';

export default function AuthHeader({
  onLogin,
  onRegister
}) {
  const { isAuthenticated, user, logout } = useAuth();
  const { tr } = usePreferences();

  return (
    <div className="auth-header">
      {isAuthenticated ? (
        <div className="auth-account">
          <div className="auth-account-avatar">
            {(user?.name || 'U').charAt(0).toUpperCase()}
          </div>

          <div className="auth-account-info">
            <strong>{user?.name || tr('Mi cuenta')}</strong>

            <button type="button" onClick={logout}>
              {tr('Cerrar sesión')}
            </button>
          </div>
        </div>
      ) : (
        <div className="auth-header-actions">
          <button
            type="button"
            className="auth-header-login"
            onClick={onLogin}
          >
            {tr('Iniciar sesión')}
          </button>

          <button
            type="button"
            className="auth-header-register"
            onClick={onRegister}
          >
            {tr('Crear cuenta')}
          </button>
        </div>
      )}
    </div>
  );
}
