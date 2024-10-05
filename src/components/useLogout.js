import { useNavigate } from "react-router-dom";

function useLogout() {
  const navigate = useNavigate();

  const logout = () => {
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");

    fetch("https://localhost:7029/api/user/logout", {
      method: "POST",
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Logout-ul a eșuat.");
        }
        navigate("/login");
        window.location.reload();
      })
      .catch(() => {
        navigate("/login");
        window.location.reload();
      });
  };

  return logout;
}

export default useLogout;
