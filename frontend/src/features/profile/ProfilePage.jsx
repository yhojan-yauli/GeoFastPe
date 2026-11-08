import { useEffect, useState } from 'react';
import { UserRound, MapPin, Pencil, FileText, HeartHandshake, CalendarDays, Mail, Phone, ShieldCheck, ArrowRight, X, Save, Camera, Sparkles, LockKeyhole } from 'lucide-react';
import { useAuth } from '../auth/AuthContext.jsx';
import { filesApi, usersApi } from '../../api/index.js';
import './ProfilePage.css';

export default function ProfilePage({ onRequireLogin }) {
  const { user, isAuthenticated, updateProfile } = useAuth();
  const [stats, setStats] = useState({ publications: 0, helps: 0, events: 0 });
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ name: '', phone: '', city: '', bio: '', avatar: '' });
  const [avatarFile, setAvatarFile] = useState(null);
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    usersApi.estadisticas().then(setStats).catch(() => {});
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <section className="gfp-profile gfp-profile-locked">
        <div className="gfp-profile-lock-icon"><LockKeyhole size={30}/></div>
        <h2>Mi Perfil es privado</h2>
        <p>Inicia sesión para consultar y editar tu información comunitaria.</p>
        <button className="gfp-profile-primary" onClick={() => onRequireLogin?.()}>Iniciar sesión <ArrowRight size={17}/></button>
      </section>
    );
  }

  const openEdit = () => {
    setDraft({
      name: user.name || '',
      phone: user.phone || '',
      city: user.city || '',
      bio: user.bio || '',
      avatar: user.avatar || ''
    });
    setAvatarFile(null);
    setNotice('');
    setEditing(true);
  };

  const update = (key, value) => setDraft((old) => ({ ...old, [key]: value }));

  const chooseAvatar = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 3 * 1024 * 1024) {
      setNotice('Selecciona una imagen JPG, PNG o WEBP de máximo 3 MB.');
      return;
    }
    setAvatarFile(file);
    setDraft((old) => ({ ...old, avatar: URL.createObjectURL(file) }));
  };

  const save = async (event) => {
    event.preventDefault();
    if (!draft.name.trim()) {
      setNotice('El nombre es obligatorio.');
      return;
    }

    try {
      setBusy(true);
      const avatarUrl = avatarFile ? await filesApi.resolverImagen(avatarFile) : user.avatar || null;
      await updateProfile({
        name: draft.name.trim(),
        phone: draft.phone.trim(),
        city: draft.city.trim(),
        bio: draft.bio.trim(),
        avatar: avatarUrl
      });
      setEditing(false);
      setNotice('');
    } catch (error) {
      setNotice(error.message || 'No se pudieron guardar los cambios.');
    } finally {
      setBusy(false);
    }
  };

  const metrics = [
    { label: 'Publicaciones', value: stats.publications, icon: FileText, tone: 'violet' },
    { label: 'Donaciones', value: stats.helps, icon: HeartHandshake, tone: 'pink' },
    { label: 'Eventos', value: stats.events, icon: CalendarDays, tone: 'blue' }
  ];

  return <main className="gfp-profile">
    <div className="gfp-profile-topline">
      <div>
        <span className="gfp-profile-kicker"><Sparkles size={14}/> TU ESPACIO COMUNITARIO</span>
        <h1>Mi Perfil</h1>
        <p>Administra tu información y tu participación en GeoFastPe.</p>
      </div>
      <span className="gfp-profile-private"><ShieldCheck size={16}/> Cuenta personal</span>
    </div>

    <section className="gfp-profile-hero">
      <div className="gfp-profile-cover"><span className="gfp-profile-cover-decoration one"/><span className="gfp-profile-cover-decoration two"/><span className="gfp-profile-cover-text">GeoFastPe <span>· Comunidad que conecta</span></span></div>
      <div className="gfp-profile-identity">
        <div className="gfp-profile-avatar">{user.avatar ? <img src={user.avatar} alt="Foto de perfil"/> : <UserRound size={40}/>}<span className="gfp-profile-avatar-dot"/></div>
        <div className="gfp-profile-name"><h2>{user.name}</h2><p><MapPin size={15}/>{user.city || 'Ciudad no registrada'}</p></div>
        <button className="gfp-profile-primary gfp-profile-edit" onClick={openEdit}><Pencil size={16}/> Editar perfil</button>
      </div>
      <div className="gfp-profile-about"><p>{user.bio || 'Aún no has escrito una descripción.'}</p><span className="gfp-profile-member"><ShieldCheck size={16}/> Miembro de GeoFastPe</span></div>
    </section>

    <section className="gfp-profile-stats" aria-label="Estadísticas del perfil">
      {metrics.map(({ label, value, icon: Icon, tone }) => <div className="gfp-profile-stat" key={label}>
        <div className={`gfp-profile-stat-icon ${tone}`}><Icon size={23}/></div>
        <div><strong>{value}</strong><span>{label}</span></div>
      </div>)}
    </section>

    <div className="gfp-profile-bottom">
      <section className="gfp-profile-panel">
        <div className="gfp-profile-panel-heading"><h3>Información personal</h3><span>Datos de tu cuenta</span></div>
        <div className="gfp-profile-info-grid">
          <Info icon={UserRound} label="Nombre completo" value={user.name}/>
          <Info icon={Mail} label="Correo electrónico" value={user.email || 'No registrado'}/>
          <Info icon={Phone} label="Teléfono" value={user.phone || 'No registrado'}/>
          <Info icon={MapPin} label="Ciudad" value={user.city || 'No registrada'}/>
        </div>
      </section>
    </div>

    {notice && !editing && <div className="gfp-profile-notice" role="status">{notice}<button onClick={() => setNotice('')} aria-label="Cerrar aviso"><X size={14}/></button></div>}

    {editing && <div className="gfp-profile-modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) setEditing(false); }}>
      <div className="gfp-profile-modal" role="dialog" aria-modal="true" aria-labelledby="gfp-edit-title">
        <div className="gfp-profile-modal-head">
          <div><h2 id="gfp-edit-title">Editar mi perfil</h2><p>Personaliza tu información comunitaria</p></div>
          <button className="gfp-profile-icon-button" onClick={() => setEditing(false)} aria-label="Cerrar"><X size={20}/></button>
        </div>
        <form onSubmit={save}>
          <div className="gfp-profile-avatar-edit">
            <div className="gfp-profile-avatar small">{draft.avatar ? <img src={draft.avatar} alt="Vista previa"/> : <UserRound size={28}/>}</div>
            <label className="gfp-profile-photo-button"><Camera size={16}/> Cambiar foto<input type="file" accept="image/png,image/jpeg,image/webp" onChange={chooseAvatar} hidden/></label>
            <small>JPG, PNG o WEBP · máximo 3 MB</small>
          </div>
          <div className="gfp-profile-fields">
            <label>Nombre completo *<input value={draft.name} onChange={(e) => update('name', e.target.value)} maxLength={120} required/></label>
            <label>Correo electrónico<input type="email" value={user.email || ''} readOnly title="El correo se gestiona desde la cuenta"/><small>El correo no se modifica desde este formulario.</small></label>
            <label>Teléfono<input type="tel" value={draft.phone} onChange={(e) => update('phone', e.target.value)} maxLength={20} placeholder="Ej. 987654321"/></label>
            <label>Ciudad<input value={draft.city} onChange={(e) => update('city', e.target.value)} maxLength={80}/></label>
            <label className="full">Sobre mí<textarea rows={3} maxLength={240} value={draft.bio} onChange={(e) => update('bio', e.target.value)} placeholder="Cuéntale algo a tu comunidad"/><small>{draft.bio.length}/240</small></label>
          </div>
          {notice && <p className="gfp-profile-form-alert">{notice}</p>}
          <div className="gfp-profile-modal-actions">
            <button type="button" className="gfp-profile-secondary" onClick={() => setEditing(false)} disabled={busy}>Cancelar</button>
            <button className="gfp-profile-primary" type="submit" disabled={busy}><Save size={16}/> {busy ? 'Guardando...' : 'Guardar cambios'}</button>
          </div>
        </form>
      </div>
    </div>}
  </main>;
}

function Info({ icon: Icon, label, value }) {
  return <div className="gfp-profile-info"><span className="gfp-profile-info-icon"><Icon size={18}/></span><div><small>{label}</small><strong>{value}</strong></div></div>;
}
