import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AddMedia.css";
import Modal from "./Modal";

function AddMedia() {
  const [description, setDescription] = useState("");
  const [story, setStory] = useState("");
  const [persons, setPersons] = useState("");
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const navigate = useNavigate();

  const handleMediaUpload = async (e) => {
    e.preventDefault();

    if (!file) {
      setModalMessage("Vă rugăm să selectați un fișier pentru încărcare.");
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    formData.append("description", description);
    formData.append("story", story);
    formData.append("persons", persons);
    formData.append("file", file);

    try {
      const response = await fetch("https://localhost:7029/api/media/add", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 401) {
          navigate("/login");
        } else {
          const errorMessage = await response.text();
          setModalMessage(`Încărcarea fișierului a eșuat: ${errorMessage}`);
        }
        return;
      }

      const media = await response.json();

      sessionStorage.setItem(media.FileName, media.FileUrl);

      setModalMessage("Fișierul media a fost încărcat cu succes.");
      setDescription("");
      setStory("");
      setPersons("");
      setFile(null);
      document.getElementById("fileInput").value = null;
    } catch (error) {
      console.error("Eroare la încărcarea fișierului media:", error);
      navigate("/login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackClick = () => {
    navigate("/admin");
  };

  const closeModal = () => {
    setModalMessage("");
  };

  return (
    <div className="add-media-parent-container">
      <div className="add-media-container">
        <h3 className="title">Încărcați Fișier Media</h3>
        <form onSubmit={handleMediaUpload} className="upload-form">
          <div className="form-group">
            <label htmlFor="description" className="input-label">
              Descriere:
            </label>
            <textarea
              id="description"
              placeholder="Introduceți descrierea fișierului media"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field description-field"
            />
          </div>

          <div className="form-group">
            <label htmlFor="story" className="input-label">
              Poveste:
            </label>
            <textarea
              id="story"
              placeholder="Introduceți povestea"
              value={story}
              onChange={(e) => setStory(e.target.value)}
              className="input-field story-field"
            />
          </div>

          <div className="form-group">
            <label htmlFor="persons" className="input-label">
              Persoane (separate prin virgulă):
            </label>
            <input
              type="text"
              id="persons"
              placeholder="Introduceți numele persoanelor"
              value={persons}
              onChange={(e) => setPersons(e.target.value)}
              className="input-field"
            />
          </div>

          <div className="form-group">
            <label htmlFor="fileInput" className="input-label">
              Selectați Fișier Media:
            </label>
            <input
              type="file"
              id="fileInput"
              onChange={(e) => setFile(e.target.files[0])}
              accept="image/*,video/*,audio/*"
              className="input-field"
            />
          </div>

          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? "Încărcare..." : "Încărcați"}
          </button>
        </form>
        <div className="footer-controls">
          <button onClick={handleBackClick} className="back-button">
            &larr; Înapoi
          </button>
        </div>
      </div>
      {modalMessage && <Modal message={modalMessage} onClose={closeModal} />}
    </div>
  );
}

export default AddMedia;
