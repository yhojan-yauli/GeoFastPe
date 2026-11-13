const CACHE_KEY = 'geofastpe_ubigeos_2026';
const BASES = [
  'https://raw.githubusercontent.com/RitchieRD/ubigeos-peru-data/main/json/',
  'https://cdn.jsdelivr.net/gh/RitchieRD/ubigeos-peru-data@main/json/'
];

async function getJson(file) {
  let lastError;
  for (const base of BASES) {
    try {
      const response = await fetch(`${base}${file}`, { cache: 'force-cache' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) { lastError = error; }
  }
  throw lastError || new Error('No se pudo cargar el catálogo de ubigeos.');
}

export async function loadPeruUbigeos() {
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
    if (cached?.departments?.length && cached?.provinces?.length && cached?.districts?.length) return cached;
  } catch {}
  const [depJson, provJson, distJson] = await Promise.all([
    getJson('1_ubigeo_departamentos.json'),
    getJson('2_ubigeo_provincias.json'),
    getJson('3_ubigeo_distritos.json')
  ]);
  const data = {
    departments: depJson.ubigeo_departamentos || [],
    provinces: provJson.ubigeo_provincias || [],
    districts: distJson.ubigeo_distritos || []
  };
  if (!data.departments.length || !data.provinces.length || !data.districts.length) {
    throw new Error('El catálogo de distritos recibido está incompleto.');
  }
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(data)); } catch {}
  return data;
}

export const ubigeoName = value => String(value || '').toLocaleLowerCase('es-PE')
  .replace(/(^|\s)([a-záéíóúñ])/g, (_, space, letter) => space + letter.toLocaleUpperCase('es-PE'));
