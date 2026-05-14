// Facebook Auto Poster Pro - Watermark/Branding Module
const Watermark = {
  
  // === APPLY WATERMARK TO IMAGE ===
  async applyWatermark(imageFile, config = {}) {
    const {
      text = 'Auto Poster Pro',
      position = 'bottomRight',
      fontSize = 16,
      color = 'rgba(255, 255, 255, 0.7)',
      backgroundColor = 'rgba(0, 0, 0, 0.5)',
      padding = 8,
      fontFamily = 'Arial'
    } = config;
    
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();
      
      reader.onload = (e) => {
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          
          // Draw original image
          ctx.drawImage(img, 0, 0);
          
          // Configure text
          ctx.font = `bold ${fontSize}px ${fontFamily}`;
          const textMetrics = ctx.measureText(text);
          const textWidth = textMetrics.width;
          const textHeight = fontSize;
          
          // Calculate position
          let x, y;
          switch (position) {
            case 'topLeft':
              x = padding;
              y = padding + textHeight;
              break;
            case 'topRight':
              x = img.width - textWidth - padding * 2;
              y = padding + textHeight;
              break;
            case 'bottomLeft':
              x = padding;
              y = img.height - padding;
              break;
            case 'bottomRight':
              x = img.width - textWidth - padding * 2;
              y = img.height - padding;
              break;
            case 'center':
              x = (img.width - textWidth) / 2;
              y = img.height / 2;
              break;
            default:
              x = img.width - textWidth - padding * 2;
              y = img.height - padding;
          }
          
          // Draw background
          ctx.fillStyle = backgroundColor;
          ctx.fillRect(x - padding, y - textHeight - padding / 2, textWidth + padding * 2, textHeight + padding);
          
          // Draw text
          ctx.fillStyle = color;
          ctx.fillText(text, x, y - padding / 2);
          
          // Convert to blob
          canvas.toBlob((blob) => {
            resolve(blob);
          }, 'image/png', 0.95);
        };
        
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target.result;
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(imageFile);
    });
  },

  // === BATCH WATERMARK ===
  async batchWatermark(files, config = {}) {
    const results = [];
    for (const file of files) {
      try {
        const watermarked = await this.applyWatermark(file, config);
        results.push({ success: true, blob: watermarked, name: file.name });
      } catch (error) {
        results.push({ success: false, error: error.message, name: file.name });
      }
    }
    return results;
  },

  // === GET/SET CONFIG ===
  async getConfig() {
    const { watermarkConfig } = await chrome.storage.local.get('watermarkConfig');
    return watermarkConfig || {
      enabled: false,
      text: 'Auto Poster Pro',
      position: 'bottomRight',
      fontSize: 16,
      color: 'rgba(255, 255, 255, 0.7)',
      backgroundColor: 'rgba(0, 0, 0, 0.5)'
    };
  },

  async saveConfig(config) {
    await chrome.storage.local.set({ watermarkConfig: config });
  },

  // === PREVIEW WATERMARK ===
  createPreview(width = 200, height = 150, config = {}) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    // Sample background
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Add text "SAMPLE IMAGE"
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('SAMPLE IMAGE', width / 2, height / 2);
    
    // Apply watermark preview
    const {
      text = 'Auto Poster Pro',
      position = 'bottomRight',
      fontSize = 12,
      color = 'rgba(255, 255, 255, 0.7)',
      backgroundColor = 'rgba(0, 0, 0, 0.5)'
    } = config;
    
    ctx.font = `bold ${fontSize}px Arial`;
    ctx.textAlign = 'left';
    const textWidth = ctx.measureText(text).width;
    
    let x, y;
    const padding = 4;
    switch (position) {
      case 'topLeft': x = padding; y = fontSize + padding; break;
      case 'topRight': x = width - textWidth - padding * 2; y = fontSize + padding; break;
      case 'bottomLeft': x = padding; y = height - padding; break;
      case 'bottomRight': x = width - textWidth - padding * 2; y = height - padding; break;
      case 'center': x = (width - textWidth) / 2; y = height / 2 + fontSize / 2; break;
      default: x = width - textWidth - padding * 2; y = height - padding;
    }
    
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(x - padding, y - fontSize - padding / 2, textWidth + padding * 2, fontSize + padding);
    ctx.fillStyle = color;
    ctx.fillText(text, x, y - padding / 2);
    
    return canvas.toDataURL();
  }
};
