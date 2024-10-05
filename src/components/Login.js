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

  useEffect(() => {
    setUsername("");
    setPassword("");
  }, []);

  const encryptPassword = (password) => {
    const key = CryptoJS.enc.Utf8.parse("f98hf73nGkN4Lc5pTv9P7Xg3dN8kR6q7");
    const iv = CryptoJS.enc.Utf8.parse("jG9pT7x8QwR2Mz1v");
    return CryptoJS.AES.encrypt(password, key, { iv: iv }).toString();
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const encryptedPassword = encryptPassword(password);

      const response = await fetch(
        "https://my-family-app.onrender.com/api/user/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password: encryptedPassword }),
          credentials: "include",
        }
      );

      if (response.ok) {
        const { accessToken, refreshToken, user } = await response.json();
        console.log(user);
        if (user && user.username) {
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

          window.dispatchEvent(new Event("storage"));

          if (user.IsAdmin) {
            navigate("/admin");
          } else if (user.IsApproved) {
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
      console.error("Eroare la autentificare:", error);
      setModalMessage(
        "Autentificare eșuată din cauza unei erori neașteptate. Vă rugăm să încercați din nou."
      );
    }
  };

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
