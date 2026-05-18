// ============ APP STATE ============
let currentTool = null;
let selectedFiles = [];
let signatureFile = null;
let currentTheme = localStorage.getItem('pdftools_theme') || 'light';

// ============ INITIALIZATION ============
document.addEventListener('DOMContentLoaded', () => {
  applyTheme(currentTheme);
  applyTranslations();
  renderToolsGrid();
  setupKeyboardShortcuts();
  setTimeout(() => document.getElementById('pageLoader').classList.add('hidden'), 800);
});

// ============ THEME ============
function toggleTheme() {
  currentTheme = currentTheme === 'light' ? 'dark' : 'light';
  applyTheme(currentTheme);
  localStorage.setItem('pdftools_theme', currentTheme);
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const btn = document.getElementById('themeBtn');
  if (btn) btn.innerHTML = theme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
}

// ============ KEYBOARD SHORTCUTS ============
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      openCommandPalette();
    }
    if (e.key === 'Escape') {
      closeCommandPalette();
    }
  });
}

// ============ COMMAND PALETTE ============
function openCommandPalette() {
  const palette = document.getElementById('commandPalette');
  palette.classList.add('active');
  document.getElementById('commandInput').focus();
  renderCommandResults('');
}

function closeCommandPalette() {
  document.getElementById('commandPalette').classList.remove('active');
}

function filterCommandPalette(query) {
  renderCommandResults(query);
}

function renderCommandResults(query) {
  const results = document.getElementById('commandResults');
  const filtered = query ? TOOLS.filter(t =>
    t.name.toLowerCase().includes(query.toLowerCase()) ||
    t.description.toLowerCase().includes(query.toLowerCase()) ||
    (t.nameEn && t.nameEn.toLowerCase().includes(query.toLowerCase()))
  ) : TOOLS;

  results.innerHTML = filtered.slice(0, 10).map(tool => `
    <div class="command-item" onclick="closeCommandPalette(); openTool('${tool.id}')">
      <div class="cmd-icon tool-icon ${tool.color}">${tool.icon ? `<i class="${tool.icon}"></i>` : ''}</div>
      <div class="cmd-info">
        <h4>${tool.name}</h4>
        <p>${tool.description}</p>
      </div>
    </div>
  `).join('');
}

// ============ TOOLS GRID ============
function renderToolsGrid(filter = 'all') {
  const grid = document.getElementById('toolsGrid');
  const filtered = filter === 'all' ? TOOLS : TOOLS.filter(t => t.category === filter);
  grid.innerHTML = filtered.map(tool => `
    <div class="tool-card" onclick="openTool('${tool.id}')">
      ${tool.badge ? `<span class="tool-badge badge-${tool.badge.toLowerCase()}">${tool.badge}</span>` : ''}
      <div class="tool-icon ${tool.color}"><i class="${tool.icon}"></i></div>
      <h3>${tool.name}</h3>
      <p>${tool.description}</p>
    </div>
  `).join('');
}

function filterTools(category) {
  document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
  event.target.closest('.category-btn').classList.add('active');
  renderToolsGrid(category);
}

function searchTools(query) {
  const grid = document.getElementById('toolsGrid');
  if (!query) { renderToolsGrid(); return; }
  const filtered = TOOLS.filter(t =>
    t.name.toLowerCase().includes(query.toLowerCase()) ||
    t.description.toLowerCase().includes(query.toLowerCase()) ||
    (t.nameEn && t.nameEn.toLowerCase().includes(query.toLowerCase()))
  );
  grid.innerHTML = filtered.map(tool => `
    <div class="tool-card" onclick="openTool('${tool.id}')">
      ${tool.badge ? `<span class="tool-badge badge-${tool.badge.toLowerCase()}">${tool.badge}</span>` : ''}
      <div class="tool-icon ${tool.color}"><i class="${tool.icon}"></i></div>
      <h3>${tool.name}</h3>
      <p>${tool.description}</p>
    </div>
  `).join('');
}

