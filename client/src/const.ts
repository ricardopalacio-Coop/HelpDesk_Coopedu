export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Garante que a URL tem um protocolo e não é nula
const ensureProtocol = (url: string | undefined) => {
  if (!url) { 
    // Se a variável estiver faltando, usa a URL do ambiente local
    return window.location.origin; 
  }
  
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  // Assume HTTPS como padrão
  return `https://${url}`;
};

// Generate login URL at runtime so redirect URI reflects the current origin.
export const getLoginUrl = () => {
  // Coloca um valor padrão se a variável não estiver definida
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL || window.location.origin; 
  const appId = import.meta.env.VITE_APP_ID;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  const validPortalUrl = ensureProtocol(oauthPortalUrl); 

  const url = new URL(`${validPortalUrl}/app-auth`);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");

  return url.toString();
};