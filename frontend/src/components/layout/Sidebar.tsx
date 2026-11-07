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

const menuItems = [
  { label: "Inicio", icon: House },
  { label: "Mapa Vecinal", icon: MapPinned },
  { label: "Servicios", icon: BriefcaseBusiness },
  { label: "Solidaridad", icon: HeartHandshake },
  { label: "Emergencias", icon: Siren },
  { label: "Reportes", icon: Flag },
  { label: "Eventos", icon: CalendarDays },
  { label: "Mensajes", icon: MessageCircle },
  { label: "Mi Perfil", icon: UserRound },
  { label: "Configuración", icon: Settings },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export default function Sidebar({
  isOpen,
  onClose,
  currentPage,
  onNavigate,
}: SidebarProps) {
  const handleNavigation = (page: string) => {
    onNavigate(page);
    onClose();
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex w-64 flex-col
          bg-[#191638] text-white transition-transform duration-300
          lg:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
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

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {menuItems.map(({ label, icon: Icon }) => (
            <button
              key={label}
              type="button"
              onClick={() => handleNavigation(label)}
              className={`
                flex w-full items-center gap-3 rounded-xl px-4 py-3
                text-left text-sm transition-colors
                ${
                  currentPage === label
                    ? "bg-violet-600 font-semibold text-white"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }
              `}
            >
              <Icon size={19} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="border-t border-white/10 p-5 text-xs text-slate-400">
          GeoFastPe · Plataforma comunitaria
        </div>
      </aside>
    </>
  );
}