// ============ NAVIGATION ============
function showHome() {
  ['hero', 'tools', 'features'].forEach(id => { const el = document.getElementById(id); if (el) el.style.display = ''; });
  ['workspace', 'batchSection', 'dashboardSection'].forEach(id => { document.getElementById(id).style.display = 'none'; });
  document.querySelector('.footer').style.display = '';
  currentTool = null;
  selectedFiles = [];
  signatureFile = null;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleMobileMenu() {
  document.getElementById('mainNav').classList.toggle('active');
}


// ============ OPEN TOOL ============
function openTool(toolId) {
  currentTool = TOOLS.find(t => t.id === toolId);
  if (!currentTool) return;
  selectedFiles = [];
  signatureFile = null;

  ['hero', 'tools', 'features'].forEach(id => { const el = document.getElementById(id); if (el) el.style.display = 'none'; });
  ['batchSection', 'dashboardSection'].forEach(id => { document.getElementById(id).style.display = 'none'; });
  document.querySelector('.footer').style.display = 'none';
  document.getElementById('workspace').style.display = '';
  
  document.getElementById('breadcrumb').innerHTML = `<span>${getCategoryName(currentTool.category)}</span> / <strong>${currentTool.name}</strong>`;
  renderWorkspace();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function getCategoryName(cat) {
  const names = { organize: 'Organiser', convert: 'Convertir', edit: 'Éditer', security: 'Sécurité', ai: 'IA & Analyse', advanced: 'Avancé' };
  return names[cat] || cat;
}

// ============ RENDER WORKSPACE ============
function renderWorkspace() {
  const header = document.getElementById('workspaceHeader');
  const content = document.getElementById('workspaceContent');
  const sidebar = document.getElementById('workspaceSidebar');

  header.innerHTML = `
    <div class="tool-icon ${currentTool.color}" style="width:72px;height:72px;font-size:2rem;margin:0 auto 16px;"><i class="${currentTool.icon}"></i></div>
    <h2>${currentTool.name}</h2>
    <p>${currentTool.description}</p>
  `;

  // Build content
  let html = '';
  
  // File upload (unless noFile)
  if (!currentTool.noFile) {
    html += `
      <div class="upload-area" id="uploadArea" onclick="document.getElementById('fileInput').click()">
        <div class="upload-icon"><i class="fas fa-cloud-upload-alt"></i></div>
        <h3>${currentTool.multiple ? 'Glissez vos fichiers ici' : 'Glissez votre fichier ici'}</h3>
        <p>ou cliquez pour sélectionner (${currentTool.accept})</p>
        <div class="upload-limits">
          <span><i class="fas fa-weight-hanging"></i> Max 200 MB</span>
          <span><i class="fas fa-files"></i> ${currentTool.multiple ? 'Jusqu\'à 50 fichiers' : '1 fichier'}</span>
        </div>
        <input type="file" id="fileInput" accept="${currentTool.accept}" ${currentTool.multiple ? 'multiple' : ''} onchange="handleFileSelect(event)">
      </div>
      <div class="file-list" id="fileList"></div>
    `;
  }

  // Signature upload
  if (currentTool.hasSignature) {
    html += `
      <div class="upload-area" id="sigUpload" onclick="document.getElementById('sigInput').click()" style="padding:30px 20px;">
        <div class="upload-icon"><i class="fas fa-signature"></i></div>
        <h3>Image de signature</h3>
        <p>PNG ou JPG transparent recommandé</p>
        <input type="file" id="sigInput" accept=".png,.jpg,.jpeg" onchange="handleSignatureSelect(event)">
      </div>
      <div class="file-list" id="sigList"></div>
    `;
  }

  // Options
  if (currentTool.options.length > 0) {
    html += `<div class="options-panel"><h4><i class="fas fa-sliders-h"></i> Options</h4>`;
    html += currentTool.options.map(opt => renderOption(opt)).join('');
    html += `</div>`;
  }

  // Process button
  html += `
    <button class="btn btn-primary btn-block btn-lg" id="processBtn" onclick="processFiles()" ${currentTool.noFile ? '' : 'disabled'}>
      <i class="fas fa-magic"></i> <span>Traiter</span>
    </button>
    <div class="progress-container" id="progressContainer">
      <div class="progress-header"><span id="progressLabel">Traitement en cours...</span><strong id="progressPercent">0%</strong></div>
      <div class="progress-bar"><div class="progress-fill" id="progressFill"></div></div>
      <p class="progress-text" id="progressText">Initialisation...</p>
    </div>
    <div class="result-container" id="resultContainer">
      <div class="success-icon"><i class="fas fa-check-circle"></i></div>
      <h3>Traitement terminé !</h3>
      <p class="result-meta" id="resultMeta"></p>
      <div id="resultContent"></div>
    </div>
  `;

  content.innerHTML = html;

  // Sidebar
  sidebar.innerHTML = `
    <div class="sidebar-card">
      <h4><i class="fas fa-info-circle"></i> Informations</h4>
      <ul>
        <li><i class="fas fa-check"></i> Traitement sécurisé côté serveur</li>
        <li><i class="fas fa-check"></i> Fichiers supprimés après 1h</li>
        <li><i class="fas fa-check"></i> Aucune limite d'utilisation</li>
        <li><i class="fas fa-check"></i> Suivi en temps réel (WebSocket)</li>
      </ul>
    </div>
    <div class="sidebar-card">
      <h4><i class="fas fa-keyboard"></i> Raccourcis</h4>
      <ul>
        <li><i class="fas fa-search"></i> <kbd>Ctrl+K</kbd> Recherche rapide</li>
        <li><i class="fas fa-moon"></i> Thème sombre disponible</li>
        <li><i class="fas fa-globe"></i> Multi-langue (FR/EN/AR)</li>
      </ul>
    </div>
    <div class="sidebar-card">
      <h4><i class="fas fa-lightbulb"></i> Astuce</h4>
      <ul>
        <li><i class="fas fa-check"></i> Glissez-déposez vos fichiers directement</li>
        <li><i class="fas fa-check"></i> Mode Batch pour traitement en masse</li>
      </ul>
    </div>
  `;

  if (!currentTool.noFile) setupDragDrop();
}

// ============ RENDER OPTIONS ============
function renderOption(opt) {
  if (opt.type === 'select') {
    return `<div class="form-group"><label>${opt.label}</label><select id="opt_${opt.name}" name="${opt.name}">
      ${opt.choices.map(c => `<option value="${c.value}">${c.label}</option>`).join('')}
    </select></div>`;
  } else if (opt.type === 'textarea') {
    return `<div class="form-group"><label>${opt.label}</label><textarea id="opt_${opt.name}" name="${opt.name}" rows="4" placeholder="${opt.placeholder || ''}" ${opt.required ? 'required' : ''}></textarea></div>`;
  } else if (opt.type === 'color') {
    return `<div class="form-group"><label>${opt.label}</label><input type="color" id="opt_${opt.name}" name="${opt.name}" value="${opt.defaultValue || '#808080'}"></div>`;
  } else {
    return `<div class="form-group"><label>${opt.label}</label><input type="${opt.type}" id="opt_${opt.name}" name="${opt.name}" placeholder="${opt.placeholder || ''}" ${opt.required ? 'required' : ''}></div>`;
  }
}

// ============ DRAG & DROP ============
function setupDragDrop() {
  const area = document.getElementById('uploadArea');
  if (!area) return;
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(evt => {
    area.addEventListener(evt, e => { e.preventDefault(); e.stopPropagation(); });
  });
  area.addEventListener('dragenter', () => area.classList.add('dragover'));
  area.addEventListener('dragover', () => area.classList.add('dragover'));
  area.addEventListener('dragleave', () => area.classList.remove('dragover'));
  area.addEventListener('drop', (e) => {
    area.classList.remove('dragover');
    addFiles(Array.from(e.dataTransfer.files));
  });
}

// ============ FILE HANDLING ============
function handleFileSelect(event) { addFiles(Array.from(event.target.files)); event.target.value = ''; }
function handleSignatureSelect(event) {
  signatureFile = event.target.files[0];
  document.getElementById('sigList').innerHTML = signatureFile ? `
    <div class="file-item"><div class="file-info"><i class="fas fa-signature"></i><div><div class="file-name">${signatureFile.name}</div><div class="file-size">${formatSize(signatureFile.size)}</div></div></div>
    <button class="remove-btn" onclick="signatureFile=null;document.getElementById('sigList').innerHTML='';updateBtn()"><i class="fas fa-times"></i></button></div>` : '';
  updateBtn();
}

function addFiles(files) {
  if (!currentTool.multiple) selectedFiles = [files[0]];
  else selectedFiles = [...selectedFiles, ...files].slice(0, 50);
  renderFileList();
  updateBtn();
}

function removeFile(idx) { selectedFiles.splice(idx, 1); renderFileList(); updateBtn(); }

function renderFileList() {
  const list = document.getElementById('fileList');
  if (!list) return;
  list.innerHTML = selectedFiles.map((f, i) => `
    <div class="file-item">
      <div class="file-info"><i class="fas fa-file-pdf"></i><div><div class="file-name">${f.name}</div><div class="file-size">${formatSize(f.size)}</div></div></div>
      <button class="remove-btn" onclick="removeFile(${i})"><i class="fas fa-times"></i></button>
    </div>`).join('');
}

function updateBtn() {
  const btn = document.getElementById('processBtn');
  if (!btn) return;
  let ok = currentTool.noFile || selectedFiles.length > 0;
  if (currentTool.multiple && currentTool.id === 'merge') ok = selectedFiles.length >= 2;
  if (currentTool.multiple && currentTool.maxFiles === 2) ok = selectedFiles.length === 2;
  if (currentTool.hasSignature && !signatureFile) ok = false;
  btn.disabled = !ok;
}


// ============ PROCESS FILES ============
async function processFiles() {
  const btn = document.getElementById('processBtn');
  const progress = document.getElementById('progressContainer');
  const result = document.getElementById('resultContainer');
  
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin-custom"></i> Traitement...';
  progress.classList.add('active');
  result.classList.remove('active');

  let progressVal = 0;
  const progressInterval = setInterval(() => {
    progressVal = Math.min(progressVal + Math.random() * 12, 90);
    updateProgressUI(progressVal, 'Traitement du document...');
  }, 400);

  try {
    let response;
    
    if (currentTool.noFile) {
      // JSON body request (e.g., create PDF)
      const body = {};
      currentTool.options.forEach(opt => {
        const el = document.getElementById(`opt_${opt.name}`);
        if (el && el.value) {
          try { body[opt.name] = JSON.parse(el.value); } catch { body[opt.name] = el.value; }
        }
      });
      response = await fetch(currentTool.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
    } else {
      // FormData request
      const formData = new FormData();
      if (currentTool.hasSignature) {
        formData.append('file', selectedFiles[0]);
        if (signatureFile) formData.append('signature', signatureFile);
      } else if (currentTool.multiple) {
        selectedFiles.forEach(f => formData.append('files', f));
      } else {
        formData.append('file', selectedFiles[0]);
      }
      // Add options
      currentTool.options.forEach(opt => {
        const el = document.getElementById(`opt_${opt.name}`);
        if (el && el.value) formData.append(opt.name, el.value);
      });
      response = await fetch(currentTool.endpoint, { method: 'POST', body: formData });
    }

    clearInterval(progressInterval);
    updateProgressUI(100, 'Finalisation...');

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'Server error' }));
      throw new Error(err.error || `HTTP ${response.status}`);
    }

    if (currentTool.responseType === 'json') {
      const data = await response.json();
      showJsonResult(data);
    } else {
      const blob = await response.blob();
      showDownloadResult(blob);
    }
    showToast('Traitement terminé avec succès !', 'success');

  } catch (err) {
    clearInterval(progressInterval);
    showToast(err.message, 'error');
    progress.classList.remove('active');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-magic"></i> <span>Traiter</span>';
    setTimeout(() => progress.classList.remove('active'), 1500);
  }
}

