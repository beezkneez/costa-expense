import express from 'express';
import pg from 'pg';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.static(join(__dirname, 'dist')));

// Database setup
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS claim_data (
      id INTEGER PRIMARY KEY DEFAULT 1,
      data JSONB NOT NULL DEFAULT '{}',
      updated_at TIMESTAMP DEFAULT NOW(),
      CONSTRAINT single_row CHECK (id = 1)
    )
  `);
  // Seed with empty row if none exists
  await pool.query(`
    INSERT INTO claim_data (id, data) VALUES (1, $1)
    ON CONFLICT (id) DO NOTHING
  `, [JSON.stringify({
    expenses: [],
    documents: [],
    writeup: '',
    claimInfo: {
      airline: '',
      flightNumber: '',
      flightDate: '',
      bagTagNumbers: '',
      referenceNumber: '',
      passengerNames: '',
      description: '',
    },
  })]);
  console.log('Database initialized');
}

// API routes
app.get('/api/data', async (req, res) => {
  try {
    const result = await pool.query('SELECT data FROM claim_data WHERE id = 1');
    res.json(result.rows[0]?.data || {});
  } catch (err) {
    console.error('GET /api/data error:', err);
    res.status(500).json({ error: 'Failed to load data' });
  }
});

app.put('/api/data', async (req, res) => {
  try {
    await pool.query(
      'UPDATE claim_data SET data = $1, updated_at = NOW() WHERE id = 1',
      [JSON.stringify(req.body)]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error('PUT /api/data error:', err);
    res.status(500).json({ error: 'Failed to save data' });
  }
});

// SPA fallback
app.get('{*path}', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});
