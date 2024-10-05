import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import CryptoJS from "crypto-js";
import "./Register.css";
import Modal from "./Modal";

function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [isInvited, setIsInvited] = useState(false);
  const navigate = useNavigate();

  const encryptPassword = (password) => {
    const key = CryptoJS.enc.Utf8.parse(process.env.REACT_APP_SECRET_KEY);
    const iv = CryptoJS.enc.Utf8.parse(process.env.REACT_APP_IV_KEY);
    return CryptoJS.AES.encrypt(password, key, { iv: iv }).toString();
  };

  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    let errorMessage = [];

    if (password.length < minLength) {
      errorMessage.push(`parola să aibă cel puțin ${minLength} caractere`);
    }
    if (!hasUpperCase) {
      errorMessage.push("parola să conțină cel puțin o literă mare (A-Z)");
    }
    if (!hasLowerCase) {
      errorMessage.push("parola să conțină cel puțin o literă mică (a-z)");
    }
    if (!hasNumber) {
      errorMessage.push("parola să conțină cel puțin o cifră (0-9)");
    }
    if (!hasSpecialChar) {
      errorMessage.push(
        "parola să conțină cel puțin un caracter special (de exemplu: @, #, $, etc.)"
      );
    }

    if (errorMessage.length > 0) {
      return `Pentru a fi sigură, vă rugăm să respectați următoarele cerințe: ${errorMessage.join(
        ", "
      )}.`;
    }

    return "";
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    const error = validatePassword(password);
    if (error) {
      setPasswordError(error);
      return;
    }

    const encryptedPassword = encryptPassword(password);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/user/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            password: encryptedPassword,
            isInvited,
          }),
        }
      );

      if (response.ok) {
        setModalMessage(
          "Înregistrare reușită! Acum așteptați acordul adminului."
        );
      } else {
        const errorData = await response.json();
        setModalMessage(
          errorData.message ||
            "Înregistrarea a eșuat! Vă rugăm să încercați din nou."
        );
      }
    } catch (error) {
      setModalMessage(
        "A apărut o eroare neașteptată. Vă rugăm să încercați din nou."
      );
    }
  };

  const closeModal = () => {
    setModalMessage("");
    navigate("/login");
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <h2 className="register-title">Înregistrare</h2>
        <form onSubmit={handleRegister} className="register-form">
          <input
            type="text"
            placeholder="Nume utilizator"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="register-input"
            required
          />
          <input
            type="password"
            placeholder="Parolă"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="register-input"
            required
          />
          {passwordError && <p className="error-text">{passwordError}</p>}

          <button type="submit" className="register-button">
            Înregistrare
          </button>
        </form>
        <p className="login-register-text">
          Aveți deja un cont?{" "}
          <Link to="/login" className="register-link">
            Autentificați-vă aici
          </Link>
        </p>
      </div>
      {modalMessage && <Modal message={modalMessage} onClose={closeModal} />}
    </div>
  );
}

export default Register;