function updateProgressUI(val, text) {
  document.getElementById('progressFill').style.width = val + '%';
  document.getElementById('progressPercent').textContent = Math.round(val) + '%';
  if (text) document.getElementById('progressText').textContent = text;
}

// WebSocket progress handler
function updateJobProgress(data) {
  if (data.progress !== undefined) {
    updateProgressUI(data.progress, data.currentFile ? `Fichier: ${data.currentFile}` : '');
  }
}

// ============ RESULTS ============
function showDownloadResult(blob) {
  const result = document.getElementById('resultContainer');
  result.classList.add('active');
  const url = URL.createObjectURL(blob);
  const ext = blob.type.includes('zip') ? 'zip' : 'pdf';
  document.getElementById('resultMeta').textContent = `Taille: ${formatSize(blob.size)}`;
  document.getElementById('resultContent').innerHTML = `
    <div class="result-actions">
      <a href="${url}" download="${currentTool.id}-result.${ext}" class="btn btn-primary"><i class="fas fa-download"></i> Télécharger</a>
      <button class="btn btn-secondary" onclick="showHome()"><i class="fas fa-home"></i> Nouvel outil</button>
    </div>`;
}

function showJsonResult(data) {
  const result = document.getElementById('resultContainer');
  result.classList.add('active');
  
  let html = '';
  if (data.text) {
    document.getElementById('resultMeta').textContent = `${data.pages || '?'} page(s) | ${data.wordCount || '?'} mots | ${data.charCount || '?'} caractères`;
    html = `<div class="result-text">${escapeHtml(data.text).substring(0, 5000)}</div>
      <div class="result-actions"><button class="btn btn-primary" onclick="copyToClipboard(\`${escapeForJs(data.text)}\`)"><i class="fas fa-copy"></i> Copier</button></div>`;
  } else if (data.metadata) {
    document.getElementById('resultMeta').textContent = 'Propriétés du document';
    const m = data.metadata;
    html = `<div class="result-text">${Object.entries(m).filter(([k,v]) => v && typeof v !== 'object').map(([k,v]) => `${k}: ${v}`).join('\n')}\n\n--- Pages ---\n${(m.pages||[]).map(p => `Page ${p.page}: ${p.width}×${p.height} (rotation: ${p.rotation}°)`).join('\n')}</div>`;
  } else if (data.summary) {
    document.getElementById('resultMeta').textContent = `Résumé (${data.summaryWordCount} mots | Compression: ${data.compressionRatio}%)`;
    html = `<div class="result-text">${escapeHtml(data.summary)}</div>`;
  } else if (data.similarity !== undefined) {
    document.getElementById('resultMeta').textContent = `Similarité: ${data.similarity}% | ${data.totalDifferences} différences`;
    html = `<div class="result-text">
=== Fichier 1: ${data.file1.pages} pages, ${data.file1.words} mots ===\n=== Fichier 2: ${data.file2.pages} pages, ${data.file2.words} mots ===\n\n--- Différences (${Math.min(data.differences.length, 50)} premières) ---\n${data.differences.slice(0, 50).map(d => `L${d.line} [${d.type}]\n  - ${d.file1}\n  + ${d.file2}`).join('\n\n')}</div>`;
  } else if (data.topWords) {
    document.getElementById('resultMeta').textContent = `${data.pages} pages | ${data.wordCount} mots | Temps de lecture: ${data.readingTime}`;
    html = `<div class="result-text">
📊 Statistiques du document\n${'─'.repeat(40)}
Pages: ${data.pages}
Mots: ${data.wordCount}
Caractères: ${data.charCount}
Phrases: ${data.sentenceCount}
Paragraphes: ${data.paragraphCount}
Mots/page (moy): ${data.avgWordsPerPage}
Long. phrase (moy): ${data.avgSentenceLength} mots
Temps de lecture: ${data.readingTime}
Taille: ${data.fileSize}

📈 Top 20 mots les plus fréquents\n${'─'.repeat(40)}
${data.topWords.map((w, i) => `${i + 1}. "${w.word}" → ${w.count} fois`).join('\n')}

📄 Détail des pages\n${'─'.repeat(40)}
${data.pageDetails.map(p => `Page ${p.page}: ${p.width}×${p.height}px (rotation: ${p.rotation}°)`).join('\n')}
</div>`;
  } else {
    document.getElementById('resultMeta').textContent = '';
    html = `<div class="result-text">${JSON.stringify(data, null, 2)}</div>`;
  }
  document.getElementById('resultContent').innerHTML = html;
}

