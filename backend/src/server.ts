import app from './app.js';
import { env } from './config/env.js';
import { setupChatWebSocket } from './websocket/chat.socket.js';
import { initDatabase } from './db/index.js';

// Connect to PostgreSQL (falls back to mock if Docker is not yet up)
await initDatabase();

const server = app.listen(env.PORT, () => {
  console.log(`🚀 Isolated Backend server running on http://localhost:${env.PORT}`);
});

setupChatWebSocket(server);

export default server;

