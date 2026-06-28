import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const DB_FILE = path.join(__dirname, 'database.json');

app.use(cors());
app.use(express.json());

// Initialize database file if it doesn't exist
async function initDb() {
  try {
    await fs.access(DB_FILE);
  } catch {
    await fs.writeFile(DB_FILE, JSON.stringify([], null, 2));
  }
}

// RSVP API endpoint
app.post('/api/rsvp', async (req, res) => {
  try {
    const { name, phone, email, guests, attending, message } = req.body;

    if (!name || !phone || !email || !guests || attending === undefined) {
      return res.status(400).json({ error: 'Required fields are missing' });
    }

    const data = await fs.readFile(DB_FILE, 'utf8');
    const rsvps = JSON.parse(data);

    const newRsvp = {
      id: Date.now().toString(),
      name,
      phone,
      email,
      guests: parseInt(guests, 10),
      attending: attending === 'yes',
      message: message || '',
      timestamp: new Date().toISOString()
    };

    rsvps.push(newRsvp);
    await fs.writeFile(DB_FILE, JSON.stringify(rsvps, null, 2));

    res.status(201).json({ success: true, message: 'RSVP submitted successfully' });
  } catch (error) {
    console.error('Error saving RSVP:', error);
    res.status(500).json({ error: 'Failed to save RSVP' });
  }
});

// Serve built frontend in production
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Run server initialization
initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize DB:', err);
});
