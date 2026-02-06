import { WebSocketServer } from 'ws';

let wss = null;
const clients = new Set();

export function initWebSocket(server) {
  wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws) => {
    clients.add(ws);
    console.log('WebSocket client connected. Total:', clients.size);

    ws.on('close', () => {
      clients.delete(ws);
      console.log('WebSocket client disconnected. Total:', clients.size);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      clients.delete(ws);
    });

    // Send welcome message
    ws.send(JSON.stringify({
      type: 'CONNECTED',
      payload: { message: 'Welcome to the $10K Challenge!' },
    }));
  });

  console.log('WebSocket server initialized');
}

export function broadcast(message) {
  if (!wss) return;

  const data = JSON.stringify(message);

  for (const client of clients) {
    if (client.readyState === 1) { // OPEN
      client.send(data);
    }
  }
}

export function getConnectedClients() {
  return clients.size;
}
