import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

export type UserRole = "buyer" | "renter" | "seller";

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone: string;
  createdAt: string;
}

const ADMIN_EMAIL = "tehzeeb.x51214@gmail.com";
const ADMIN_PASSWORD = "141161";
const USERS_KEY = "ghardhoondo_users";
const CURRENT_USER_KEY = "ghardhoondo_current_user";

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  allUsers: User[];
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string, phone: string, role: UserRole) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  refreshUsers: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const isAdmin = user?.email === ADMIN_EMAIL;

  const loadUsers = useCallback(async () => {
    const raw = await AsyncStorage.getItem(USERS_KEY);
    if (raw) {
      setAllUsers(JSON.parse(raw));
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const [currentRaw, usersRaw] = await Promise.all([
          AsyncStorage.getItem(CURRENT_USER_KEY),
          AsyncStorage.getItem(USERS_KEY),
        ]);
        if (currentRaw) setUser(JSON.parse(currentRaw));
        if (usersRaw) setAllUsers(JSON.parse(usersRaw));
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const trimmedEmail = email.trim().toLowerCase();
    if (trimmedEmail === ADMIN_EMAIL.toLowerCase() && password === ADMIN_PASSWORD) {
      const adminUser: User = {
        id: "admin",
        name: "Admin",
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        role: "seller",
        phone: "",
        createdAt: new Date().toISOString(),
      };
      setUser(adminUser);
      await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(adminUser));
      return { success: true };
    }
    const raw = await AsyncStorage.getItem(USERS_KEY);
    const users: User[] = raw ? JSON.parse(raw) : [];
    const found = users.find((u) => u.email.toLowerCase() === trimmedEmail && u.password === password);
    if (!found) return { success: false, error: "Invalid email or password" };
    setUser(found);
    await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(found));
    return { success: true };
  }, []);

  const register = useCallback(async (name: string, email: string, password: string, phone: string, role: UserRole) => {
    const trimmedEmail = email.trim().toLowerCase();
    const raw = await AsyncStorage.getItem(USERS_KEY);
    const users: User[] = raw ? JSON.parse(raw) : [];
    if (users.find((u) => u.email.toLowerCase() === trimmedEmail)) {
      return { success: false, error: "Email already registered" };
    }
    const newUser: User = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: name.trim(),
      email: trimmedEmail,
      password,
      role,
      phone: phone.trim(),
      createdAt: new Date().toISOString(),
    };
    const updated = [...users, newUser];
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(updated));
    setAllUsers(updated);
    setUser(newUser);
    await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
    return { success: true };
  }, []);

  const logout = useCallback(async () => {
    setUser(null);
    await AsyncStorage.removeItem(CURRENT_USER_KEY);
  }, []);

  const updateUser = useCallback(async (updates: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updated));
    const raw = await AsyncStorage.getItem(USERS_KEY);
    const users: User[] = raw ? JSON.parse(raw) : [];
    const idx = users.findIndex((u) => u.id === user.id);
    if (idx >= 0) {
      users[idx] = updated;
      await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
      setAllUsers(users);
    }
  }, [user]);

  const refreshUsers = useCallback(async () => {
    await loadUsers();
  }, [loadUsers]);

  return (
    <AuthContext.Provider value={{ user, isAdmin, allUsers, isLoading, login, register, logout, updateUser, refreshUsers }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
