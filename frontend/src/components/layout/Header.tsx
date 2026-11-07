
import { Bell, MapPin, Menu, Search } from "lucide-react";

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex min-h-18 items-center gap-4 border-b border-slate-200 bg-white px-4 py-3 md:px-8">
      <button
        onClick={onMenuClick}
        className="rounded-lg p-2 hover:bg-slate-100 lg:hidden"
        aria-label="Abrir menú"
      >
        <Menu size={23} />
      </button>

      <div className="relative max-w-xl flex-1">
        <Search
          size={19}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="search"
          placeholder="Buscar servicios, publicaciones..."
          className="w-full rounded-xl bg-slate-100 py-3 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-violet-400"
        />
      </div>

      <div className="hidden items-center gap-2 text-sm text-slate-600 md:flex">
        <MapPin size={18} className="text-violet-600" />
        <span>Mi ubicación</span>
      </div>

      <button
        className="rounded-full p-2 hover:bg-slate-100"
        aria-label="Notificaciones"
      >
        <Bell size={21} />
      </button>

      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 font-bold text-violet-700">
        G
      </div>
    </header>
  );
}
