import React, { useState, useEffect } from 'react';

export default function Dashboard({ user }) {
  const [articles, setArticles] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentFeedback, setPaymentFeedback] = useState(null);

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

    // Détection du retour après redirection Stripe
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'success') {
      setPaymentFeedback({ type: 'success', text: '✅ Paiement Stripe réussi ! Merci pour votre achat.' });
    } else if (params.get('payment') === 'cancelled') {
      setPaymentFeedback({ type: 'error', text: '❌ Paiement Stripe annulé.' });
    }
  }, []);

  const handleStripePayment = async () => {
    setPaymentLoading(true);
    setPaymentFeedback(null);
    try {
      const response = await fetch('/api/payment/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user?.email }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'initialisation du paiement.');
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setPaymentFeedback({ type: 'error', text: err.message });
    } finally {
      setPaymentLoading(false);
    }
  };

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
        <p className="card-subtitle">Votre session est protégée par un cookie HttpOnly.</p>

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

      <div className="card dashboard-card">
        <h3 className="card-title">Paiement Stripe (Test)</h3>
        <p className="card-subtitle">Tester un paiement unique de 5,00 € via Stripe Checkout.</p>

        {paymentFeedback && (
          <div className={paymentFeedback.type === 'success' ? 'alert-success' : 'alert-error'}>
            {paymentFeedback.text}
          </div>
        )}

        <button
          type="button"
          onClick={handleStripePayment}
          className="btn-primary"
          disabled={paymentLoading}
          style={{ backgroundColor: '#635bff', marginTop: '0' }}
        >
          {paymentLoading ? 'Initialisation...' : '💳 Payer 5,00 € avec Stripe'}
        </button>

        <div style={{ marginTop: '12px', fontSize: '12px', color: '#64748b', background: '#f8fafc', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
          <strong>Cartes de test Stripe :</strong><br />
          • Débit (Visa) : <code style={{ color: '#0f172a' }}>4000 0566 5566 5556</code><br />
          • Standard (Visa) : <code style={{ color: '#0f172a' }}>4242 4242 4242 4242</code><br />
          • Exp: <em>date future (ex: 12/28)</em> &bull; CVC: <em>123</em>
        </div>
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
