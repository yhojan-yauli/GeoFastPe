import { useState } from "react";
import {
  HeartHandshake,
  MapPin,
  ImagePlus,
  Send,
  ArrowLeft,
} from "lucide-react";
import type {
  SolidarityCategory,
  SolidarityPost,
  Urgency,
} from "../features/solidarity/types/solidarity.types";

interface Props {
  onCancel: () => void;
  onPublish: (post: SolidarityPost) => void;
}

export default function RequestHelpPage({
  onCancel,
  onPublish,
}: Props) {
  const [title, setTitle] = useState("");
  const [category, setCategory] =
    useState<SolidarityCategory>("Alimentos");
  const [description, setDescription] = useState("");
  const [urgency, setUrgency] = useState<Urgency>("Media");
  const [location, setLocation] = useState("");
  const [image, setImage] = useState<string>();

  const handleImage = (file?: File) => {
    if (!file) return;

    if (!["image/png", "image/jpeg"].includes(file.type)) {
      alert("Solo se permiten imágenes PNG o JPG.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("La imagen no debe superar los 5 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!title.trim() || !description.trim() || !location.trim()) {
      return;
    }

    onPublish({
      id: crypto.randomUUID(),
      title: title.trim(),
      category,
      description: description.trim(),
      urgency,
      location: location.trim(),
      image,
      type: "request",
      status: "Pendiente",
    });
  };

  return (
    <div className="mx-auto max-w-3xl pb-10">
      <button
        onClick={onCancel}
        className="mb-5 flex items-center gap-2 text-sm text-slate-500 hover:text-violet-600"
      >
        <ArrowLeft size={17} />
        Volver a Solidaridad
      </button>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="mb-7 flex items-center gap-4">
          <div className="rounded-2xl bg-violet-100 p-4 text-violet-600">
            <HeartHandshake size={30} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Solicitar ayuda
            </h1>
            <p className="text-sm text-slate-500">
              Cuéntanos qué necesitas y recibe apoyo de tu comunidad.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold">
              Título de la solicitud *
            </span>
            <input
              required
              maxLength={100}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Necesito apoyo con víveres"
              className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-violet-500"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold">
              Categoría *
            </span>
            <select
              value={category}
              onChange={(e) =>
                setCategory(e.target.value as SolidarityCategory)
              }
              className="w-full rounded-xl border border-slate-200 p-3"
            >
              <option>Alimentos</option>
              <option>Ropa</option>
              <option>Útiles</option>
              <option>Salud</option>
              <option>Otros</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold">
              Descripción *
            </span>
            <textarea
              required
              maxLength={300}
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalla tu necesidad..."
              className="w-full resize-none rounded-xl border border-slate-200 p-3 outline-none focus:border-violet-500"
            />
            <span className="block text-right text-xs text-slate-400">
              {description.length}/300
            </span>
          </label>

          <fieldset>
            <legend className="mb-2 text-sm font-semibold">
              Nivel de urgencia *
            </legend>
            <div className="grid grid-cols-3 gap-3">
              {(["Baja", "Media", "Alta"] as const).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setUrgency(level)}
                  aria-pressed={urgency === level}
                  className={`rounded-xl border p-3 text-sm font-semibold ${
                    urgency === level
                      ? "border-violet-600 bg-violet-50 text-violet-700 ring-1 ring-violet-600"
                      : "border-slate-200 text-slate-600"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </fieldset>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold">
              Ubicación aproximada *
            </span>
            <div className="relative">
              <MapPin
                size={18}
                className="absolute left-3 top-3.5 text-violet-600"
              />
              <input
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ej. Distrito de Cayma, Arequipa"
                className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-3 outline-none focus:border-violet-500"
              />
            </div>
            <p className="mt-1 text-xs text-slate-400">
              No ingreses tu dirección exacta. La selección en el mapa
              se integrará posteriormente.
            </p>
          </label>

          <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-violet-200 bg-violet-50/40 p-6 text-center hover:bg-violet-50">
            <ImagePlus size={28} className="text-violet-600" />
            <span className="text-sm font-semibold text-slate-700">
              Adjunta una imagen (opcional)
            </span>
            <span className="text-xs text-slate-500">
              PNG o JPG · Máximo 5 MB
            </span>
            <input
              type="file"
              accept="image/png,image/jpeg"
              className="hidden"
              onChange={(e) => handleImage(e.target.files?.[0])}
            />
            {image && (
              <img
                src={image}
                alt="Vista previa"
                className="mt-2 max-h-36 rounded-lg object-contain"
              />
            )}
          </label>

          <div className="flex flex-col-reverse justify-end gap-3 pt-3 sm:flex-row">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white hover:bg-violet-700"
            >
              <Send size={17} />
              Publicar solicitud
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
