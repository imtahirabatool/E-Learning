import { redirect } from "next/navigation";
import { ReactNode } from "react";
import useAuth from "./useAuth";

interface ProtectedProps {
  children: ReactNode;
}

export default function Protected({ children }: ProtectedProps) {
  const isAuthenticated = useAuth();

  return isAuthenticated ? children : redirect("/");
}