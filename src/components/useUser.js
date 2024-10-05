import { useState, useEffect } from "react";

export function useUser() {
  const [user, setUser] = useState(() => {
    const storedUser = sessionStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = () => {
      const storedUser = sessionStorage.getItem("user");
      setUser(storedUser ? JSON.parse(storedUser) : null);
      setLoading(false);
    };

    fetchUser();

    window.addEventListener("storage", fetchUser);

    return () => {
      window.removeEventListener("storage", fetchUser);
    };
  }, []);

  const logout = () => {
    sessionStorage.removeItem("user");
    setUser(null);
    window.dispatchEvent(new Event("storage"));
  };

  return { user, loading, logout };
}
