import React, { useState, useEffect } from 'react';

export default function Dashboard({ user }) {
  const [articles, setArticles] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchArticles = async () => {
    try {
      const res = await fetch('/api/articles');
      if (res.ok) {
        const data = await res.json();
        setArticles(data);
      }
    } catch (err) {
      console.error('Erreur chargement articles:', err);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handlePublish = async (e) => {
    e.preventDefault();
    setError('');

    if (!title || !content) {
      setError('Veuillez renseigner le titre et le contenu.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, content }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la publication.');
      }

      setTitle('');
      setContent('');
      fetchArticles();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <div className="card dashboard-card">
        <h2 className="card-title">Bienvenue, {user.email}</h2>
        <p className="card-subtitle">Votre session est protégée par un jeton JWT (cookie HttpOnly).</p>

        {error && <div className="alert-error">{error}</div>}

        <form onSubmit={handlePublish} className="form-group">
          <input
            type="text"
            className="input-field"
            placeholder="Titre"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <textarea
            className="textarea-field"
            placeholder="Contenu"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Publication...' : 'Publier'}
          </button>
        </form>
      </div>

      <div className="articles-section">
        <h3 className="articles-heading">Articles</h3>
        {articles.length === 0 ? (
          <p style={{ color: '#64748b', fontSize: '14px' }}>Aucun article publié pour le moment.</p>
        ) : (
          articles.map((art) => (
            <div key={art.id} className="article-card">
              <h4 className="article-title">{art.title}</h4>
              <p className="article-content">{art.content}</p>
              <span className="article-meta">{art.createdAt}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
