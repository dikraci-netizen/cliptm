// ============ WEBSOCKET CLIENT ============
class PDFWebSocket {
  constructor() {
    this.ws = null;
    this.clientId = null;
    this.connected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.listeners = new Map();
    this.connect();
  }

  connect() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const url = `${protocol}//${window.location.host}/ws`;
    
    try {
      this.ws = new WebSocket(url);
      
      this.ws.onopen = () => {
        this.connected = true;
        this.reconnectAttempts = 0;
        this.emit('connected');
        console.log('[WS] Connected to server');
      };
      
      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (e) {
          console.error('[WS] Parse error:', e);
        }
      };
      
      this.ws.onclose = () => {
        this.connected = false;
        this.emit('disconnected');
        this.attemptReconnect();
      };
      
      this.ws.onerror = (err) => {
        console.warn('[WS] Connection error - will retry');
      };
    } catch (e) {
      console.warn('[WS] Cannot connect:', e.message);
    }
  }

  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) return;
    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    setTimeout(() => this.connect(), delay);
  }

  handleMessage(data) {
    switch (data.type) {
      case 'connected':
        this.clientId = data.clientId;
        break;
      case 'job_progress':
        this.emit('job_progress', data);
        break;
      case 'pong':
        break;
      default:
        this.emit(data.type, data);
    }
  }

  subscribeJob(jobId) {
    this.send({ type: 'subscribe_job', jobId });
  }

  unsubscribeJob(jobId) {
    this.send({ type: 'unsubscribe_job', jobId });
  }

  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  on(event, callback) {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    const list = this.listeners.get(event);
    if (list) {
      const idx = list.indexOf(callback);
      if (idx > -1) list.splice(idx, 1);
    }
  }

  emit(event, data) {
    const list = this.listeners.get(event);
    if (list) list.forEach(cb => cb(data));
  }

  // Heartbeat
  startHeartbeat() {
    setInterval(() => {
      if (this.connected) this.send({ type: 'ping' });
    }, 30000);
  }
}

// Global WebSocket instance
const wsClient = new PDFWebSocket();
wsClient.startHeartbeat();

// Listen for job progress updates
wsClient.on('job_progress', (data) => {
  if (typeof updateJobProgress === 'function') {
    updateJobProgress(data);
  }
});
