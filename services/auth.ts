import * as AuthSession from "expo-auth-session";
import * as SecureStore from "expo-secure-store";
import * as WebBrowser from "expo-web-browser";

const CLIENT_ID = "6a5fc829-36c9-49f8-9bbb-0029508dd83c";
const CLIENT_SECRET = "thatsmysecretkey";
const AUTHORIZE_URL = "https://ias.interfocus.com.br/authorize";
const TOKEN_URL = "https://auth.interfocus.com.br/api/oauth/token";

const ACCESS_TOKEN_KEY = "interfocus_access_token";
const REFRESH_TOKEN_KEY = "interfocus_refresh_token";
const USER_INFO_KEY = "interfocus_user_info";

WebBrowser.maybeCompleteAuthSession();

const redirectUri = AuthSession.makeRedirectUri({
  scheme: "interfocusapptest",
  path: "auth",
});

export interface UserInfo {
  id: string;
  email: string;
  name: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  tokenType?: string;
}

/**
 * Troca o authorization code pelo access token.
 */
async function exchangeCodeForTokens(code: string): Promise<AuthTokens | null> {
  try {
    const response = await fetch(TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)}`,
      },
      body: JSON.stringify({
        grant_type: "authorization_code",
        code: code,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Erro na troca de tokens:", data);
      return null;
    }

    return {
      accessToken: data.access_token,
      refreshToken: data.refreshToken,
      tokenType: "Bearer",
    };
  } catch (error) {
    console.error("❌ Erro ao trocar código por tokens:", error);
    return null;
  }
}

/**
 * Armazena os tokens de forma segura.
 */
async function storeTokens(tokens: AuthTokens): Promise<void> {
  try {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, tokens.accessToken);
    if (tokens.refreshToken) {
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, tokens.refreshToken);
    }
  } catch (error) {
    console.error("Erro ao armazenar tokens:", error);
    throw error;
  }
}

/**
 * Inicia o fluxo de autenticação OAuth 2.0.
 */
export async function login(): Promise<AuthTokens | null> {
  try {
    const request = new AuthSession.AuthRequest({
      clientId: CLIENT_ID,
      redirectUri,
      responseType: AuthSession.ResponseType.Code,
    });

    const result = await request.promptAsync({
      authorizationEndpoint: AUTHORIZE_URL,
    });

    if (result.type === "success" && result.params.code) {
      const tokens = await exchangeCodeForTokens(result.params.code);

      if (tokens) {
        await storeTokens(tokens);

        const tokenData = JSON.parse(atob(tokens.accessToken.split(".")[1]));

        const userInfo: UserInfo = {
          id: tokenData.usuarioId.toString(),
          email: tokenData.login,
          name: tokenData.usuarioNome,
        };
        await storeUserInfo(userInfo);

        return tokens;
      }
    }

    return null;
  } catch (error) {
    throw error;
  }
}

/**
 * Recupera o access token armazenado.
 */
export async function getAccessToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  } catch (error) {
    console.error("Erro ao recuperar access token:", error);
    return null;
  }
}

/**
 * Recupera o refresh token armazenado.
 */
export async function getRefreshToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error("Erro ao recuperar refresh token:", error);
    return null;
  }
}

/**
 * Verifica se o usuário está autenticado
 */
export async function isAuthenticated(): Promise<boolean> {
  const token = await getAccessToken();
  return token !== null;
}

/**
 * Faz logout removendo todos os tokens armazenados
 */
export async function logout(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_INFO_KEY);
  } catch (error) {
    console.error("Erro ao fazer logout:", error);
    throw error;
  }
}

/**
 * Armazena informações do usuário
 */
export async function storeUserInfo(userInfo: UserInfo): Promise<void> {
  try {
    await SecureStore.setItemAsync(USER_INFO_KEY, JSON.stringify(userInfo));
  } catch (error) {
    console.error("Erro ao armazenar informações do usuário:", error);
    throw error;
  }
}

/**
 * Recupera informações do usuário armazenadas
 */
export async function getUserInfo(): Promise<UserInfo | null> {
  try {
    const userInfoStr = await SecureStore.getItemAsync(USER_INFO_KEY);
    return userInfoStr ? JSON.parse(userInfoStr) : null;
  } catch (error) {
    console.error("Erro ao recuperar informações do usuário:", error);
    return null;
  }
}

/**
 * Faz uma requisição autenticada para uma API
 */
export async function authenticatedRequest(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await getAccessToken();

  if (!token) {
    throw new Error("Usuário não autenticado");
  }

  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
}
