
import { apiRequest } from "./client";

export const servicesApi = {
  obtenerTodos: () => apiRequest("/servicios"),

  obtenerPorId: (id) =>
    apiRequest(`/servicios/${id}`),

  crear: (datos) =>
    apiRequest("/servicios", {
      method: "POST",
      body: JSON.stringify(datos),
    }),
};
