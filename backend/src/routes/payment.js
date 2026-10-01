import express from 'express';
import Stripe from 'stripe';
import dotenv from 'dotenv';

const router = express.Router();

router.post('/create-checkout-session', async (req, res) => {
  try {
    // Rechargement dynamique du .env pour prendre en compte les changements sans redémarrer
    dotenv.config({ override: true });

    const stripeKey = process.env.STRIPE_SECRET_KEY ? process.env.STRIPE_SECRET_KEY.trim() : '';

    if (!stripeKey || stripeKey === 'sk_test_placeholder') {
      return res.status(400).json({
        error: 'Clé Stripe non configurée. Veuillez renseigner STRIPE_SECRET_KEY dans backend/.env'
      });
    }

    const stripe = new Stripe(stripeKey);
    const origin = req.headers.origin || 'http://localhost:5173';

    // Création d'une session Stripe Checkout en mode paiement unique ('payment')
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'Paiement Unique de Test',
              description: 'Test d\'intégration Stripe SecureBlog',
            },
            unit_amount: 500, // 5,00 € (montant en centimes)
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/?payment=success`,
      cancel_url: `${origin}/?payment=cancelled`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Erreur Stripe Checkout:', error);
    res.status(500).json({ error: error.message || 'Erreur lors de la création de la session Stripe' });
  }
});

export default router;
