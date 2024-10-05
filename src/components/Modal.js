import React from "react";
import "./Modal.css";

function Modal({ message, onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <p>{message}</p>
        <button onClick={onClose} className="modal-close-button">
          Închide
        </button>
      </div>
    </div>
  );
}

export default Modal;
