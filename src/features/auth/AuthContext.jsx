import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';
import { authApi, usersApi } from '../../api/index.js';
import { tokenStorage } from '../../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(tokenStorage.get()));

  useEffect(() => {
    if (!tokenStorage.get()) {
      setLoading(false);
      return;
    }

    authApi.yo()
      .then((datos) => setUser(datos))
      .catch(() => tokenStorage.clear())
      .finally(() => setLoading(false));
  }, []);

  const guardarSesion = (respuesta) => {
    tokenStorage.set(respuesta.token);
    setUser(respuesta.user);
    return respuesta.user;
  };

  const login = async (identifier, password) => {
    const respuesta = await authApi.iniciarSesion(identifier, password);
    return guardarSesion(respuesta);
  };

  const register = async (datos) => {
    const respuesta = await authApi.registrar(datos);
    return guardarSesion(respuesta);
  };

  const logout = () => {
    tokenStorage.clear();
    setUser(null);
  };

  const updateProfile = async (datos) => {
    const actualizado = await usersApi.actualizarPerfil(datos);
    setUser(actualizado);
    return actualizado;
  };

  const value = useMemo(() => ({
    user,
    isAuthenticated: Boolean(user),
    loading,
    login,
    register,
    logout,
    updateProfile
  }), [user, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth debe utilizarse dentro de AuthProvider'
    );
  }

  return context;
}
