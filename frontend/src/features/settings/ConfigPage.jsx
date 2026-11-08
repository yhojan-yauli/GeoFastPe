import { useState } from 'react';
import { Settings, LockKeyhole } from 'lucide-react';
import { useAuth } from '../auth/AuthContext.jsx';
import { authApi } from '../../api/index.js';
import PasswordInput from '../../components/common/PasswordInput.jsx';
import '../../components/common/PasswordInput.css';
import '../profile/ProfilePage.css';

export default function ConfigPage({ onRequireLogin }) {
  const { isAuthenticated, logout } = useAuth();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  if (!isAuthenticated) {
    return (
      <section className="gfp-profile gfp-profile-locked">
        <div className="gfp-profile-lock-icon"><LockKeyhole size={30}/></div>
        <h2>Configuración privada</h2>
        <p>Inicia sesión para administrar tu cuenta.</p>
        <button className="gfp-profile-primary" onClick={() => onRequireLogin?.()}>Iniciar sesión</button>
      </section>
    );
  }

  const update = (e) => {
    setForm((old) => ({ ...old, [e.target.name]: e.target.value }));
    setMessage('');
  };

  const submit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      setMessage('Las contraseñas nuevas no coinciden.');
      return;
    }

    try {
      setBusy(true);
      await authApi.cambiarPassword(form.currentPassword, form.newPassword);
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setMessage('Contraseña actualizada correctamente.');
    } catch (error) {
      setMessage(error.message || 'No se pudo cambiar la contraseña.');
    } finally {
      setBusy(false);
    }
  };

  return <main className="gfp-profile">
    <div className="gfp-profile-topline">
      <div>
        <span className="gfp-profile-kicker"><Settings size={14}/> CONFIGURACIÓN</span>
        <h1>Cuenta y seguridad</h1>
        <p>Cambia tu contraseña o cierra tu sesión en este dispositivo.</p>
      </div>
    </div>

    <section className="gfp-profile-panel">
      <div className="gfp-profile-panel-heading"><h3>Cambiar contraseña</h3><span>Mínimo 8 caracteres, con letra, número y carácter especial</span></div>
      <form onSubmit={submit} className="gfp-profile-fields">
        <PasswordInput label="Contraseña actual *" name="currentPassword" value={form.currentPassword} onChange={update} autoComplete="current-password" required />
        <PasswordInput label="Nueva contraseña *" name="newPassword" value={form.newPassword} onChange={update} autoComplete="new-password" minLength={8} required />
        <PasswordInput label="Confirmar nueva contraseña *" name="confirmPassword" value={form.confirmPassword} onChange={update} autoComplete="new-password" minLength={8} required />
        {message && <p className="gfp-profile-form-alert">{message}</p>}
        <div className="gfp-profile-modal-actions">
          <button className="gfp-profile-primary" type="submit" disabled={busy}>{busy ? 'Guardando...' : 'Actualizar contraseña'}</button>
          <button className="gfp-profile-secondary" type="button" onClick={logout}>Cerrar sesión</button>
        </div>
      </form>
    </section>
  </main>;
}
