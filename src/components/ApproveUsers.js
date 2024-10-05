import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ApproveUsers.css";

function ApproveUsers() {
  const [users, setUsers] = useState([]);
  const [userToDelete, setUserToDelete] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("https://localhost:7029/api/user/all", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Eșec la preluarea utilizatorilor:", error);
      navigate("/login");
    } finally {
      setIsLoading(false);
    }
  };

  const approveUser = async (userId) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        "https://localhost:7029/api/user/approve-user",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(userId),
        }
      );

      if (response.ok) {
        fetchUsers();
      } else {
        navigate("/login");
      }
    } catch (error) {
      console.error("Eșec la aprobarea utilizatorului:", error);
      navigate("/login");
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDeleteUser = (userId) => {
    setUserToDelete(userId);
    setShowModal(true);
  };

  const deleteUser = async () => {
    if (!userToDelete) return;
    setIsLoading(true);
    try {
      const response = await fetch(
        "https://localhost:7029/api/user/delete-user",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(userToDelete),
        }
      );

      if (response.ok) {
        fetchUsers();
        setShowModal(false);
        setUserToDelete(null);
      } else {
        navigate("/login");
      }
    } catch (error) {
      console.error("Eșec la ștergerea utilizatorului:", error);
      navigate("/login");
    } finally {
      setIsLoading(false);
    }
  };

  const cancelDelete = () => {
    setShowModal(false);
    setUserToDelete(null);
  };

  const handleBackClick = () => {
    navigate("/admin");
  };

  return (
    <div className="approve-users-container">
      <div className="header">
        <h3>Aprobați sau Ștergeți Utilizatori</h3>
      </div>

      {isLoading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Se încarcă...</p>
        </div>
      ) : (
        <ul className="user-list">
          {users.map((user) => (
            <li key={user.id} className="user-item">
              <span className="username">{user.username}</span>
              <div className="actions">
                {!user.isApproved && (
                  <button
                    className="approve-button"
                    onClick={() => approveUser(user.id)}
                  >
                    Aprobați
                  </button>
                )}
                <button
                  className="delete-button-2"
                  onClick={() => confirmDeleteUser(user.id)}
                >
                  Ștergeți
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="footer-controls">
        <button onClick={handleBackClick} className="back-button">
          &larr; Înapoi
        </button>
      </div>

      {showModal && (
        <div className="confirmation-modal-overlay">
          <div className="confirmation-modal-content">
            <p>Esti sigur ca vrei sa stergi acest utilizator?</p>
            <button className="confirm-button" onClick={deleteUser}>
              Da
            </button>
            <button className="cancel-button" onClick={cancelDelete}>
              Nu
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ApproveUsers;
