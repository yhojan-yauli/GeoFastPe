import { useState } from "react";
import { HeartHandshake, Plus, Search } from "lucide-react";
import SolidarityCard from "../features/solidarity/components/SolidarityCard";
import type {
  SolidarityCategory,
  SolidarityPost,
} from "../features/solidarity/types/solidarity.types";

interface Props {
  posts: SolidarityPost[];
  onRequestHelp: () => void;
  onDonate: () => void;
}

const categories = [
  "Todos",
  "Alimentos",
  "Ropa",
  "Útiles",
  "Salud",
  "Otros",
] as const;

export default function SolidarityPage({
  posts,
  onRequestHelp,
  onDonate,
}: Props) {
  const [tab, setTab] = useState<"donation" | "request">("donation");
  const [category, setCategory] = useState<string>("Todos");
  const [search, setSearch] = useState("");

  const filtered = posts.filter((post) => {
    const matchesType = post.type === tab;
    const matchesCategory =
      category === "Todos" ||
      post.category === (category as SolidarityCategory);
    const matchesSearch =
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.description.toLowerCase().includes(search.toLowerCase());

    return matchesType && matchesCategory && matchesSearch;
  });

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-violet-100 p-3 text-violet-600">
            <HeartHandshake size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Solidaridad y Donaciones
            </h1>
            <p className="text-sm text-slate-500">
              Comparte recursos y ayuda a tu comunidad.
            </p>
          </div>
        </div>

        <button
          onClick={onDonate}
          className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-700"
        >
          <Plus size={18} />
          Publicar donación
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex gap-5">
            {[
              { value: "donation", label: "Donaciones" },
              { value: "request", label: "Solicitudes" },
            ].map((item) => (
              <button
                key={item.value}
                onClick={() =>
                  setTab(item.value as "donation" | "request")
                }
                className={`border-b-2 pb-3 text-sm font-semibold ${
                  tab === item.value
                    ? "border-violet-600 text-violet-700"
                    : "border-transparent text-slate-500"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <button
            onClick={onRequestHelp}
            className="rounded-xl border border-violet-200 px-4 py-2 text-sm font-medium text-violet-700 hover:bg-violet-50"
          >
            Solicitar ayuda
          </button>
        </div>

        <div className="relative mt-5">
          <Search
            size={18}
            className="absolute left-3 top-3 text-slate-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar donaciones o solicitudes..."
            className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-violet-500"
          />
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {categories.map((item) => (
            <button
              key={item}
              onClick={() => setCategory(item)}
              className={`rounded-xl px-4 py-2 text-sm font-medium ${
                category === item
                  ? "bg-violet-600 text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-4">
          {filtered.length ? (
            filtered.map((post) => (
              <SolidarityCard key={post.id} post={post} />
            ))
          ) : (
            <div className="py-12 text-center text-sm text-slate-500">
              No hay publicaciones para esta búsqueda.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
