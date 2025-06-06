import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { useSelector } from "react-redux";

interface ProtectedProps {
  children: ReactNode;
}

export default function AdminProtected({ children }: ProtectedProps) {
  const { user } = useSelector((state: any) => state.auth);
  if (user) {
    const isAdmin = user;

    return isAdmin ? children : redirect("/");
  }
}
