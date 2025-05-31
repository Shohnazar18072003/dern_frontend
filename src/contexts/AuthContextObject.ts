import { createContext } from "react";
import type { User } from "@/types";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (data: RegisterData) => Promise<void>;
  loading: boolean;
  isAuthenticated: boolean;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  accountType: "individual" | "business";
  companyName?: string;
  phone: string;
  address: string;
  marketingEmails?: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
export type { AuthContextType, RegisterData };
