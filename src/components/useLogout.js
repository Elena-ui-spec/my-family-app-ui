import { useNavigate } from "react-router-dom";

function useLogout() {
  const navigate = useNavigate();

  const logout = () => {
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");

    fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/logout`, {
      method: "POST",
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Logout-ul a eșuat.");
        }
        navigate("/");
        window.location.reload();
      })
      .catch(() => {
        navigate("/");
        window.location.reload();
      });
  };

  return logout;
}

export default useLogout;
