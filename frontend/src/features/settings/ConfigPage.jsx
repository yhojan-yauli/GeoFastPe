import { useState } from 'react';
import { Settings, LockKeyhole, Globe2, Moon, Sun, Volume2, Accessibility, Languages } from 'lucide-react';
import { useAuth } from '../auth/AuthContext.jsx';
import { authApi } from '../../api/index.js';
import PasswordInput from '../../components/common/PasswordInput.jsx';
import '../../components/common/PasswordInput.css';
import '../profile/ProfilePage.css';
import { usePreferences } from '../../preferences/PreferencesContext.jsx';

export default function ConfigPage({ onRequireLogin }) {
  const { isAuthenticated, logout } = useAuth();
  const { language, setLanguage, theme, setTheme, supportedLanguages, t } = usePreferences();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [message, setMessage] = useState(''); const [busy, setBusy] = useState(false);
  if (!isAuthenticated) return <section className="gfp-profile gfp-profile-locked"><div className="gfp-profile-lock-icon"><LockKeyhole size={30}/></div><h2>Configuración privada</h2><p>Inicia sesión para administrar tu cuenta.</p><button className="gfp-profile-primary" onClick={()=>onRequireLogin?.()}>Iniciar sesión</button></section>;
  const update=e=>{setForm(x=>({...x,[e.target.name]:e.target.value}));setMessage('');};
  const submit=async e=>{e.preventDefault();if(form.newPassword!==form.confirmPassword)return setMessage('Las contraseñas nuevas no coinciden.');try{setBusy(true);await authApi.cambiarPassword(form.currentPassword,form.newPassword);setForm({currentPassword:'',newPassword:'',confirmPassword:''});setMessage('Contraseña actualizada correctamente.');}catch(err){setMessage(err.message||'No se pudo cambiar la contraseña.');}finally{setBusy(false);}};
  return <main className="gfp-profile"><div className="gfp-profile-topline"><div><span className="gfp-profile-kicker"><Settings size={14}/> CONFIGURACIÓN</span><h1>Personalización y accesibilidad</h1><p>Haz GeoFastPe más cómodo para ti: idioma, tema, lectura por voz y seguridad.</p></div></div>
    <section className="gfp-profile-panel gf-preferences-panel"><div className="gfp-profile-panel-heading"><h3><Globe2 size={18}/> Idioma de la interfaz</h3><span>Los mensajes también pueden traducirse al idioma seleccionado.</span></div><div className="gf-pref-language">{supportedLanguages.map(([code,label])=><button key={code} className={language===code?'active':''} onClick={()=>setLanguage(code)}><Languages size={16}/>{label}</button>)}</div></section>
    <section className="gfp-profile-panel"><div className="gfp-profile-panel-heading"><h3><Moon size={18}/> Apariencia</h3><span>Personaliza el contraste visual de la aplicación.</span></div><div className="gf-pref-language"><button className={theme==='light'?'active':''} onClick={()=>setTheme('light')}><Sun size={16}/> Claro</button><button className={theme==='dark'?'active':''} onClick={()=>setTheme('dark')}><Moon size={16}/> Oscuro</button><button className={theme==='high-contrast'?'active':''} onClick={()=>setTheme('high-contrast')}><Accessibility size={16}/> Alto contraste</button></div></section>
    <section className="gfp-profile-panel"><div className="gfp-profile-panel-heading"><h3><Volume2 size={18}/> Herramientas de voz</h3><span>En Chrome y Edge puedes dictar búsquedas y mensajes y escuchar textos.</span></div><div className="gf-voice-info"><strong>Voz integrada</strong><p>Usa el micrófono del buscador para consultas como “eventos cerca” o “servicios de salud”. En los mensajes puedes dictar y reproducir cada mensaje.</p></div></section>
    <section className="gfp-profile-panel"><div className="gfp-profile-panel-heading"><h3>Cambiar contraseña</h3><span>Mínimo 8 caracteres, con letra, número y carácter especial</span></div><form onSubmit={submit} className="gfp-profile-fields"><PasswordInput label="Contraseña actual *" name="currentPassword" value={form.currentPassword} onChange={update} autoComplete="current-password" required/><PasswordInput label="Nueva contraseña *" name="newPassword" value={form.newPassword} onChange={update} autoComplete="new-password" minLength={8} required/><PasswordInput label="Confirmar nueva contraseña *" name="confirmPassword" value={form.confirmPassword} onChange={update} autoComplete="new-password" minLength={8} required/>{message&&<p className="gfp-profile-form-alert">{message}</p>}<div className="gfp-profile-modal-actions"><button className="gfp-profile-primary" type="submit" disabled={busy}>{busy?'Guardando...':'Actualizar contraseña'}</button><button className="gfp-profile-secondary" type="button" onClick={logout}>Cerrar sesión</button></div></form></section>
  </main>;
}
