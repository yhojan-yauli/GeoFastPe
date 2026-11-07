export type SolidarityCategory =
  | "Alimentos"
  | "Ropa"
  | "Útiles"
  | "Salud"
  | "Otros";

export type Urgency = "Baja" | "Media" | "Alta";

export interface SolidarityPost {
  id: string;
  title: string;
  category: SolidarityCategory;
  description: string;
  type: "donation" | "request";
  location: string;
  urgency?: Urgency;
  image?: string;
  status: "Disponible" | "Pendiente";
}
