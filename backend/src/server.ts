import app from './app.js';
import { env } from './config/env.js';
import { setupChatWebSocket } from './websocket/chat.socket.js';

const server = app.listen(env.PORT, () => {
  console.log(`🚀 Isolated Backend server running on http://localhost:${env.PORT}`);
});

setupChatWebSocket(server);

export default server;