// ============ BATCH MODE ============
function openBatchMode() {
  ['hero', 'tools', 'features'].forEach(id => { const el = document.getElementById(id); if(el) el.style.display = 'none'; });
  ['workspace', 'dashboardSection'].forEach(id => { document.getElementById(id).style.display = 'none'; });
  document.querySelector('.footer').style.display = 'none';
  document.getElementById('batchSection').style.display = '';
  
  document.getElementById('batchContent').innerHTML = `
    <div class="options-panel">
      <h4><i class="fas fa-cog"></i> Configuration du batch</h4>
      <div class="form-group"><label>Opération</label>
        <select id="batchOperation">
          <option value="compress">Compresser</option>
          <option value="rotate">Pivoter (90°)</option>
          <option value="watermark">Ajouter filigrane</option>
          <option value="page-numbers">Numéroter pages</option>
          <option value="flatten">Aplatir</option>
          <option value="repair">Réparer</option>
        </select>
      </div>
      <div class="form-group" id="batchExtraOpts"></div>
    </div>
    <div class="upload-area" onclick="document.getElementById('batchFileInput').click()">
      <div class="upload-icon"><i class="fas fa-layer-group"></i></div>
      <h3>Glissez jusqu'à 50 fichiers PDF</h3>
      <p>Tous seront traités avec la même opération</p>
      <input type="file" id="batchFileInput" accept=".pdf" multiple onchange="handleBatchFiles(event)">
    </div>
    <div class="file-list" id="batchFileList"></div>
    <button class="btn btn-primary btn-block btn-lg" id="batchBtn" disabled onclick="runBatch()">
      <i class="fas fa-rocket"></i> Lancer le traitement batch
    </button>
    <div class="progress-container" id="batchProgress">
      <div class="progress-header"><span id="batchLabel">Initialisation...</span><strong id="batchPercent">0%</strong></div>
      <div class="progress-bar"><div class="progress-fill" id="batchFill"></div></div>
      <p class="progress-text" id="batchText"></p>
    </div>
  `;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

let batchFiles = [];
function handleBatchFiles(event) {
  batchFiles = Array.from(event.target.files).slice(0, 50);
  document.getElementById('batchFileList').innerHTML = batchFiles.map((f, i) => `
    <div class="file-item"><div class="file-info"><i class="fas fa-file-pdf"></i><div><div class="file-name">${f.name}</div><div class="file-size">${formatSize(f.size)}</div></div></div></div>
  `).join('');
  document.getElementById('batchBtn').disabled = batchFiles.length === 0;
  event.target.value = '';
}

async function runBatch() {
  const operation = document.getElementById('batchOperation').value;
  const btn = document.getElementById('batchBtn');
  const progress = document.getElementById('batchProgress');
  btn.disabled = true;
  progress.classList.add('active');

  const formData = new FormData();
  batchFiles.forEach(f => formData.append('files', f));
  formData.append('operation', operation);

  try {
    const response = await fetch('/api/batch/process', { method: 'POST', body: formData });
    if (!response.ok) throw new Error('Batch processing failed');
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    document.getElementById('batchFill').style.width = '100%';
    document.getElementById('batchPercent').textContent = '100%';
    document.getElementById('batchText').innerHTML = `<a href="${url}" download="batch-result.zip" class="btn btn-primary" style="margin-top:12px"><i class="fas fa-download"></i> Télécharger le ZIP</a>`;
    showToast(`Batch terminé: ${batchFiles.length} fichiers traités !`, 'success');
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btn.disabled = false;
  }
}

// ============ DASHBOARD ============
function openDashboard() {
  ['hero', 'tools', 'features'].forEach(id => { const el = document.getElementById(id); if(el) el.style.display = 'none'; });
  ['workspace', 'batchSection'].forEach(id => { document.getElementById(id).style.display = 'none'; });
  document.querySelector('.footer').style.display = 'none';
  document.getElementById('dashboardSection').style.display = '';
  loadDashboard();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function loadDashboard() {
  const content = document.getElementById('dashboardContent');
  try {
    const [healthRes, jobsRes] = await Promise.all([
      fetch('/api/health').then(r => r.json()).catch(() => ({ status: 'offline', activeJobs: { queued: 0, processing: 0, completed: 0, failed: 0 } })),
      fetch('/api/jobs/status').then(r => r.json()).catch(() => ({ stats: {}, history: [] }))
    ]);
    
    const stats = healthRes.activeJobs || {};
    content.innerHTML = `
      <div class="dashboard-stats">
        <div class="dashboard-stat"><div class="stat-value" style="color:var(--success)">${stats.completed || 0}</div><div class="stat-label">Complétés</div></div>
        <div class="dashboard-stat"><div class="stat-value" style="color:var(--warning)">${stats.processing || 0}</div><div class="stat-label">En cours</div></div>
        <div class="dashboard-stat"><div class="stat-value" style="color:var(--text-tertiary)">${stats.queued || 0}</div><div class="stat-label">En attente</div></div>
        <div class="dashboard-stat"><div class="stat-value" style="color:var(--danger)">${stats.failed || 0}</div><div class="stat-label">Échoués</div></div>
      </div>
      <div class="sidebar-card">
        <h4><i class="fas fa-server"></i> Statut serveur</h4>
        <ul>
          <li><i class="fas fa-check"></i> Status: <strong>${healthRes.status}</strong></li>
          <li><i class="fas fa-check"></i> Version: <strong>${healthRes.version || '2.0.0'}</strong></li>
          <li><i class="fas fa-check"></i> Uptime: <strong>${healthRes.uptime ? Math.round(healthRes.uptime / 60) + ' min' : 'N/A'}</strong></li>
          <li><i class="fas fa-check"></i> WebSocket: <strong>${wsClient.connected ? 'Connecté' : 'Déconnecté'}</strong></li>
        </ul>
      </div>
      <div class="sidebar-card">
        <h4><i class="fas fa-history"></i> Historique récent</h4>
        ${(jobsRes.history || []).length === 0 ? '<p style="color:var(--text-tertiary);font-size:0.85rem;">Aucun traitement récent</p>' :
          '<div class="job-list">' + (jobsRes.history || []).slice(0, 10).map(j => `
            <div class="job-item">
              <span>${j.type}</span>
              <span class="job-status ${j.status}">${j.status}</span>
            </div>`).join('') + '</div>'}
      </div>
    `;
  } catch (err) {
    content.innerHTML = `<p style="color:var(--danger)">Erreur de chargement: ${err.message}</p>`;
  }
}

// ============ UTILITIES ============
function formatSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024, sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function escapeHtml(text) { const d = document.createElement('div'); d.textContent = text; return d.innerHTML; }
function escapeForJs(text) { return text.replace(/`/g, '\\`').replace(/\$/g, '\\$').substring(0, 2000); }

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => showToast('Copié !', 'success')).catch(() => showToast('Erreur de copie', 'error'));
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const icons = { success: 'check-circle', error: 'exclamation-triangle', warning: 'exclamation-circle', info: 'info-circle' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<i class="fas fa-${icons[type]}"></i> ${message}`;
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 4000);
}
