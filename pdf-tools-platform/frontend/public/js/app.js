// ============ APP STATE ============
let currentTool = null;
let selectedFiles = [];

// ============ INITIALIZATION ============
document.addEventListener('DOMContentLoaded', () => {
  renderToolsGrid();
});

// ============ RENDER TOOLS GRID ============
function renderToolsGrid(filter = 'all') {
  const grid = document.getElementById('toolsGrid');
  const filtered = filter === 'all' ? TOOLS : TOOLS.filter(t => t.category === filter);
  
  grid.innerHTML = filtered.map(tool => `
    <div class="tool-card" onclick="openTool('${tool.id}')" data-category="${tool.category}">
      <div class="tool-icon ${tool.color}">
        <i class="${tool.icon}"></i>
      </div>
      <h3>${tool.name}</h3>
      <p>${tool.description}</p>
    </div>
  `).join('');
}

// ============ FILTER TOOLS ============
function filterTools(category) {
  document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
  renderToolsGrid(category);
}

// ============ NAVIGATION ============
function showHome() {
  document.getElementById('hero').style.display = '';
  document.getElementById('tools').style.display = '';
  document.getElementById('about').style.display = '';
  document.getElementById('workspace').style.display = 'none';
  currentTool = null;
  selectedFiles = [];
}

