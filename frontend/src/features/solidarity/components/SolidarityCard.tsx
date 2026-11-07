import { useState } from "react";
import { Heart, MapPin, PackageOpen } from "lucide-react";
import type { SolidarityPost } from "../types/solidarity.types";

interface Props {
  post: SolidarityPost;
}

export default function SolidarityCard({ post }: Props) {
  const [favorite, setFavorite] = useState(false);

  return (
    <article className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-violet-50 text-violet-500 sm:h-28 sm:w-32">
        {post.image ? (
          <img
            src={post.image}
            alt={post.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <PackageOpen size={32} />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-slate-900">
            {post.title}
          </h3>

          <button
            type="button"
            onClick={() => setFavorite(!favorite)}
            aria-label={favorite ? "Quitar favorito" : "Marcar favorito"}
            aria-pressed={favorite}
            className="text-slate-400 hover:text-violet-600"
          >
            <Heart
              size={21}
              className={favorite ? "fill-violet-600 text-violet-600" : ""}
            />
          </button>
        </div>

        <p className="mt-1 line-clamp-2 text-sm text-slate-500">
          {post.description}
        </p>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <span className="flex items-center gap-1 text-xs text-slate-500">
            <MapPin size={14} />
            {post.location}
          </span>

          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
            post.status === "Disponible"
              ? "bg-green-100 text-green-700"
              : "bg-amber-100 text-amber-700"
          }`}>
            {post.status}
          </span>
        </div>
      </div>
    </article>
  );
}
