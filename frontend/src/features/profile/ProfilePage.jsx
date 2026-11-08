import { useEffect, useState } from 'react';
import { UserRound, MapPin, Pencil, FileText, Star, HeartHandshake, Mail, Phone, ShieldCheck, CalendarDays, ArrowRight, X, Save, Camera, Sparkles, LockKeyhole } from 'lucide-react';
import './ProfilePage.css';

const initialProfile = { name: 'Usuario GeoFastPe', email: '', phone: '', city: 'Arequipa', bio: 'Conectando con mi comunidad y ayudando a construir un mejor vecindario.', avatar: '' };

export default function ProfilePage({ user, isAuthenticated = false, onRequireLogin, onSaveProfile, stats, onNavigateActivity }) {
  const [profile, setProfile] = useState(initialProfile);
  const [draft, setDraft] = useState(initialProfile);
  const [editing, setEditing] = useState(false);
  const [notice, setNotice] = useState('');
  const [avatarPreview, setAvatarPreview] = useState('');
  useEffect(() => {
    if (!isAuthenticated) return;
    const next = {
      name: user?.name || user?.fullName || initialProfile.name,
      email: user?.email || '', phone: user?.phone || '',
      city: user?.city || initialProfile.city,
      bio: user?.bio || initialProfile.bio,
      avatar: user?.avatar || ''
    };
    setProfile(next);
    setAvatarPreview(next.avatar);
  }, [user?.name, user?.fullName, user?.email, user?.phone, user?.city, user?.bio, user?.avatar, isAuthenticated]);

  const openEdit = () => { setDraft(profile); setAvatarPreview(profile.avatar); setNotice(''); setEditing(true); };
  const update = (key, value) => setDraft(old => ({ ...old, [key]: value }));
  const chooseAvatar = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['image/png','image/jpeg','image/webp'].includes(file.type) || file.size > 3 * 1024 * 1024) {
      setNotice('Selecciona una imagen JPG, PNG o WEBP de máximo 3 MB.'); return;
    }
    const reader = new FileReader();
    reader.onload = () => { update('avatar', reader.result); setAvatarPreview(reader.result); };
    reader.readAsDataURL(file);
  };
  const save = async (event) => {
    event.preventDefault();
    if (!draft.name.trim()) { setNotice('El nombre es obligatorio.'); return; }
    const next = { ...draft, name: draft.name.trim(), city: draft.city.trim(), bio: draft.bio.trim() };
    try {
      if (onSaveProfile) await onSaveProfile(next);
      setProfile(next); setEditing(false);
      setNotice(onSaveProfile ? 'Perfil actualizado.' : 'Cambios guardados solo en esta sesión.');
    } catch { setNotice('No se pudieron guardar los cambios. Inténtalo nuevamente.'); }
  };
  if (!isAuthenticated) return (
    <section className="gfp-profile gfp-profile-locked">
      <div className="gfp-profile-lock-icon"><LockKeyhole size={30}/></div>
      <h2>Mi Perfil es privado</h2>
      <p>Inicia sesión para consultar y editar tu información comunitaria.</p>
      <button className="gfp-profile-primary" onClick={() => onRequireLogin?.()}>Iniciar sesión <ArrowRight size={17}/></button>
    </section>
  );
  const metrics = [
    { label: 'Publicaciones', value: stats?.publications ?? 0, icon: FileText, tone: 'violet' },
    { label: 'Reseñas', value: stats?.reviews ?? 0, icon: Star, tone: 'blue' },
    { label: 'Ayudas', value: stats?.helps ?? 0, icon: HeartHandshake, tone: 'pink' }
  ];
  return <main className="gfp-profile">
    <div className="gfp-profile-topline"><div><span className="gfp-profile-kicker"><Sparkles size={14}/> TU ESPACIO COMUNITARIO</span><h1>Mi Perfil</h1><p>Administra tu información y tu participación en GeoFastPe.</p></div><span className="gfp-profile-private"><ShieldCheck size={16}/> Cuenta personal</span></div>
    <section className="gfp-profile-hero">
      <div className="gfp-profile-cover"><span className="gfp-profile-cover-decoration one"/><span className="gfp-profile-cover-decoration two"/><span className="gfp-profile-cover-text">GeoFastPe <span>· Comunidad que conecta</span></span></div>
      <div className="gfp-profile-identity"><div className="gfp-profile-avatar">{profile.avatar ? <img src={profile.avatar} alt="Foto de perfil"/> : <UserRound size={40}/>}<span className="gfp-profile-avatar-dot"/></div><div className="gfp-profile-name"><h2>{profile.name}</h2><p><MapPin size={15}/>{profile.city || 'Ciudad no registrada'}</p></div><button className="gfp-profile-primary gfp-profile-edit" onClick={openEdit}><Pencil size={16}/> Editar perfil</button></div>
      <div className="gfp-profile-about"><p>{profile.bio}</p><span className="gfp-profile-member"><ShieldCheck size={16}/> Miembro de GeoFastPe</span></div>
    </section>
    <section className="gfp-profile-stats" aria-label="Estadísticas del perfil">{metrics.map(({label,value,icon:Icon,tone}) => <div className="gfp-profile-stat" key={label}><div className={`gfp-profile-stat-icon ${tone}`}><Icon size={23}/></div><div><strong>{value}</strong><span>{label}</span></div><ArrowRight size={17} className="gfp-profile-stat-arrow"/></div>)}</section>
    <div className="gfp-profile-bottom"><section className="gfp-profile-panel"><div className="gfp-profile-panel-heading"><h3>Información personal</h3><span>Datos de tu cuenta</span></div><div className="gfp-profile-info-grid"><Info icon={UserRound} label="Nombre completo" value={profile.name}/><Info icon={Mail} label="Correo electrónico" value={profile.email || 'No registrado'}/><Info icon={Phone} label="Teléfono" value={profile.phone || 'No registrado'}/><Info icon={MapPin} label="Ciudad" value={profile.city || 'No registrada'}/></div></section>
      <section className="gfp-profile-panel"><div className="gfp-profile-panel-heading"><h3>Mi actividad</h3><span>Participación comunitaria</span></div><div className="gfp-profile-activities">{[{label:'Mis publicaciones',icon:FileText,key:'publications'},{label:'Mis reseñas',icon:Star,key:'reviews'},{label:'Participación comunitaria',icon:HeartHandshake,key:'community'}].map(({label,icon:Icon,key})=><button key={key} type="button" className="gfp-profile-activity" onClick={()=>onNavigateActivity?.(key)} disabled={!onNavigateActivity}><Icon size={19}/><span>{label}</span>{onNavigateActivity && <ArrowRight size={16}/>}</button>)}</div><p className="gfp-profile-muted">El historial estará disponible al conectarlo con el backend.</p></section></div>
    {notice && <div className="gfp-profile-notice" role="status">{notice}<button onClick={()=>setNotice('')} aria-label="Cerrar aviso"><X size={14}/></button></div>}
    {editing && <div className="gfp-profile-modal-overlay" onMouseDown={e=>{if(e.target===e.currentTarget)setEditing(false)}}><div className="gfp-profile-modal" role="dialog" aria-modal="true" aria-labelledby="gfp-edit-title"><div className="gfp-profile-modal-head"><div><h2 id="gfp-edit-title">Editar mi perfil</h2><p>Personaliza tu información comunitaria</p></div><button className="gfp-profile-icon-button" onClick={()=>setEditing(false)} aria-label="Cerrar"><X size={20}/></button></div><form onSubmit={save}><div className="gfp-profile-avatar-edit"><div className="gfp-profile-avatar small">{avatarPreview?<img src={avatarPreview} alt="Vista previa"/>:<UserRound size={28}/>}</div><label className="gfp-profile-photo-button"><Camera size={16}/> Cambiar foto<input type="file" accept="image/png,image/jpeg,image/webp" onChange={chooseAvatar} hidden/></label><small>JPG, PNG o WEBP · máximo 3 MB</small></div><div className="gfp-profile-fields"><label>Nombre completo *<input value={draft.name} onChange={e=>update('name',e.target.value)} maxLength={80} required/></label><label>Correo electrónico<input type="email" value={draft.email} readOnly title="El correo se gestiona desde la cuenta"/><small>El correo no se modifica desde este formulario.</small></label><label>Teléfono<input type="tel" value={draft.phone} onChange={e=>update('phone',e.target.value)} maxLength={20} placeholder="Ej. 999 888 777"/></label><label>Ciudad<input value={draft.city} onChange={e=>update('city',e.target.value)} maxLength={80}/></label><label className="full">Sobre mí<textarea rows={3} maxLength={240} value={draft.bio} onChange={e=>update('bio',e.target.value)} placeholder="Cuéntale algo a tu comunidad"/><small>{draft.bio.length}/240</small></label></div>{notice && <p className="gfp-profile-form-alert">{notice}</p>}<div className="gfp-profile-modal-actions"><button type="button" className="gfp-profile-secondary" onClick={()=>setEditing(false)}>Cancelar</button><button className="gfp-profile-primary" type="submit"><Save size={16}/> Guardar cambios</button></div></form></div></div>}
  </main>;
}
function Info({icon:Icon,label,value}) {return <div className="gfp-profile-info"><span className="gfp-profile-info-icon"><Icon size={18}/></span><div><small>{label}</small><strong>{value}</strong></div></div>}
