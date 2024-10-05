// apiClient.js
export default async function apiClient(url, options = {}, navigate) {
  //   const accessToken = sessionStorage.getItem("accessToken");
  //   let response;
  //   try {
  //     response = await fetch(url, {
  //       ...options,
  //       headers: {
  //         ...options.headers,
  //         Authorization: `Bearer ${accessToken}`,
  //       },
  //     });
  //   } catch (error) {
  //     console.error("Network error:", error);
  //     throw error;
  //   }
  //   if (response.status === 401) {
  //     console.warn("Access token expired, attempting to refresh token...");
  //     const refreshToken = sessionStorage.getItem("refreshToken");
  //     if (!refreshToken) {
  //       console.warn("No refresh token found, logging out...");
  //       logout(navigate);
  //       throw new Error("Session expired. Please log in again.");
  //     }
  //     try {
  //       const refreshResponse = await fetch(
  //         "https://localhost:7029/api/auth/refresh",
  //         {
  //           method: "POST",
  //           headers: {
  //             "Content-Type": "application/json",
  //           },
  //           body: JSON.stringify({ refreshToken }),
  //         }
  //       );
  //       if (refreshResponse.ok) {
  //         const { accessToken: newAccessToken } = await refreshResponse.json();
  //         sessionStorage.setItem("accessToken", newAccessToken);
  //         console.log("Access token refreshed successfully, retrying request...");
  //
  //         response = await fetch(url, {
  //           ...options,
  //           headers: {
  //             ...options.headers,
  //             Authorization: `Bearer ${newAccessToken}`,
  //           },
  //         });
  //         if (!response.ok) {
  //           if (response.status === 401) {
  //             console.error("New access token also failed, logging out...");
  //             logout(navigate);
  //             throw new Error("Session expired. Please log in again.");
  //           } else {
  //             throw new Error(`HTTP error! status: ${response.status}`);
  //           }
  //         }
  //       } else {
  //         console.error("Failed to refresh access token, logging out...");
  //         logout(navigate);
  //         throw new Error("Session expired. Please log in again.");
  //       }
  //     } catch (error) {
  //       console.error("Error during token refresh:", error);
  //       logout(navigate);
  //       throw error;
  //     }
  //   } else if (!response.ok) {
  //     throw new Error(`HTTP error! status: ${response.status}`);
  //   }
  //   return response;
}

function logout(navigate) {
  console.log("Logging out user...");
  sessionStorage.removeItem("user");
  sessionStorage.removeItem("accessToken");
  sessionStorage.removeItem("refreshToken");
  fetch("https://localhost:7029/api/user/logout", {
    method: "POST",
    credentials: "include",
  })
    .then(() => {
      navigate("/login");
      window.location.reload();
    })
    .catch(() => {
      navigate("/login");
      window.location.reload();
    });
}
