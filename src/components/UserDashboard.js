import React from "react";
import { useNavigate } from "react-router-dom";
import useLogout from "./useLogout";
import "./UserDashboard.css";

function UserDashboard() {
  const navigate = useNavigate();
  const logout = useLogout();

  return (
    <div className="user-dashboard-container">
      <h2 className="dashboard-title">User Dashboard</h2>
      <div className="button-container">
        <button
          className="dashboard-button"
          onClick={() => navigate("/search-media")}
        >
          Căutați Fișier Media
        </button>
        <button className="dashboard-button logout-button" onClick={logout}>
          Deconectare
        </button>
      </div>
      <div className="image-container">
        <img
          src={`${process.env.PUBLIC_URL}/bali-2698078_1280.jpg`}
          alt="Decorative"
          className="dashboard-image"
        />
      </div>
    </div>
  );
}

export default UserDashboard;
