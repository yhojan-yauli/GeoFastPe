import {
  House,
  MapPinned,
  BriefcaseBusiness,
  HeartHandshake,
  Siren,
  Flag,
  CalendarDays,
  MessageCircle,
  UserRound,
  Settings,
  X,
} from "lucide-react";

import { NavLink } from "react-router-dom";

const menuItems = [
  { label: "Inicio", icon: House, path: "/" },
  { label: "Mapa Vecinal", icon: MapPinned, path: "/mapa" },
  { label: "Servicios", icon: BriefcaseBusiness, path: "/servicios" },
  { label: "Solidaridad", icon: HeartHandshake, path: "/solidaridad" },
  { label: "Emergencias", icon: Siren, path: "/emergencias" },
  { label: "Reportes", icon: Flag, path: "/reportes" },
  { label: "Eventos", icon: CalendarDays, path: "/eventos" },
  { label: "Mensajes", icon: MessageCircle, path: "/mensajes" },
  { label: "Mi Perfil", icon: UserRound, path: "/perfil" },
  { label: "Configuración", icon: Settings, path: "/configuracion" },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({
  isOpen,
  onClose,
}: SidebarProps) {
  return (
    <>
      {/* Fondo oscuro en dispositivos móviles */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Barra lateral */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex w-64 flex-col
          bg-[#191638] text-white transition-transform duration-300
          lg:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between border-b border-white/10 p-6">
          <h1 className="text-2xl font-bold">
            Geo<span className="text-violet-400">FastPe</span>
          </h1>

          <button
            type="button"
            onClick={onClose}
            className="lg:hidden"
            aria-label="Cerrar menú"
          >
            <X size={22} />
          </button>
        </div>

        {/* Menú de navegación */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {menuItems.map(({ label, icon: Icon, path }) => (
            <NavLink
              key={label}
              to={path}
              end={path === "/"}
              onClick={onClose}
              className={({ isActive }) => `
                flex w-full items-center gap-3 rounded-xl px-4 py-3
                text-left text-sm transition-colors
                ${
                  isActive
                    ? "bg-violet-600 font-semibold text-white"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }
              `}
            >
              <Icon size={19} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Pie del Sidebar */}
        <div className="border-t border-white/10 p-5 text-xs text-slate-400">
          GeoFastPe · Plataforma comunitaria
        </div>
      </aside>
    </>
  );
}
