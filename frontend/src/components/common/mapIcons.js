import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  Ambulance,
  Building2,
  BookOpen,
  Car,
  Flame,
  Hammer,
  HeartHandshake,
  Laptop,
  MapPin,
  ShoppingBag,
  Sparkles,
  Sprout,
  TriangleAlert,
  Waves,
  Wrench,
  Zap,
  Siren
} from 'lucide-react';

// Iconos SVG (lucide) para los marcadores del mapa. El motor los usa con iconMarkup(nombre, color).
const ICONS = {
  alert: TriangleAlert,
  ambulance: Ambulance,
  book: BookOpen,
  building: Building2,
  bag: ShoppingBag,
  car: Car,
  flame: Flame,
  hammer: Hammer,
  heart: HeartHandshake,
  laptop: Laptop,
  pin: MapPin,
  siren: Siren,
  sparkles: Sparkles,
  sprout: Sprout,
  waves: Waves,
  wrench: Wrench,
  zap: Zap
};

export function iconMarkup(name, color = '#1e293b', size = 18) {
  const Icon = ICONS[name] || MapPin;
  return renderToStaticMarkup(createElement(Icon, { size, color, strokeWidth: 2 }));
}
