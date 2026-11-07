import type { SolidarityPost } from "../types/solidarity.types";

export const initialSolidarityPosts: SolidarityPost[] = [
  {
    id: "1",
    title: "Donación de víveres",
    category: "Alimentos",
    description: "Canasta de alimentos para compartir.",
    type: "donation",
    location: "Zona de ejemplo · 1.5 km",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=500",
    status: "Disponible",
  },
  {
    id: "2",
    title: "Ropa en buen estado",
    category: "Ropa",
    description: "Prendas de vestir para donar.",
    type: "donation",
    location: "Zona de ejemplo · 2.3 km",
    image: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=500",
    status: "Disponible",
  },
  {
    id: "3",
    title: "Útiles escolares",
    category: "Útiles",
    description: "Materiales escolares disponibles.",
    type: "donation",
    location: "Zona de ejemplo · 3.8 km",
    image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=500",
    status: "Disponible",
  },
];
