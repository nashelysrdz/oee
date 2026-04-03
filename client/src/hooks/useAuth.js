import { useEffect, useState } from "react";
import api from "../api/axios";

const useAuth = () => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/user/perfil");
        setUser(res.data.user);
        localStorage.setItem("user", JSON.stringify(res.data.user));
      } catch (error) {
        console.error(error);
      }
    };

    fetchUser();
  }, []);

  return { user };
};

export default useAuth;