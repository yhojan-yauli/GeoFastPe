
export const PUBLIC_SECTIONS = [
  'Inicio',
  'Servicios',
  'Solidaridad',
  'Emergencias',
  'Reportes',
  'Eventos'
];

export const PRIVATE_SECTIONS = [
  'Mensajes',
  'Mi Perfil',
  'Configuración'
];

export function canAccessSection(section, isAuthenticated) {
  return (
    isAuthenticated ||
    PUBLIC_SECTIONS.includes(section)
  );
}

export function canPerformAction(isAuthenticated) {
  return isAuthenticated;
}
