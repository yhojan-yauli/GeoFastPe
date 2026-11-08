import { apiRequest } from './client';

export const authApi = {
  registrar: (datos) => apiRequest('/auth/register', { method: 'POST', body: datos }),
  iniciarSesion: (identifier, password) =>
    apiRequest('/auth/login', { method: 'POST', body: { identifier, password } }),
  yo: () => apiRequest('/auth/me'),
  cambiarPassword: (currentPassword, newPassword) =>
    apiRequest('/auth/password', { method: 'PATCH', body: { currentPassword, newPassword } })
};

export const usersApi = {
  actualizarPerfil: (datos) => apiRequest('/users/me', { method: 'PATCH', body: datos }),
  estadisticas: () => apiRequest('/users/me/estadisticas')
};

export const catalogApi = {
  obtener: () => apiRequest('/catalogos')
};

export const filesApi = {
  subir: (archivo) => {
    const formData = new FormData();
    formData.append('file', archivo);
    return apiRequest('/archivos', { method: 'POST', formData });
  },
  // Convierte un File en URL subida; si ya es texto/URL o no hay valor, lo devuelve tal cual (o null).
  resolverImagen: async (valor) => {
    if (valor instanceof File) {
      const respuesta = await filesApi.subir(valor);
      return respuesta.url;
    }
    return valor || null;
  },
  resolverImagenes: async (archivos = []) => {
    const urls = [];
    for (const archivo of archivos) {
      urls.push(await filesApi.resolverImagen(archivo));
    }
    return urls;
  }
};

export const servicesApi = {
  listar: (filtros = {}) => apiRequest('/servicios', { query: filtros }),
  obtenerPorId: (id) => apiRequest(`/servicios/${id}`),
  misServicios: () => apiRequest('/servicios/mios'),
  crear: (datos) => apiRequest('/servicios', { method: 'POST', body: datos }),
  actualizar: (id, datos) => apiRequest(`/servicios/${id}`, { method: 'PUT', body: datos }),
  eliminar: (id) => apiRequest(`/servicios/${id}`, { method: 'DELETE' })
};

export const salesApi = {
  listar: (filtros = {}) => apiRequest('/ventas', { query: filtros }),
  obtenerPorId: (id) => apiRequest(`/ventas/${id}`),
  misVentas: () => apiRequest('/ventas/mios'),
  crear: (datos) => apiRequest('/ventas', { method: 'POST', body: datos }),
  actualizar: (id, datos) => apiRequest(`/ventas/${id}`, { method: 'PUT', body: datos }),
  eliminar: (id) => apiRequest(`/ventas/${id}`, { method: 'DELETE' }),
  contactar: (id) => apiRequest(`/ventas/${id}/contactar`, { method: 'POST' })
};

export const solidarityApi = {
  listar: (filtros = {}) => apiRequest('/solidaridad', { query: filtros }),
  favoritos: () => apiRequest('/solidaridad/favoritos'),
  crear: (datos) => apiRequest('/solidaridad', { method: 'POST', body: datos }),
  marcarFavorito: (id) => apiRequest(`/solidaridad/${id}/favorito`, { method: 'PUT' }),
  quitarFavorito: (id) => apiRequest(`/solidaridad/${id}/favorito`, { method: 'DELETE' })
};

export const emergencyApi = {
  listar: (filtros = {}) => apiRequest('/emergencias', { query: filtros }),
  crear: (datos) => apiRequest('/emergencias', { method: 'POST', body: datos })
};

export const reportsApi = {
  listar: (filtros = {}) => apiRequest('/reportes', { query: filtros }),
  crear: (datos) => apiRequest('/reportes', { method: 'POST', body: datos })
};

export const eventsApi = {
  listar: (filtros = {}) => apiRequest('/eventos', { query: filtros }),
  obtenerPorId: (id) => apiRequest(`/eventos/${id}`),
  crear: (datos) => apiRequest('/eventos', { method: 'POST', body: datos }),
  participar: (id) => apiRequest(`/eventos/${id}/participar`, { method: 'POST' }),
  dejarDeParticipar: (id) => apiRequest(`/eventos/${id}/participar`, { method: 'DELETE' })
};

export const chatApi = {
  listar: (filtros = {}) => apiRequest('/conversaciones', { query: filtros }),
  crear: (datos) => apiRequest('/conversaciones', { method: 'POST', body: datos }),
  mensajes: (id) => apiRequest(`/conversaciones/${id}/mensajes`),
  enviar: (id, text) => apiRequest(`/conversaciones/${id}/mensajes`, { method: 'POST', body: { text } }),
  marcarLeido: (id) => apiRequest(`/conversaciones/${id}/leer`, { method: 'POST' })
};
