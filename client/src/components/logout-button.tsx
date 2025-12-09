// client/src/components/logout-button.tsx
import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useLocation } from "wouter";

export default function LogoutButton() {
  const [, navigate] = useLocation();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/"); // back to landing (unauthenticated)
  };

  return (
    <button onClick={handleLogout}>
      Log out
    </button>
  );
}
