type EnvSource = Record<string, string | undefined>;

const getEnv = (): EnvSource => {
  // Prefer Vite env; fall back to empty object for non-browser test contexts.
  return typeof import.meta !== "undefined" && import.meta.env
    ? (import.meta.env as EnvSource)
    : {};
};

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

const resolveApiBaseUrl = () => {
  const env = getEnv();

  if (env.VITE_API_BASE_URL && env.VITE_API_BASE_URL.trim()) {
    return trimTrailingSlash(env.VITE_API_BASE_URL.trim());
  }

  const protocol = (env.VITE_API_PROTOCOL || "http").replace(/:$/, "");
  const host =
    env.VITE_API_HOST ||
    // Auto-align with the hostname the browser is using (e.g., localhost, 127.0.0.1)
    (typeof window !== "undefined" ? window.location.hostname : "localhost");
  const port = env.VITE_API_PORT || "3001"; // Matches docker-compose host mapping (backend-web 3001->3000)

  return trimTrailingSlash(`${protocol}://${host}${port ? `:${port}` : ""}`);
};

export const API_BASE_URL = resolveApiBaseUrl();
