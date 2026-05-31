import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./SearchMedia.css";
import "./SearchMediaModal.css";
import useLogout from "./useLogout";

const PAGE_SIZE_OPTIONS = [9, 18, 30, 60];

function SearchMedia() {
  const [personQuery, setPersonQuery] = useState(""); // "după persoană sau descriere"
  const [storyQuery, setStoryQuery] = useState(""); // "după poveste"
  const [searchMode, setSearchMode] = useState("all"); // "all" | "person" | "story"
  const [activeQuery, setActiveQuery] = useState(""); // the submitted term currently driving results
  const [media, setMedia] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(9);
  const [pageInput, setPageInput] = useState(""); // "go to page" field
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [mediaToDelete, setMediaToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [mediaLoadingStates, setMediaLoadingStates] = useState({}); // State to track loading for each media
  const logout = useLogout();
  const navigate = useNavigate();

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
        credentials: "include", // Send credentials like cookies
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
          const fileUrl = item.fileUrl;

          if (!fileUrl) {
            console.error("FileUrl is undefined for media item:", item);
          }

          return {
            ...item,
            FileUrl: fileUrl,
          };
        });

        setMedia(mediaWithFileData);
        setTotalPages(data.totalPages);
      } else {
        throw new Error("Invalid data format received.");
      }
    } catch (error) {
      console.error("Error fetching media:", error);
      alert(
        "Eroare la preluarea fișierelor media. Vă rugăm să încercați din nou mai târziu."
      );
      navigate("/login");
    } finally {
      setIsFetching(false);
    }
  };

  // Build the request URL for the currently active search mode.
  const buildUrl = () => {
    const base = process.env.REACT_APP_BACKEND_URL;
    const paging = `pageNumber=${pageNumber}&pageSize=${pageSize}`;

    if (searchMode === "person" && activeQuery) {
      return `${base}/api/media/search?person=${encodeURIComponent(
        activeQuery
      )}&${paging}`;
    }
    if (searchMode === "story" && activeQuery) {
      return `${base}/api/media/search/story?story=${encodeURIComponent(
        activeQuery
      )}&${paging}`;
    }
    return `${base}/api/media?${paging}`;
  };

  // Refetch whenever the page, page size, or active search changes.
  useEffect(() => {
    fetchMedia(buildUrl());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNumber, pageSize, searchMode, activeQuery]);

  const handlePersonSearch = () => {
    const query = personQuery.trim();
    setStoryQuery("");
    setSearchMode(query ? "person" : "all");
    setActiveQuery(query);
    setPageNumber(1);
  };

  const handleStorySearch = () => {
    const query = storyQuery.trim();
    setPersonQuery("");
    setSearchMode(query ? "story" : "all");
    setActiveQuery(query);
    setPageNumber(1);
  };

  const handlePageChange = (newPageNumber) => {
    if (newPageNumber > 0 && newPageNumber <= totalPages) {
      setPageNumber(newPageNumber);
    }
  };

  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setPageNumber(1); // avoid landing on a now-out-of-range page
  };

  const handleGoToPage = () => {
    const target = parseInt(pageInput, 10);
    if (!Number.isNaN(target)) {
      handlePageChange(target);
    }
    setPageInput("");
  };

  const handleMediaClick = (mediaItem) => {
    if (mediaItem) {
      setSelectedMedia(mediaItem);
    }
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
        `${process.env.REACT_APP_BACKEND_URL}/api/media/${mediaToDelete}`,
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
        alert("Ștergerea fișierului media a eșuat.");
      }
    } catch (error) {
      console.error("Failed to delete media:", error);
      alert(
        "Ștergerea fișierului media a eșuat. Vă rugăm să verificați conexiunea la internet și să încercați din nou."
      );
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

  // Function to set loading state for a media item
  const setLoadingState = (id, isLoading) => {
    setMediaLoadingStates((prevStates) => ({
      ...prevStates,
      [id]: isLoading,
    }));
  };

  return (
    <div className="search-media-container">
      <div className="header">
        <h3>Căutare Fișiere Media</h3>
      </div>
      <div className="search-bar-container">
        <input
          type="text"
          placeholder="Caută după persoană sau descriere"
          value={personQuery}
          onChange={(e) => setPersonQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handlePersonSearch()}
          className="search-input"
        />
        <button onClick={handlePersonSearch} className="search-button">
          Caută după persoană
        </button>
      </div>
      <div className="search-bar-container">
        <input
          type="text"
          placeholder="Caută după cuvinte din poveste"
          value={storyQuery}
          onChange={(e) => setStoryQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleStorySearch()}
          className="search-input"
        />
        <button onClick={handleStorySearch} className="search-button">
          Caută după poveste
        </button>
      </div>

      {isFetching ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Se încarcă fișiere media...</p>
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
                  <strong>Persoane:</strong>{" "}
                  {item.persons.join(", ").length > 50
                    ? `${item.persons.join(", ").substring(0, 50)}...`
                    : item.persons.join(", ")}
                </p>

                {mediaLoadingStates[item.id] ? (
                  <div className="loading-spinner"></div> // Spinner while loading
                ) : null}

                {item.fileType.startsWith("image/") && (
                  <img
                    src={item.FileUrl}
                    alt={item.description}
                    className="media-thumbnail"
                    loading="lazy" // defer off-screen images so large pages stay smooth
                    onLoad={() => setLoadingState(item.id, false)} // Set loading to false when image loads
                    onError={(e) => {
                      console.error(
                        `Eroare la încărcarea imaginii: ${e.target.src}`
                      );
                      setLoadingState(item.id, false); // Set loading to false on error
                    }}
                    onLoadStart={() => setLoadingState(item.id, true)} // Set loading to true when image starts loading
                  />
                )}

                {item.fileType.startsWith("video/") && (
                  <video
                    controls
                    className="media-thumbnail"
                    preload="auto"
                    onLoadStart={() => setLoadingState(item.id, true)} // Set loading to true when video starts loading
                    onCanPlay={() => setLoadingState(item.id, false)} // Set loading to false when video can play
                    onError={(e) => {
                      console.error(
                        `Eroare la încărcarea videoclipului: ${e.target.src}`
                      );
                      setLoadingState(item.id, false); // Set loading to false on error
                    }}
                  >
                    <source src={item.FileUrl} type={item.fileType} />
                    Browser-ul dumneavoastră nu suportă elementul video.
                  </video>
                )}

                {item.fileType.startsWith("audio/") && (
                  <audio
                    controls
                    className="audio-thumbnail"
                    preload="auto"
                    onLoadStart={() => setLoadingState(item.id, true)} // Set loading to true when audio starts loading
                    onCanPlay={() => setLoadingState(item.id, false)} // Set loading to false when audio can play
                    onError={(e) => {
                      console.error(
                        `Eroare la încărcarea fișierului audio: ${e.target.src}`
                      );
                      setLoadingState(item.id, false); // Set loading to false on error
                    }}
                  >
                    <source src={item.FileUrl} type={item.fileType} />
                    Browser-ul dumneavoastră nu suportă elementul audio.
                  </audio>
                )}

                <p>
                  <strong>Descriere:</strong>{" "}
                  {item.description.length > 50
                    ? `${item.description.substring(0, 50)}...`
                    : item.description}
                </p>
                <p>
                  <strong>Poveste:</strong>{" "}
                  {item.story && item.story.length > 50
                    ? `${item.story.substring(0, 50)}...`
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
            onClick={() => handlePageChange(1)}
            disabled={pageNumber === 1}
          >
            &laquo; Prima
          </button>
          <button
            onClick={() => handlePageChange(pageNumber - 1)}
            disabled={pageNumber === 1}
          >
            Anterior
          </button>
          <span>
            Pagina {pageNumber} din {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(pageNumber + 1)}
            disabled={pageNumber === totalPages}
          >
            Următor
          </button>
          <button
            onClick={() => handlePageChange(totalPages)}
            disabled={pageNumber === totalPages}
          >
            Ultima &raquo;
          </button>
        </div>

        <div className="pagination-tools">
          <div className="go-to-page">
            <input
              type="number"
              min="1"
              max={totalPages}
              value={pageInput}
              placeholder="Pagina"
              onChange={(e) => setPageInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleGoToPage()}
              className="go-to-page-input"
            />
            <button onClick={handleGoToPage} className="go-to-page-button">
              Mergi
            </button>
          </div>

          <label className="page-size-control">
            Pe pagină:
            <select value={pageSize} onChange={handlePageSizeChange}>
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {selectedMedia && selectedMedia.fileType && (
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
                <strong>Persoane:</strong> {selectedMedia.persons.join(", ")}
              </div>
            </div>

            {selectedMedia.fileType.startsWith("image/") && (
              <img
                src={selectedMedia.FileUrl}
                alt={selectedMedia.description}
                className="media-full"
                onError={(e) =>
                  console.error(
                    `Eroare la încărcarea imaginii: ${e.target.src}`
                  )
                }
              />
            )}

            {selectedMedia.fileType.startsWith("video/") && (
              <video
                controls
                className="media-full"
                preload="auto"
                onError={(e) =>
                  console.error(
                    `Eroare la încărcarea videoclipului: ${e.target.src}`
                  )
                }
              >
                <source
                  src={selectedMedia.FileUrl}
                  type={selectedMedia.fileType}
                />
                Browser-ul dumneavoastră nu suportă elementul video.
              </video>
            )}

            {selectedMedia.fileType.startsWith("audio/") && (
              <audio
                controls
                className="media-full-audio"
                preload="auto"
                onError={(e) =>
                  console.error(
                    `Eroare la încărcarea fișierului audio: ${e.target.src}`
                  )
                }
              >
                <source
                  src={selectedMedia.FileUrl}
                  type={selectedMedia.fileType}
                />
                Browser-ul dumneavoastră nu suportă elementul audio.
              </audio>
            )}

            <div className="search-media-modal-description-container">
              <div className="search-media-modal-description">
                <strong>Descriere:</strong>{" "}
                <span style={{ fontWeight: "normal" }}>
                  {selectedMedia.description}
                </span>
              </div>
            </div>
            <div className="search-media-modal-story-container">
              <div className="search-media-modal-story">
                <strong>Poveste:</strong>{" "}
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
            <p>Sunteți sigur că doriți să ștergeți acest fișier media?</p>
            <button className="confirm-button" onClick={deleteMedia}>
              Da
            </button>
            <button className="cancel-button" onClick={cancelDelete}>
              Nu
            </button>
          </div>
        </div>
      )}

      <button onClick={handleBackClick} className="back-button">
        &larr; Înapoi
      </button>
    </div>
  );
}

export default SearchMedia;
