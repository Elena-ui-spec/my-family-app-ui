import React from "react";
import useLogout from "./useLogout";
import SearchMedia from "./SearchMedia";
import "./SearchPage.css";

function SearchPage() {
  const logout = useLogout();

  return (
    <div className="search-page-container">
      <SearchMedia />
      <button onClick={logout} className="logout-button">
        Deconectare
      </button>
    </div>
  );
}

export default SearchPage;
