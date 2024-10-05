import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./SearchMedia.css";
import "./SearchMediaModal.css";
import useLogout from "./useLogout";

function SearchMedia() {
  const [searchQuery, setSearchQuery] = useState("");
  const [media, setMedia] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [mediaToDelete, setMediaToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [lastSearchQuery, setLastSearchQuery] = useState("");
  const logout = useLogout();
  const navigate = useNavigate();
  const pageSize = 9;

  useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem("user"));
    if (user && user.isAdmin) {
      setIsAdmin(true);
    }
  }, []);

  const fetchMedia = async (url) => {
    if (isFetching) return;
    setIsFetching(true);

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          navigate("/login");
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }

      const data = await response.json();

      if (data && data.items) {
        const mediaWithFileData = data.items.map((item) => {
          const fileUrl = item.fileUrl; // Use the proxy file URL
          console.log("Processing media item:", item);
          console.log("Constructed FileUrl:", fileUrl);

          if (!fileUrl) {
            console.error("FileUrl is undefined for media item:", item);
          }

          return {
            ...item,
            FileUrl: fileUrl,
          };
        });

        console.log("Processed media data:", mediaWithFileData);
        setMedia(mediaWithFileData);
        setTotalPages(data.totalPages);
      } else {
        throw new Error("Invalid data format received.");
      }
    } catch (error) {
      console.error("Error fetching media:", error);
      alert("Eroare la preluarea datelor media. Încercați din nou mai târziu.");
      navigate("/login");
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    const query = searchQuery.trim();
    if (!query) {
      fetchMedia(
        `https://localhost:7029/api/media?pageNumber=${pageNumber}&pageSize=${pageSize}`
      );
    } else {
      const url = `https://localhost:7029/api/media/search?person=${encodeURIComponent(
        query
      )}&pageNumber=${pageNumber}&pageSize=${pageSize}`;
      fetchMedia(url);
    }
  }, [pageNumber]);

  const handleSearch = async () => {
    const query = searchQuery.trim();

    if (query !== lastSearchQuery) {
      setPageNumber(1);
      setLastSearchQuery(query);
    }

    const url = query
      ? `https://localhost:7029/api/media/search?person=${encodeURIComponent(
          query
        )}&pageNumber=1&pageSize=${pageSize}`
      : `https://localhost:7029/api/media?pageNumber=1&pageSize=${pageSize}`;

    fetchMedia(url);
  };

  const handlePageChange = (newPageNumber) => {
    if (newPageNumber > 0 && newPageNumber <= totalPages) {
      setPageNumber(newPageNumber);
    }
  };

  const handleMediaClick = (mediaItem) => {
    setSelectedMedia(mediaItem);
  };

  const closeModal = () => {
    setSelectedMedia(null);
  };

  const confirmDeleteMedia = (mediaItemId) => {
    setMediaToDelete(mediaItemId);
    setShowDeleteModal(true);
  };

  const deleteMedia = async () => {
    if (!mediaToDelete) return;
    setIsFetching(true);
    try {
      const response = await fetch(
        `https://localhost:7029/api/media/${mediaToDelete}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (response.ok) {
        setMedia((prevMedia) =>
          prevMedia.filter((item) => item.id !== mediaToDelete)
        );
        setShowDeleteModal(false);
        setMediaToDelete(null);
      } else {
        alert("Failed to delete media.");
      }
    } catch (error) {
      console.error("Failed to delete media:", error);
      alert("Failed to delete media. Please check your network and try again.");
    } finally {
      setIsFetching(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setMediaToDelete(null);
  };

  const handleBackClick = () => {
    navigate(isAdmin ? "/admin" : "/user");
  };

  return (
    <div className="search-media-container">
      <div className="header">
        <h3>Search Media</h3>
      </div>
      <div className="search-bar-container">
        <input
          type="text"
          placeholder="Search by person..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        <button onClick={handleSearch} className="search-button">
          Search
        </button>
      </div>

      {isFetching ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading media...</p>
        </div>
      ) : (
        <div className="media-list">
          {media.map((item, index) => (
            <div key={item.id} className="media-item">
              <div
                className="media-content"
                onClick={() => handleMediaClick(item)}
              >
                <p>
                  <strong>Persons:</strong>{" "}
                  {item.persons.join(", ").length > 100
                    ? item.persons.join(", ").substring(0, 100) + "..."
                    : item.persons.join(", ")}
                </p>
                {item.fileType.startsWith("image/") && (
                  <img
                    src={item.FileUrl}
                    alt={item.description}
                    className="media-thumbnail"
                    onError={(e) =>
                      console.error(`Error loading image: ${e.target.src}`)
                    }
                  />
                )}
                {item.fileType.startsWith("video/") && (
                  <video
                    controls
                    className="media-thumbnail"
                    preload="auto"
                    onError={(e) =>
                      console.error(`Error loading video: ${e.target.src}`)
                    }
                  >
                    <source src={item.FileUrl} type={item.fileType} />
                    Your browser does not support the video tag.
                  </video>
                )}
                {item.fileType.startsWith("audio/") && (
                  <audio
                    controls
                    className="audio-thumbnail"
                    preload="auto"
                    onError={(e) =>
                      console.error(`Error loading audio: ${e.target.src}`)
                    }
                  >
                    <source src={item.FileUrl} type={item.fileType} />
                    Your browser does not support the audio tag.
                  </audio>
                )}
                <p>
                  <strong>Description:</strong>{" "}
                  {item.description.length > 100
                    ? item.description.substring(0, 100) + "..."
                    : item.description}
                </p>
                <p>
                  <strong>Story:</strong>{" "}
                  {item.story && item.story.length > 100
                    ? item.story.substring(0, 100) + "..."
                    : item.story}
                </p>
              </div>
              {isAdmin && (
                <button
                  className="delete-button"
                  onClick={() => confirmDeleteMedia(item.id)}
                >
                  &times;
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="footer-controls">
        <div className="pagination-controls">
          <button
            onClick={() => handlePageChange(pageNumber - 1)}
            disabled={pageNumber === 1}
          >
            Previous
          </button>
          <span>
            Page {pageNumber} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(pageNumber + 1)}
            disabled={pageNumber === totalPages}
          >
            Next
          </button>
        </div>
      </div>

      {selectedMedia && (
        <div className="search-media-modal-overlay" onClick={closeModal}>
          <div
            className="search-media-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="search-media-modal-close" onClick={closeModal}>
              &times;
            </button>
            <div className="search-media-modal-persons-container">
              <div className="search-media-modal-persons">
                <strong>Persons:</strong> {selectedMedia.persons.join(", ")}
              </div>
            </div>
            {selectedMedia.fileType.startsWith("image/") && (
              <img
                src={selectedMedia.FileUrl}
                alt={selectedMedia.description}
                className="media-full"
                onError={(e) =>
                  console.error(`Error loading image: ${e.target.src}`)
                }
              />
            )}
            {selectedMedia.fileType.startsWith("video/") && (
              <video
                controls
                className="media-full"
                preload="auto"
                onError={(e) =>
                  console.error(`Error loading video: ${e.target.src}`)
                }
              >
                <source
                  src={selectedMedia.FileUrl}
                  type={selectedMedia.fileType}
                />
                Your browser does not support the video tag.
              </video>
            )}
            {selectedMedia.fileType.startsWith("audio/") && (
              <audio
                controls
                className="media-full-audio"
                preload="auto"
                onError={(e) =>
                  console.error(`Error loading audio: ${e.target.src}`)
                }
              >
                <source
                  src={selectedMedia.FileUrl}
                  type={selectedMedia.fileType}
                />
                Your browser does not support the audio tag.
              </audio>
            )}
            <div className="search-media-modal-description-container">
              <div className="search-media-modal-description">
                <strong>Description:</strong>{" "}
                <span style={{ fontWeight: "normal" }}>
                  {selectedMedia.description}
                </span>
              </div>
            </div>
            <div className="search-media-modal-story-container">
              <div className="search-media-modal-story">
                <strong>Story:</strong>{" "}
                <span style={{ fontWeight: "normal" }}>
                  {selectedMedia.story}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="confirmation-modal-overlay">
          <div className="confirmation-modal-content">
            <p>Are you sure you want to delete this media item?</p>
            <button className="confirm-button" onClick={deleteMedia}>
              Yes
            </button>
            <button className="cancel-button" onClick={cancelDelete}>
              No
            </button>
          </div>
        </div>
      )}

      <button onClick={handleBackClick} className="back-button">
        &larr; Back
      </button>
    </div>
  );
}

export default SearchMedia;
