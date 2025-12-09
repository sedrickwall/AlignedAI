import { ReactNode, useEffect, useState } from "react";
import { auth } from "../lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { useLocation } from "wouter";

interface ProtectedProps {
  children: ReactNode;
}

export default function Protected({ children }: ProtectedProps) {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [, navigate] = useLocation();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  if (user === undefined) return <div>Loading...</div>;

  if (!user) {
    navigate("/login");
    return null;
  }

  return <>{children}</>;
}
