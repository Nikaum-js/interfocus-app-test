import {
  UserInfo,
  isAuthenticated as checkIsAuthenticated,
  getUserInfo,
  login as loginService,
  logout as logoutService,
  storeUserInfo,
} from "@/services/auth";
import { useCallback, useEffect, useState } from "react";

export interface AuthState {
  isAuthenticated: boolean;
  loading: boolean;
  user: UserInfo | null;
  error: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    loading: true,
    user: null,
    error: null,
  });

  const checkAuthStatus = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const isAuthenticated = await checkIsAuthenticated();

      const user = isAuthenticated ? await getUserInfo() : null;

      setState({
        isAuthenticated,
        loading: false,
        user,
        error: null,
      });
    } catch (error) {
      console.error(
        "🔍 useAuth: Erro ao verificar status de autenticação:",
        error
      );
      setState({
        isAuthenticated: false,
        loading: false,
        user: null,
        error: "Erro ao verificar autenticação",
      });
    }
  }, []);

  const login = useCallback(async (): Promise<boolean> => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const tokens = await loginService();

      if (tokens) {
        await checkAuthStatus();
        return true;
      } else {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: "Falha na autenticação",
        }));
        return false;
      }
    } catch (error) {
      console.error("🚀 useAuth: Erro durante o login:", error);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      }));
      return false;
    }
  }, [checkAuthStatus]);

  const logout = useCallback(async (): Promise<void> => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      await logoutService();

      setState({
        isAuthenticated: false,
        loading: false,
        user: null,
        error: null,
      });
    } catch (error) {
      console.error("Erro durante o logout:", error);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "Erro durante logout",
      }));
    }
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const updateUserInfo = useCallback(
    async (userInfo: UserInfo): Promise<void> => {
      try {
        await storeUserInfo(userInfo);
        setState((prev) => ({ ...prev, user: userInfo }));
      } catch (error) {
        console.error("Erro ao atualizar informações do usuário:", error);
      }
    },
    []
  );

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  return {
    ...state,
    login,
    logout,
    clearError,
    updateUserInfo,
    checkAuthStatus,
  };
}
