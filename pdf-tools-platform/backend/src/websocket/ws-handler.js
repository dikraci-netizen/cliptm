const { v4: uuidv4 } = require('uuid');

// Connected clients map
const clients = new Map();

function setupWebSocket(wss) {
  wss.on('connection', (ws) => {
    const clientId = uuidv4();
    clients.set(clientId, ws);
    
    // Send client their ID
    ws.send(JSON.stringify({
      type: 'connected',
      clientId,
      timestamp: Date.now()
    }));
    
    ws.on('message', (data) => {
      try {
        const msg = JSON.parse(data);
        handleMessage(ws, clientId, msg);
      } catch (e) {
        ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
      }
    });
    
    ws.on('close', () => {
      clients.delete(clientId);
    });
    
    ws.on('error', () => {
      clients.delete(clientId);
    });
  });
}

function handleMessage(ws, clientId, msg) {
  switch (msg.type) {
    case 'ping':
      ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
      break;
    case 'subscribe_job':
      // Client wants updates for a specific job
      ws.jobSubscriptions = ws.jobSubscriptions || new Set();
      ws.jobSubscriptions.add(msg.jobId);
      break;
    case 'unsubscribe_job':
      if (ws.jobSubscriptions) ws.jobSubscriptions.delete(msg.jobId);
      break;
  }
}

// Broadcast progress to all clients subscribed to a job
function broadcastJobProgress(wss, jobId, data) {
  wss.clients.forEach(client => {
    if (client.readyState === 1) { // WebSocket.OPEN
      if (!client.jobSubscriptions || client.jobSubscriptions.has(jobId)) {
        client.send(JSON.stringify({
          type: 'job_progress',
          jobId,
          ...data,
          timestamp: Date.now()
        }));
      }
    }
  });
}

// Notify specific client
function notifyClient(wss, clientId, data) {
  wss.clients.forEach(client => {
    if (client.readyState === 1) {
      client.send(JSON.stringify(data));
    }
  });
}

module.exports = { setupWebSocket, broadcastJobProgress, notifyClient, clients };
