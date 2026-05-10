import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Serve static files from the React app's dist folder
app.use(express.static(path.join(__dirname, 'dist')));

// Admin Password (in a real app, this would be an env var)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'vibes2026';

// API route for admin authentication
app.post('/api/admin/auth', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    res.json({ success: true, token: 'fake-jwt-token' });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

// Since Gemini should be called from the frontend according to guidelines,
// these routes are mainly for potential server-side logic or logging if needed.
// For now, most logic is handled by Firebase on the frontend.

// All other requests serve the React index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
