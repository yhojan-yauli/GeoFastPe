
import { useAuth } from '../../features/auth/AuthContext.jsx';
import { canAccessSection } from '../../features/auth/permissions.js';

const navigation = [
  ['Inicio', '⌂', 'Todos'],
  ['Servicios', '▣', 'Servicios'],
  ['Solidaridad', '♡', 'Solidaridad'],
  ['Emergencias', '⚑', 'Emergencia'],
  ['Reportes', '▤', 'Reportes'],
  ['Eventos', '▦', 'Eventos'],
  ['Mensajes', '✉', 'Mensajes'],
  ['Mi Perfil', '♙', 'Mi Perfil'],
  ['Configuración', '⚙', 'Configuración']
];

export default function Sidebar({
  section,
  onSelectSection,
  onRequireLogin
}) {
  const { isAuthenticated } = useAuth();

const handleNavigation = (name, category) => {
  // Servicios es una sección pública del mapa.
  // Las secciones privadas siguen protegidas.
  if (
    name !== 'Servicios' &&
    !canAccessSection(name, isAuthenticated)
  ) {
    onRequireLogin(name);
    return;
  }

  onSelectSection(name, category);
};

  return (
    <aside className="left-sidebar">

      <div className="brand">
        <span className="brand-mark">G</span>

        <span>
          GeoFast<span>Pe</span>
        </span>
      </div>

      <div className="nav-caption">
        MENÚ PRINCIPAL
      </div>

      <nav>
        {navigation.map(([name, icon, category]) => (
          <button
            key={name}
            type="button"
            className={`nav-item ${
              section === name ? 'selected' : ''
            }`}
            onClick={() => {
              handleNavigation(name, category);
            }}
          >
            <span className="nav-icon">
              {icon}
            </span>

            <span>{name}</span>

            {section === name && (
              <span className="nav-active" />
            )}
          </button>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="avatar">GF</div>

        <div>
          <strong>GeoFastPe</strong>
          <small>Plataforma comunitaria</small>
        </div>
      </div>

    </aside>
  );
}
