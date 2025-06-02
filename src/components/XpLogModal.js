// src/components/XpLogModal.js
import React from 'react';
import './XpLogModal.css'; // We'll create this CSS file next

const XpLogModal = ({ xpLog, onClose }) => {
  if (!xpLog) return null; // Don't render if no log data

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close-button" onClick={onClose}>
          &times;
        </button>
        <h3>📊 XP Log</h3>
        {xpLog.length === 0 ? (
          <p className="xp-log-empty">No XP earned yet.</p>
        ) : (
          <ul className="xp-log-list">
            {xpLog.map(entry => (
              <li key={entry.id}>
                <span className="timestamp">[{entry.timestamp}]</span> +{entry.amount} XP ({entry.source})
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default XpLogModal;