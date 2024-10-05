import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import CryptoJS from "crypto-js";
import "./Login.css";
import Modal from "./Modal";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const navigate = useNavigate();

  // Reset username and password when component loads
  useEffect(() => {
    setUsername("");
    setPassword("");
  }, []);

  // Function to encrypt the password using the SECRET_KEY and IV_KEY from environment variables
  const encryptPassword = (password) => {
    const key = CryptoJS.enc.Utf8.parse(process.env.REACT_APP_SECRET_KEY); // Load the secret key
    const iv = CryptoJS.enc.Utf8.parse(process.env.REACT_APP_IV_KEY); // Load the IV key
    return CryptoJS.AES.encrypt(password, key, { iv: iv }).toString(); // Encrypt the password
  };

  // Login function handling the form submission
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // Encrypt the password before sending
      const encryptedPassword = encryptPassword(password);

      // Fetch the backend URL from the environment variables
      const backendUrl = process.env.REACT_APP_BACKEND_URL;

      // Log the backend URL for debugging purposes
      console.log("Backend URL:", backendUrl);

      // Check if backend URL exists (to debug potential issues)
      if (!backendUrl) {
        setModalMessage(
          "URL-ul backend nu a fost setat corect. Verificați fișierul .env."
        );
        return;
      }

      // Send login request to the backend
      const response = await fetch(`${backendUrl}/api/user/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password: encryptedPassword }), // Send username and encrypted password
        credentials: "include",
      });

      // Handle the response from the backend
      if (response.ok) {
        const { accessToken, refreshToken, user } = await response.json();

        console.log("User response:", user); // Debug the user response

        if (user && user.username) {
          // Store tokens and user information in session storage
          sessionStorage.setItem("accessToken", accessToken);
          sessionStorage.setItem("refreshToken", refreshToken);
          sessionStorage.setItem(
            "user",
            JSON.stringify({
              username: user.username,
              isAdmin: user.isAdmin,
              isApproved: user.isApproved,
            })
          );

          // Dispatch storage event (if needed)
          window.dispatchEvent(new Event("storage"));

          // Redirect based on user role
          if (user.isAdmin) {
            navigate("/admin");
          } else if (user.isApproved) {
            navigate("/user");
          } else {
            setModalMessage("Ne pare rău, nu ați fost aprobat încă.");
          }
        } else {
          setModalMessage("Datele de autentificare sunt invalide.");
        }
      } else {
        setModalMessage(
          "Autentificare eșuată! Vă rugăm să verificați acreditările și să încercați din nou sau să așteptați aprobarea."
        );
      }
    } catch (error) {
      console.error("Eroare la autentificare:", error); // Log error for debugging
      setModalMessage(
        "Autentificare eșuată din cauza unei erori neașteptate. Vă rugăm să încercați din nou."
      );
    }
  };

  // Function to close the modal
  const closeModal = () => {
    setModalMessage("");
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2 className="login-title">Autentificare</h2>
        <form onSubmit={handleLogin} className="login-form">
          <input
            type="text"
            placeholder="Nume utilizator"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="login-input"
            required
          />
          <input
            type="password"
            placeholder="Parolă"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="login-input"
            required
          />
          <button type="submit" className="login-button">
            Autentificare
          </button>
        </form>
        <p className="login-register-text">
          Nu aveți un cont?{" "}
          <Link to="/register" className="register-link">
            Înregistrați-vă aici
          </Link>
        </p>
      </div>
      {modalMessage && <Modal message={modalMessage} onClose={closeModal} />}
    </div>
  );
}

export default Login;
