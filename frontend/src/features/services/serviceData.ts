
export type Category =
  | "Hogar"
  | "Transporte"
  | "Salud"
  | "Educación"
  | "Otros";

export interface LocalService {
  id: number;
  title: string;
  category: Category;
  description: string;
  price?: number;
  location: string;
  distance?: number;
  rating: number;
  reviews: number;
  image: string;
  serviceType: string;
  availability: string;
}

export const initialServices: LocalService[] = [
  {
    id: 1,
    title: "Electricista a domicilio",
    category: "Hogar",
    description: "Instalaciones y reparaciones eléctricas.",
    price: 50,
    location: "Cayma",
    distance: 1.2,
    rating: 4.8,
    reviews: 32,
    image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500",
    serviceType: "Servicio a domicilio",
    availability: "Lunes a sábado",
  },
  {
    id: 2,
    title: "Gasfitería y plomería",
    category: "Hogar",
    description: "Reparación de tuberías y sanitarios.",
    price: 40,
    location: "Yanahuara",
    distance: 2.5,
    rating: 4.7,
    reviews: 38,
    image: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=500",
    serviceType: "Servicio a domicilio",
    availability: "Todos los días",
  },
  {
    id: 3,
    title: "Transporte y mudanzas",
    category: "Transporte",
    description: "Transporte seguro de muebles y paquetes.",
    price: 80,
    location: "Cercado",
    distance: 3.1,
    rating: 4.6,
    reviews: 20,
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=500",
    serviceType: "Servicio a domicilio",
    availability: "Previa coordinación",
  },
  {
    id: 4,
    title: "Clases de matemáticas",
    category: "Educación",
    description: "Clases particulares para escolares.",
    price: 30,
    location: "José Luis Bustamante",
    distance: 1.8,
    rating: 4.9,
    reviews: 27,
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=500",
    serviceType: "Presencial o virtual",
    availability: "Lunes a viernes",
  },
];

