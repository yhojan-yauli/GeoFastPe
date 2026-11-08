import { useEffect, useState } from 'react';
import { Check, Circle, Eye, EyeOff, KeyRound, Lock, Mail, UserPlus, UserRound, X } from 'lucide-react';
import { useAuth } from './AuthContext.jsx';
import './AuthModal.css';

const initialForm = { name: '', email: '', password: '', confirmPassword: '' };

export default function AuthModal({ mode = 'login', onClose, onAuthenticated }) {
  const { login, register } = useAuth();
  const [currentMode, setCurrentMode] = useState(mode);
  const [form, setForm] = useState(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const isRegister = currentMode === 'register';
  const hasLength = form.password.length >= 8;
  const hasLetterNumber = /[A-Za-z]/.test(form.password) && /\d/.test(form.password);
  const hasSpecial = /[^A-Za-z\d]/.test(form.password);

  useEffect(() => {
    setCurrentMode(mode);
    setMessage('');
  }, [mode]);

  useEffect(() => {
    const onKeyDown = (event) => { if (event.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const changeMode = () => {
    setCurrentMode(isRegister ? 'login' : 'register');
    setMessage('');
    setShowPassword(false);
    setShowConfirm(false);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
    setMessage('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (busy) return;

    if (isRegister) {
      if (!hasLength || !hasLetterNumber || !hasSpecial) {
        setMessage('Tu contraseña debe cumplir los tres requisitos de seguridad.');
        return;
      }
      if (form.password !== form.confirmPassword) {
        setMessage('Las contraseñas no coinciden.');
        return;
      }
      if (!acceptedTerms) {
        setMessage('Debes aceptar los términos y la política de privacidad.');
        return;
      }
    }

    setBusy(true);
    setMessage('');
    try {
      if (isRegister) {
        await register({ name: form.name.trim(), email: form.email.trim(), password: form.password });
      } else {
        await login(form.email.trim(), form.password);
      }
      onAuthenticated?.();
    } catch (error) {
      setMessage(error.message || 'No se pudo completar la operación.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-required-overlay gf-auth-overlay" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose?.();
    }}>
      <section className="login-required-card gf-auth-card" role="dialog" aria-modal="true" aria-labelledby="auth-modal-title">
        <button className="auth-close gf-auth-close" type="button" onClick={onClose} aria-label="Cerrar ventana"><X size={18} /></button>
        <div className="gf-auth-brand"><span className="gf-auth-brand-mark">G</span><span>Geo<span>Fast</span>Pe</span></div>
        <div className="gf-auth-symbol" aria-hidden="true">{isRegister ? <UserPlus size={34} /> : <KeyRound size={34} />}</div>
        <h2 id="auth-modal-title">{isRegister ? 'Registrarse' : 'Iniciar sesión'}</h2>
        <p className="gf-auth-subtitle">{isRegister ? 'Crea tu cuenta en GeoFastPe.' : 'Bienvenido de nuevo a tu comunidad.'}</p>

        <form className="auth-form gf-auth-form" onSubmit={handleSubmit}>
          {isRegister && (
            <label className="gf-auth-field">
              <span className="gf-auth-field-icon" aria-hidden="true"><UserRound size={18} /></span>
              <input name="name" type="text" placeholder="Nombre completo" aria-label="Nombre completo" autoComplete="name" value={form.name} onChange={handleChange} required minLength={2} maxLength={120} />
            </label>
          )}
          <label className="gf-auth-field">
            <span className="gf-auth-field-icon" aria-hidden="true"><Mail size={18} /></span>
            <input name="email" type="email" placeholder="Correo electrónico" aria-label="Correo electrónico" autoComplete="email" value={form.email} onChange={handleChange} required />
          </label>
          <label className="gf-auth-field">
            <span className="gf-auth-field-icon" aria-hidden="true"><Lock size={18} /></span>
            <input name="password" type={showPassword ? 'text' : 'password'} placeholder="Contraseña" aria-label="Contraseña" autoComplete={isRegister ? 'new-password' : 'current-password'} value={form.password} onChange={handleChange} minLength={8} required />
            <button className="gf-auth-eye" type="button" aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
          </label>
          {isRegister && (
            <>
              <label className="gf-auth-field">
                <span className="gf-auth-field-icon" aria-hidden="true"><Lock size={18} /></span>
                <input name="confirmPassword" type={showConfirm ? 'text' : 'password'} placeholder="Confirmar contraseña" aria-label="Confirmar contraseña" autoComplete="new-password" value={form.confirmPassword} onChange={handleChange} required />
                <button className="gf-auth-eye" type="button" aria-label={showConfirm ? 'Ocultar confirmación' : 'Mostrar confirmación'} onClick={() => setShowConfirm(!showConfirm)}>{showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}</button>
              </label>
              <div className="gf-auth-checklist" aria-label="Requisitos de contraseña">
                <strong>Tu contraseña debe tener:</strong>
                <span className={hasLength ? 'valid' : ''}>{hasLength ? <Check size={14} /> : <Circle size={14} />} Mínimo 8 caracteres</span>
                <span className={hasLetterNumber ? 'valid' : ''}>{hasLetterNumber ? <Check size={14} /> : <Circle size={14} />} Al menos una letra y un número</span>
                <span className={hasSpecial ? 'valid' : ''}>{hasSpecial ? <Check size={14} /> : <Circle size={14} />} Un carácter especial</span>
              </div>
              <label className="gf-auth-checkbox gf-auth-terms"><input type="checkbox" checked={acceptedTerms} onChange={(event) => setAcceptedTerms(event.target.checked)} /> Acepto los Términos y Condiciones y la Política de Privacidad.</label>
            </>
          )}
          {message && <p className="gf-auth-message" role="status">{message}</p>}
          <button type="submit" className="auth-login-btn gf-auth-submit" disabled={busy}>
            {busy ? 'Procesando...' : isRegister ? 'Crear cuenta' : 'Iniciar sesión'}
          </button>
        </form>

        <div className="gf-auth-footer">
          <span>{isRegister ? '¿Ya tienes una cuenta?' : '¿Aún no tienes una cuenta?'}</span>{' '}
          <button type="button" className="auth-explore gf-auth-link" onClick={changeMode}>{isRegister ? 'Iniciar sesión' : 'Regístrate'}</button>
        </div>
      </section>
    </div>
  );
}
