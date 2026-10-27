// Mock auth: session + registered accounts persisted to localStorage, hydrated
// into the in-memory api db on boot. Any non-empty password is accepted.
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  findUserByEmailSync,
  hydrateExternal,
  markUserVerified,
  registerCompanyAndOwner,
  registerStudentUser,
} from "./api";
import type { AuthUser, Company, PlatformUser, Role } from "./types";

const SESSION_KEY = "hilabs.session";
const USERS_KEY = "hilabs.users";
const COMPANIES_KEY = "hilabs.companies";

// Demo employees whose company membership comes from the seed, not registrations.
const DEMO_COMPANY_FOR_EMAIL: Record<string, string> = {
  "owner@demo.com": "c1",
  "hr@demo.com": "c1",
  "kabir@demo.com": "c2",
};

export const DEMO_ACCOUNTS: { email: string; label: string; detail: string }[] = [
  { email: "student@demo.com", label: "Student", detail: "Aarav Sharma · student portal" },
  { email: "hr@demo.com", label: "HR", detail: "Neha Verma · Fawrit Technologies" },
  { email: "owner@demo.com", label: "Company owner", detail: "Rajesh Kumar · Fawrit Technologies" },
  { email: "admin@demo.com", label: "Admin", detail: "HiLabs platform admin" },
];

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function toAuthUser(user: PlatformUser, registeredCompanies: Company[]): AuthUser {
  const companyId =
    DEMO_COMPANY_FOR_EMAIL[user.email.toLowerCase()] ??
    registeredCompanies.find((c) => c.ownerEmail.toLowerCase() === user.email.toLowerCase())?.id;
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    emailVerified: user.emailVerified,
    ...(companyId ? { companyId } : {}),
  };
}

export function homeForRole(user: AuthUser): string {
  switch (user.role) {
    case "STUDENT":
      return "/student/dashboard";
    case "ADMIN":
      return "/admin/dashboard";
    default:
      return user.companyId ? `/company/${user.companyId}/dashboard` : "/hr/join-company";
  }
}

interface AuthContextValue {
  user: AuthUser | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => void;
  registerStudent: (input: { firstName: string; lastName: string; email: string }) => Promise<void>;
  registerOwner: (input: {
    owner: { firstName: string; lastName: string; email: string };
    company: { name: string; location: string; website: string; description: string };
  }) => Promise<void>;
  verifyEmail: (email: string) => Promise<AuthUser>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function MockAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const registeredUsers = readJson<PlatformUser[]>(USERS_KEY, []);
    const registeredCompanies = readJson<Company[]>(COMPANIES_KEY, []);
    hydrateExternal({ companies: registeredCompanies, users: registeredUsers });
    const session = readJson<AuthUser | null>(SESSION_KEY, null);
    if (session && findUserByEmailSync(session.email)) {
      setUser(toAuthUser(findUserByEmailSync(session.email)!, registeredCompanies));
    }
    setReady(true);
  }, []);

  const persistUser = useCallback((pu: PlatformUser) => {
    const users = readJson<PlatformUser[]>(USERS_KEY, []);
    localStorage.setItem(USERS_KEY, JSON.stringify([...users.filter((u) => u.id !== pu.id), pu]));
  }, []);

  const persistCompany = useCallback((company: Company) => {
    const companies = readJson<Company[]>(COMPANIES_KEY, []);
    localStorage.setItem(COMPANIES_KEY, JSON.stringify([...companies.filter((c) => c.id !== company.id), company]));
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      if (!email.trim() || !password) throw new Error("Enter your email and password.");
      await new Promise((r) => setTimeout(r, 300));
      const pu = findUserByEmailSync(email);
      if (!pu) throw new Error("No account found with this email. Try a demo account below.");
      if (!pu.active) throw new Error("This account has been deactivated by an administrator.");
      const registeredCompanies = readJson<Company[]>(COMPANIES_KEY, []);
      const authUser = toAuthUser(pu, registeredCompanies);
      localStorage.setItem(SESSION_KEY, JSON.stringify(authUser));
      setUser(authUser);
      return authUser;
    },
    [],
  );

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  }, []);

  const registerStudent = useCallback(
    async (input: { firstName: string; lastName: string; email: string }) => {
      const pu = await registerStudentUser(input);
      persistUser(pu);
      hydrateExternal({ companies: [], users: [pu] });
    },
    [persistUser],
  );

  const registerOwner = useCallback(
    async (input: {
      owner: { firstName: string; lastName: string; email: string };
      company: { name: string; location: string; website: string; description: string };
    }) => {
      const { company, user: pu } = await registerCompanyAndOwner(input);
      persistUser(pu);
      persistCompany(company);
      hydrateExternal({ companies: [company], users: [pu] });
    },
    [persistCompany, persistUser],
  );

  const verifyEmail = useCallback(
    async (email: string) => {
      await markUserVerified(email);
      const pu = findUserByEmailSync(email);
      if (!pu) throw new Error("No account found for this email.");
      const users = readJson<PlatformUser[]>(USERS_KEY, []);
      const verified = users.find((u) => u.id === pu.id);
      if (verified) {
        verified.emailVerified = true;
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
      }
      const registeredCompanies = readJson<Company[]>(COMPANIES_KEY, []);
      const authUser = toAuthUser({ ...pu, emailVerified: true }, registeredCompanies);
      localStorage.setItem(SESSION_KEY, JSON.stringify(authUser));
      setUser(authUser);
      return authUser;
    },
    [],
  );

  const value = useMemo(
    () => ({ user, ready, login, logout, registerStudent, registerOwner, verifyEmail }),
    [user, ready, login, logout, registerStudent, registerOwner, verifyEmail],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside MockAuthProvider");
  return ctx;
}

export function roleLabel(role: Role): string {
  switch (role) {
    case "STUDENT":
      return "Student";
    case "HR":
      return "HR";
    case "COMPANY_ADMIN":
      return "Company admin";
    case "OWNER":
      return "Company owner";
    case "ADMIN":
      return "Platform admin";
  }
}
