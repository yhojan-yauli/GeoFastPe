
import { useAuth } from '../../features/auth/AuthContext.jsx';
import { canAccessSection } from '../../features/auth/permissions.js';

import {
  House,
  MapPinned,
  BriefcaseBusiness,
  ShoppingCart,
  HeartHandshake,
  Siren,
  Flag,
  CalendarDays,
  MessageCircle,
  UserRound,
  Settings
} from 'lucide-react';

// ==========================================
// MENÚ DE NAVEGACIÓN
// ==========================================
const menuItems = [
  {
    label: 'Inicio',
    icon: House,
    path: '/',
    category: 'Todos'
  },
  {
    label: 'Mapa Vecinal',
    icon: MapPinned,
    path: '/mapa',
    category: 'Todos'
  },
  {
    label: 'Servicios',
    icon: BriefcaseBusiness,
    path: '/servicios',
    category: 'Servicios'
  },
  {
    label: 'Ventas',
    icon: ShoppingCart,
    path: '/ventas',
    category: 'Ventas'
  },
  {
    label: 'Solidaridad',
    icon: HeartHandshake,
    path: '/solidaridad',
    category: 'Solidaridad'
  },
  {
    label: 'Emergencias (SOS)',
    icon: Siren,
    path: '/emergencias',
    category: 'Emergencia'
  },
  {
    label: 'Reportes',
    icon: Flag,
    path: '/reportes',
    category: 'Reportes'
  },
  {
    label: 'Eventos',
    icon: CalendarDays,
    path: '/eventos',
    category: 'Eventos'
  },
  {
    label: 'Mensajes',
    icon: MessageCircle,
    path: '/mensajes',
    category: 'Mensajes'
  },
  {
    label: 'Mi Perfil',
    icon: UserRound,
    path: '/perfil',
    category: 'Mi Perfil'
  },
  {
    label: 'Configuración',
    icon: Settings,
    path: '/configuracion',
    category: 'Configuración'
  }
];

// ==========================================
// COMPONENTE SIDEBAR
// ==========================================
export default function Sidebar({
  section,
  onSelectSection,
  onRequireLogin
}) {
  const { isAuthenticated } = useAuth();

  // ==========================================
  // CONTROL DE NAVEGACIÓN
  // ==========================================
  const handleNavigation = (name, category) => {

    // Secciones públicas del mapa
    const publicSections = [
      'Inicio',
      'Mapa Vecinal',
      'Servicios',
      'Ventas',
      'Solidaridad',
      'Emergencias (SOS)',
      'Reportes',
      'Eventos'
    ];

    // Permitir navegación pública
    if (publicSections.includes(name)) {
      onSelectSection(name, category);
      return;
    }

    // Proteger las secciones privadas
    if (!canAccessSection(name, isAuthenticated)) {
      onRequireLogin(name);
      return;
    }

    onSelectSection(name, category);
  };

  // ==========================================
  // INTERFAZ DEL SIDEBAR
  // ==========================================
  return (
    <aside className="left-sidebar">

      {/* =====================================
          LOGOTIPO
      ===================================== */}
      <div className="brand">
        <span className="brand-mark">
          G
        </span>

        <span>
          GeoFast<span>Pe</span>
        </span>
      </div>

      {/* =====================================
          TÍTULO DEL MENÚ
      ===================================== */}
      <div className="nav-caption">
        MENÚ PRINCIPAL
      </div>

      {/* =====================================
          OPCIONES DE NAVEGACIÓN
      ===================================== */}
      <nav>
        {menuItems.map((item) => {

          const Icon = item.icon;

          const isSelected =
            section === item.label;

          return (
            <button
              key={item.path}
              type="button"
              className={`nav-item ${
                isSelected ? 'selected' : ''
              }`}
              onClick={() => {
                handleNavigation(
                  item.label,
                  item.category
                );
              }}
              title={item.label}
            >

              {/* ICONO */}
              <span className="nav-icon">
                <Icon
                  size={20}
                  strokeWidth={1.8}
                />
              </span>

              {/* NOMBRE */}
              <span>
                {item.label}
              </span>

              {/* INDICADOR ACTIVO */}
              {isSelected && (
                <span className="nav-active" />
              )}

            </button>
          );
        })}
      </nav>

      {/* =====================================
          PARTE INFERIOR DEL SIDEBAR
      ===================================== */}
      <div className="sidebar-bottom">

        <div className="avatar">
          GF
        </div>

        <div>
          <strong>GeoFastPe</strong>
          <small>
            Plataforma comunitaria
          </small>
        </div>

      </div>

    </aside>
  );
}
