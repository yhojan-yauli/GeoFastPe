
export type MapCategory = "Servicio" | "Solidaridad" | "Emergencia";

export interface MapLocation {
  id: number;
  name: string;
  category: MapCategory;
  description: string;
  lat: number;
  lng: number;
}

export interface MapCity {
  name: string;
  lat: number;
  lng: number;
  zoom: number;
}
