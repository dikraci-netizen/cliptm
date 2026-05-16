const { v4: uuidv4 } = require('uuid');
const { EventEmitter } = require('events');

class JobQueue extends EventEmitter {
  constructor() {
    super();
    this.jobs = new Map();
    this.queue = [];
    this.activeJobs = 0;
    this.maxConcurrent = parseInt(process.env.MAX_CONCURRENT_JOBS) || 5;
    this.history = [];
    this.maxHistory = 100;
  }

  createJob(type, data, options = {}) {
    const job = {
      id: uuidv4(),
      type,
      data,
      status: 'queued',
      progress: 0,
      createdAt: Date.now(),
      startedAt: null,
      completedAt: null,
      result: null,
      error: null,
      priority: options.priority || 'normal',
      retries: 0,
      maxRetries: options.maxRetries || 2
    };

    this.jobs.set(job.id, job);
    this.queue.push(job.id);
    this.emit('job_created', job);
    this.processNext();
    return job;
  }

  async processNext() {
    if (this.activeJobs >= this.maxConcurrent || this.queue.length === 0) return;

    // Sort by priority
    this.queue.sort((a, b) => {
      const jobA = this.jobs.get(a);
      const jobB = this.jobs.get(b);
      const priorityMap = { high: 3, normal: 2, low: 1 };
      return (priorityMap[jobB?.priority] || 2) - (priorityMap[jobA?.priority] || 2);
    });

    const jobId = this.queue.shift();
    const job = this.jobs.get(jobId);
    if (!job) return;

    this.activeJobs++;
    job.status = 'processing';
    job.startedAt = Date.now();
    this.emit('job_started', job);
  }

  updateProgress(jobId, progress, message) {
    const job = this.jobs.get(jobId);
    if (!job) return;
    job.progress = Math.min(progress, 100);
    job.statusMessage = message;
    this.emit('job_progress', job);
  }

  completeJob(jobId, result) {
    const job = this.jobs.get(jobId);
    if (!job) return;
    job.status = 'completed';
    job.progress = 100;
    job.completedAt = Date.now();
    job.result = result;
    job.duration = job.completedAt - job.startedAt;
    this.activeJobs--;
    this.emit('job_completed', job);
    this.addToHistory(job);
    this.processNext();
    return job;
  }

  failJob(jobId, error) {
    const job = this.jobs.get(jobId);
    if (!job) return;
    
    if (job.retries < job.maxRetries) {
      job.retries++;
      job.status = 'queued';
      this.activeJobs--;
      this.queue.push(jobId);
      this.emit('job_retry', job);
      this.processNext();
    } else {
      job.status = 'failed';
      job.completedAt = Date.now();
      job.error = error;
      job.duration = job.completedAt - job.startedAt;
      this.activeJobs--;
      this.emit('job_failed', job);
      this.addToHistory(job);
      this.processNext();
    }
    return job;
  }

  addToHistory(job) {
    this.history.unshift({
      id: job.id,
      type: job.type,
      status: job.status,
      duration: job.duration,
      completedAt: job.completedAt
    });
    if (this.history.length > this.maxHistory) this.history.pop();
  }

  getJob(jobId) {
    return this.jobs.get(jobId);
  }

  getStats() {
    let queued = 0, processing = 0, completed = 0, failed = 0;
    this.jobs.forEach(job => {
      if (job.status === 'queued') queued++;
      else if (job.status === 'processing') processing++;
      else if (job.status === 'completed') completed++;
      else if (job.status === 'failed') failed++;
    });
    return { queued, processing, completed, failed, total: this.jobs.size };
  }

  getHistory(limit = 20) {
    return this.history.slice(0, limit);
  }

  // Clean old completed jobs
  cleanup() {
    const maxAge = 3600000; // 1 hour
    const now = Date.now();
    for (const [id, job] of this.jobs) {
      if ((job.status === 'completed' || job.status === 'failed') && 
          now - job.completedAt > maxAge) {
        this.jobs.delete(id);
      }
    }
  }
}

module.exports = { JobQueue };
