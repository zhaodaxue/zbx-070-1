import app from './app.js';
import { initDatabase } from './db/index.js';

const PORT = 3001;

async function start() {
  try {
    await initDatabase();
    console.log('[DB] SQLite initialized');
    app.listen(PORT, () => {
      console.log(`[Server] API running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