function openTool(toolId) {
  currentTool = TOOLS.find(t => t.id === toolId);
  if (!currentTool) return;
  
  selectedFiles = [];
  
  document.getElementById('hero').style.display = 'none';
  document.getElementById('tools').style.display = 'none';
  document.getElementById('about').style.display = 'none';
  document.getElementById('workspace').style.display = '';
  
  renderWorkspace();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============ RENDER WORKSPACE ============
function renderWorkspace() {
  const header = document.getElementById('workspaceHeader');
  const content = document.getElementById('workspaceContent');
  
  header.innerHTML = `
    <div class="tool-icon ${currentTool.color}" style="width:72px;height:72px;font-size:2rem;margin:0 auto 16px;">
      <i class="${currentTool.icon}"></i>
    </div>
    <h2>${currentTool.name}</h2>
    <p>${currentTool.description}</p>
  `;
  
  let signatureUpload = '';
  if (currentTool.hasSignature) {
    signatureUpload = `
      <div class="upload-area" id="signatureUpload" onclick="document.getElementById('signatureInput').click()">
        <i class="fas fa-signature"></i>
        <h3>Image de signature</h3>
        <p>Glissez votre signature ici (PNG, JPG)</p>
        <input type="file" id="signatureInput" accept=".png,.jpg,.jpeg" onchange="handleSignatureSelect(event)">
      </div>
      <div class="file-list" id="signatureList"></div>
    `;
  }
  
  const optionsHtml = currentTool.options.length > 0 ? `
    <div class="options-panel">
      <h4><i class="fas fa-cog"></i> Options</h4>
      ${currentTool.options.map(opt => renderOption(opt)).join('')}
    </div>
  ` : '';
  
  content.innerHTML = `
    <div class="upload-area" id="uploadArea" onclick="document.getElementById('fileInput').click()">
      <i class="fas fa-cloud-upload-alt"></i>
      <h3>${currentTool.multiple ? 'Glissez vos fichiers ici' : 'Glissez votre fichier ici'}</h3>
      <p>ou cliquez pour sélectionner (${currentTool.accept})</p>
      <input type="file" id="fileInput" accept="${currentTool.accept}" ${currentTool.multiple ? 'multiple' : ''} onchange="handleFileSelect(event)">
    </div>
    <div class="file-list" id="fileList"></div>
    ${signatureUpload}
    ${optionsHtml}
    <button class="btn btn-primary" id="processBtn" onclick="processFiles()" disabled>
      <i class="fas fa-magic"></i> Traiter
    </button>
    <div class="progress-container" id="progressContainer">
      <div class="progress-bar">
        <div class="progress-fill" id="progressFill" style="width: 0%"></div>
      </div>
      <p class="progress-text" id="progressText">Traitement en cours...</p>
    </div>
    <div class="result-container" id="resultContainer">
      <div class="success-icon"><i class="fas fa-check-circle"></i></div>
      <h3>Traitement terminé !</h3>
      <p id="resultMessage">Votre fichier est prêt.</p>
      <div id="resultContent"></div>
    </div>
  `;
  
  setupDragDrop();
}

// ============ RENDER OPTIONS ============
function renderOption(opt) {
  if (opt.type === 'select') {
    return `
      <div class="form-group">
        <label>${opt.label}</label>
        <select name="${opt.name}" id="opt_${opt.name}">
          ${opt.choices.map(c => `<option value="${c.value}">${c.label}</option>`).join('')}
        </select>
      </div>
    `;
  } else {
    return `
      <div class="form-group">
        <label>${opt.label}</label>
        <input type="${opt.type}" name="${opt.name}" id="opt_${opt.name}" 
               placeholder="${opt.placeholder || ''}" ${opt.required ? 'required' : ''}>
      </div>
    `;
  }
}

// ============ DRAG & DROP ============
function setupDragDrop() {
  const uploadArea = document.getElementById('uploadArea');
  
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(event => {
    uploadArea.addEventListener(event, (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
  });
  
  uploadArea.addEventListener('dragenter', () => uploadArea.classList.add('dragover'));
  uploadArea.addEventListener('dragover', () => uploadArea.classList.add('dragover'));
  uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('dragover'));
  uploadArea.addEventListener('drop', (e) => {
    uploadArea.classList.remove('dragover');
    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
  });
}

// ============ FILE HANDLING ============
function handleFileSelect(event) {
  const files = Array.from(event.target.files);
  addFiles(files);
  event.target.value = '';
}

let signatureFile = null;
function handleSignatureSelect(event) {
  signatureFile = event.target.files[0];
  const list = document.getElementById('signatureList');
  if (signatureFile) {
    list.innerHTML = `
      <div class="file-item">
        <div class="file-info">
          <i class="fas fa-signature"></i>
          <div>
            <div class="file-name">${signatureFile.name}</div>
            <div class="file-size">${formatSize(signatureFile.size)}</div>
          </div>
        </div>
        <button class="remove-btn" onclick="removeSignature()"><i class="fas fa-times"></i></button>
      </div>
    `;
  }
  updateProcessButton();
}

function removeSignature() {
  signatureFile = null;
  document.getElementById('signatureList').innerHTML = '';
  updateProcessButton();
}

function addFiles(files) {
  if (!currentTool.multiple) {
    selectedFiles = [files[0]];
  } else {
    selectedFiles = [...selectedFiles, ...files];
  }
  renderFileList();
  updateProcessButton();
}

function removeFile(index) {
  selectedFiles.splice(index, 1);
  renderFileList();
  updateProcessButton();
}

function renderFileList() {
  const list = document.getElementById('fileList');
  if (selectedFiles.length === 0) {
    list.innerHTML = '';
    return;
  }
  
  list.innerHTML = selectedFiles.map((file, idx) => `
    <div class="file-item">
      <div class="file-info">
        <i class="fas fa-file-pdf"></i>
        <div>
          <div class="file-name">${file.name}</div>
          <div class="file-size">${formatSize(file.size)}</div>
        </div>
      </div>
      <button class="remove-btn" onclick="removeFile(${idx})"><i class="fas fa-times"></i></button>
    </div>
  `).join('');
}

function updateProcessButton() {
  const btn = document.getElementById('processBtn');
  let enabled = selectedFiles.length > 0;
  if (currentTool.multiple && currentTool.id === 'merge') {
    enabled = selectedFiles.length >= 2;
  }
  if (currentTool.hasSignature && !signatureFile) {
    enabled = false;
  }
  btn.disabled = !enabled;
}

// ============ PROCESS FILES ============
async function processFiles() {
  if (selectedFiles.length === 0) return;
  
  const btn = document.getElementById('processBtn');
  const progress = document.getElementById('progressContainer');
  const result = document.getElementById('resultContainer');
  
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Traitement...';
  progress.classList.add('active');
  result.classList.remove('active');
  
  // Animate progress
  let progressValue = 0;
  const progressInterval = setInterval(() => {
    progressValue = Math.min(progressValue + Math.random() * 15, 90);
    document.getElementById('progressFill').style.width = `${progressValue}%`;
  }, 300);
  
  try {
    const formData = new FormData();
    
    // Add files
    if (currentTool.hasSignature) {
      formData.append('file', selectedFiles[0]);
      if (signatureFile) formData.append('signature', signatureFile);
    } else if (currentTool.multiple) {
      selectedFiles.forEach(file => formData.append('files', file));
    } else {
      formData.append('file', selectedFiles[0]);
    }
    
    // Add options
    currentTool.options.forEach(opt => {
      const el = document.getElementById(`opt_${opt.name}`);
      if (el && el.value) {
        formData.append(opt.name, el.value);
      }
    });
    
    const response = await fetch(currentTool.endpoint, {
      method: 'POST',
      body: formData
    });
    
    clearInterval(progressInterval);
    document.getElementById('progressFill').style.width = '100%';
    
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Erreur lors du traitement');
    }
    
    // Handle response based on type
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
    btn.innerHTML = '<i class="fas fa-magic"></i> Traiter';
    setTimeout(() => progress.classList.remove('active'), 1000);
  }
}

// ============ RESULTS ============
function showDownloadResult(blob) {
  const result = document.getElementById('resultContainer');
  const resultContent = document.getElementById('resultContent');
  const url = URL.createObjectURL(blob);
  const ext = blob.type.includes('zip') ? 'zip' : 'pdf';
  const filename = `${currentTool.id}-result.${ext}`;
  
  result.classList.add('active');
  document.getElementById('resultMessage').textContent = `Taille: ${formatSize(blob.size)}`;
  resultContent.innerHTML = `
    <a href="${url}" download="${filename}" class="btn btn-primary" style="max-width:300px;margin:0 auto;">
      <i class="fas fa-download"></i> Télécharger
    </a>
  `;
}

function showJsonResult(data) {
  const result = document.getElementById('resultContainer');
  const resultContent = document.getElementById('resultContent');
  result.classList.add('active');
  
  if (data.text) {
    document.getElementById('resultMessage').textContent = `${data.pages || '?'} page(s) extraites`;
    resultContent.innerHTML = `
      <div class="result-text">${escapeHtml(data.text)}</div>
      <button class="btn btn-secondary" onclick="copyText('${escapeHtml(data.text).replace(/'/g, "\\'")}')">
        <i class="fas fa-copy"></i> Copier le texte
      </button>
    `;
  } else if (data.metadata) {
    document.getElementById('resultMessage').textContent = 'Métadonnées du document';
    const meta = data.metadata;
    resultContent.innerHTML = `
      <div class="result-text">${Object.entries(meta).map(([k, v]) => `${k}: ${v}`).join('\n')}</div>
    `;
  }
}

// ============ UTILITIES ============
function formatSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function copyText(text) {
  navigator.clipboard.writeText(text).then(() => {
    showToast('Texte copié !', 'success');
  });
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'exclamation-triangle' : 'info-circle'}"></i> ${message}`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}
