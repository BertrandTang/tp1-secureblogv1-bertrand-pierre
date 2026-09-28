import React from 'react';

export default function Header({ user, onLogout }) {
  return (
    <header className="header-bar">
      <div className="brand-section">
        <span className="subtitle-tag">FIL ROUGE AUTHENTIFICATION</span>
        <div className="brand-title-group">
          <h1 className="brand-title">SecureBlog</h1>
          <span className="brand-version">v1 — Session</span>
        </div>
      </div>
      {user && (
        <button onClick={onLogout} className="btn-logout">
          Se déconnecter
        </button>
      )}
    </header>
  );
}
