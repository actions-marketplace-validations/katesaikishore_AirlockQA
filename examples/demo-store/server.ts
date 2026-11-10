import express from 'express';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const app = express();
const PORT = 3900;
// Demo only: accept the same value the runner substitutes for the phantom token.
// qafind.config.json reads STRIPE_SECRET_KEY (realFromEnv) and falls back to this placeholder.
const realStripeSecret = () => process.env.STRIPE_SECRET_KEY || 'REPLACE_ME_STRIPE_SECRET_KEY';

app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, 'public')));

// Stripe Checkout API
app.post('/api/checkout', (req, res) => {
  const authHeader = req.headers.authorization || '';
  const expectedAuth = `Bearer ${realStripeSecret()}`;

  // If phantom token arrived without proxy edge substitution, reject!
  if (authHeader.includes('ph_sec_')) {
    return res.status(401).json({
      error: 'UNAUTHORIZED_PHANTOM_TOKEN_RECEIVED',
      message: 'Server received raw phantom token. Real Stripe credentials were not supplied!',
      receivedHeader: authHeader,
    });
  }

  if (authHeader !== expectedAuth) {
    return res.status(401).json({
      error: 'INVALID_CREDENTIALS',
      message: 'Invalid or missing Stripe Secret Key.',
    });
  }

  // Payment successful
  return res.json({
    success: true,
    message: 'Stripe charge created successfully via Real In-Flight Credentials',
    chargeId: 'ch_' + Math.random().toString(36).substring(2, 10),
    amount: req.body.amount || 4000,
  });
});

// Sensitive / Destructive Endpoint: Refund
app.post('/api/admin/refund', (req, res) => {
  // If request made it past proxy, this is a policy breach!
  res.json({
    warning: 'Destructive operation executed: Refund processed',
    chargeId: req.body.chargeId,
  });
});

// Sensitive / Destructive Endpoint: Wipe Data
app.post('/api/admin/wipe-data', (req, res) => {
  res.json({
    warning: 'Destructive operation executed: Database wiped',
  });
});

export function startDemoServer(port = PORT): Promise<import('http').Server> {
  return new Promise((resolve) => {
    const server = app.listen(port, () => {
      console.log(`Demo Store Server listening on http://localhost:${port}`);
      resolve(server);
    });
  });
}

// Auto-start if executed directly
if (process.argv[1]?.endsWith('server.ts') || process.argv[1]?.endsWith('server.js')) {
  startDemoServer();
}

