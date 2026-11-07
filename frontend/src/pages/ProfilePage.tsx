
import { useState } from "react";
import {
  UserRound,
  MapPin,
  Mail,
  Phone,
  Pencil,
  Save,
  X,
  FileText,
  Star,
  HeartHandshake,
  ShieldCheck,
} from "lucide-react";

interface Profile {
  name: string;
  email: string;
  phone: string;
  city: string;
  bio: string;
}

const initialProfile: Profile = {
  name: "Usuario GeoFastPe",
  email: "usuario@ejemplo.com",
  phone: "",
  city: "Arequipa",
  bio: "Miembro de la comunidad GeoFastPe.",
};

export default function ProfilePage() {
  const [profile, setProfile] = useState(initialProfile);
  const [draft, setDraft] = useState(initialProfile);
  const [editing, setEditing] = useState(false);

  const startEditing = () => {
    setDraft(profile);
    setEditing(true);
  };

  const saveProfile = () => {
    setProfile(draft);
    setEditing(false);
  };

  const cancelEditing = () => {
    setDraft(profile);
    setEditing(false);
  };

  const updateField = (field: keyof Profile, value: string) => {
    setDraft((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const stats = [
    { label: "Publicaciones", value: 0, icon: FileText },
    { label: "Reseñas", value: 0, icon: Star },
    { label: "Ayudas", value: 0, icon: HeartHandshake },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Mi Perfil
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Administra tu información y participación comunitaria.
        </p>
      </div>

      {/* Cabecera del perfil */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="h-28 bg-gradient-to-r from-violet-700 via-indigo-600 to-blue-500" />

        <div className="relative px-6 pb-6">
          <div className="-mt-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-4 border-white bg-violet-100 text-violet-700 shadow-sm">
                <UserRound size={38} />
              </div>

              <div className="pb-1">
                <h2 className="text-xl font-bold text-slate-900">
                  {profile.name}
                </h2>
                <p className="flex items-center gap-1 text-sm text-slate-500">
                  <MapPin size={14} />
                  {profile.city}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={startEditing}
              className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-violet-700"
            >
              <Pencil size={16} />
              Editar perfil
            </button>
          </div>

          <p className="mt-5 text-sm text-slate-600">
            {profile.bio}
          </p>

          <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck size={16} className="text-violet-600" />
            Miembro de GeoFastPe
          </div>
        </div>
      </section>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="rounded-xl bg-violet-100 p-3 text-violet-600">
              <Icon size={23} />
            </div>

            <div>
              <p className="text-2xl font-bold text-slate-900">
                {value}
              </p>
              <p className="text-sm text-slate-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Información y actividad */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <h3 className="mb-5 text-lg font-semibold text-slate-900">
            Información personal
          </h3>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {[
              { label: "Nombre completo", value: profile.name, icon: UserRound },
              { label: "Correo electrónico", value: profile.email, icon: Mail },
              { label: "Teléfono", value: profile.phone || "No registrado", icon: Phone },
              { label: "Ciudad", value: profile.city, icon: MapPin },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex items-start gap-3">
                <div className="rounded-lg bg-slate-100 p-2 text-slate-500">
                  <Icon size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-500">{label}</p>
                  <p className="break-words text-sm font-medium text-slate-800">
                    {value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-5 text-lg font-semibold text-slate-900">
            Mi actividad
          </h3>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <FileText size={18} className="text-violet-600" />
              Mis publicaciones
            </div>
            <div className="border-t border-slate-100" />
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <Star size={18} className="text-violet-600" />
              Mis reseñas
            </div>
            <div className="border-t border-slate-100" />
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <HeartHandshake size={18} className="text-violet-600" />
              Participación comunitaria
            </div>
          </div>

          <p className="mt-5 text-xs text-slate-400">
            El historial estará disponible cuando se conecte al backend.
          </p>
        </section>
      </div>

      {/* Modal para editar */}
      {editing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">
                Editar perfil
              </h3>
              <button
                type="button"
                onClick={cancelEditing}
                aria-label="Cerrar"
                className="text-slate-500 hover:text-slate-800"
              >
                <X size={22} />
              </button>
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                saveProfile();
              }}
              className="space-y-4"
            >
              {([
                ["name", "Nombre completo"],
                ["email", "Correo electrónico"],
                ["phone", "Teléfono"],
                ["city", "Ciudad"],
              ] as const).map(([field, label]) => (
                <label key={field} className="block">
                  <span className="mb-1 block text-sm font-medium text-slate-700">
                    {label}
                  </span>
                  <input
                    type={field === "email" ? "email" : field === "phone" ? "tel" : "text"}
                    value={draft[field]}
                    onChange={(event) =>
                      updateField(field, event.target.value)
                    }
                    required={field === "name" || field === "email"}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-violet-500"
                  />
                </label>
              ))}

              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700">
                  Descripción
                </span>
                <textarea
                  value={draft.bio}
                  onChange={(event) =>
                    updateField("bio", event.target.value)
                  }
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-violet-500"
                />
              </label>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={cancelEditing}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-medium text-white"
                >
                  <Save size={16} />
                  Guardar cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
