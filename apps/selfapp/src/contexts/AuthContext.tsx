import {
  getAuthTokenAsync,
  handleCognitoCallback,
  initializeAuthIntegration,
  isCognitoConfigured,
  loginWithCognito,
  setAuthTokenAsync,
} from '@/lib/auth-integration';
import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser =
      typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [cognitoEnabled, setCognitoEnabled] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      await initializeAuthIntegration();
      const cognito = isCognitoConfigured();
      setCognitoEnabled(cognito);

      if (cognito) {
        // If tokens present in URL from hosted UI, parse and persist them
        await handleCognitoCallback();
        const token = await getAuthTokenAsync();
        if (token) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const newUser: User = {
              id: payload.sub || payload.username || '',
              email: payload.email || payload.username || '',
              name: payload.name || payload.email || '',
            };
            setUser(newUser);
            localStorage.setItem('user', JSON.stringify(newUser));
          } catch (e) {
            // ignore parse errors
            console.error('Failed to parse JWT payload', e);
          }
        }
      }
    })();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // If Cognito is configured, redirect to hosted UI (signup/signin handled there)
    if (cognitoEnabled) {
      loginWithCognito();
      return true; // This won't be used since we redirect
    }

    // Local fallback (existing behavior)
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const foundUser = users.find(
      (u: User & { password: string }) =>
        u.email === email && u.password === password
    );

    if (foundUser) {
      // remove password before storing
      // @ts-ignore
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      await setAuthTokenAsync('local-fallback-token');
      return true;
    }
    return false;
  };

  const signup = async (
    email: string,
    password: string,
    name: string
  ): Promise<boolean> => {
    if (cognitoEnabled) {
      // Use hosted UI for signup as well
      loginWithCognito();
      return true;
    }

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.find((u: User) => u.email === email)) return false;

    const newUser = {
      id: crypto.randomUUID(),
      email,
      password,
      name,
    };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    // @ts-ignore
    const { password: _, ...userWithoutPassword } = newUser;
    setUser(userWithoutPassword);
    localStorage.setItem('user', JSON.stringify(userWithoutPassword));
    await setAuthTokenAsync('local-fallback-token');
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    setAuthTokenAsync(null);
    // If Cognito configured, redirect to Cognito logout endpoint if configured
    try {
      const cfg =
        (window as any).__SELFAPP_COGNITO__ || (window as any).AWS_CONFIG || {};
      const domain = cfg.cognitoDomain || cfg.cognito_domain || cfg.domain;
      const clientId =
        cfg.cognitoClientId || cfg.cognito_client_id || cfg.clientId;
      const redirectUri =
        cfg.redirectUri || window.location.origin + window.location.pathname;
      if (domain && clientId) {
        const url = new URL(`https://${domain}/logout`);
        url.searchParams.set('client_id', clientId);
        url.searchParams.set('logout_uri', redirectUri);
        window.location.href = url.toString();
      }
    } catch (e) {
      // ignore
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
