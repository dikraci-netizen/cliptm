const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const outputDir = path.join(__dirname, '..', '..', 'output');
const tempDir = path.join(__dirname, '..', '..', 'temp');

if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

const getOutputPath = (ext = 'pdf') => path.join(outputDir, `${uuidv4()}.${ext}`);
const getTempPath = (ext = 'pdf') => path.join(tempDir, `${uuidv4()}.${ext}`);

const cleanupFiles = (files) => {
  if (!Array.isArray(files)) files = [files];
  files.forEach(f => {
    try { if (f && fs.existsSync(f)) fs.unlinkSync(f); } catch (e) { /* ignore */ }
  });
};

const getFileSize = (filePath) => {
  try {
    return fs.statSync(filePath).size;
  } catch { return 0; }
};

const formatBytes = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Parse page ranges like "1-3,5,7-10" into array of indices (0-based)
const parsePageRanges = (ranges, totalPages) => {
  if (!ranges || ranges === 'all') {
    return Array.from({ length: totalPages }, (_, i) => i);
  }
  const indices = new Set();
  const parts = ranges.split(',').map(s => s.trim());
  for (const part of parts) {
    if (part.includes('-')) {
      const [start, end] = part.split('-').map(n => parseInt(n));
      for (let i = Math.max(1, start); i <= Math.min(end, totalPages); i++) {
        indices.add(i - 1);
      }
    } else {
      const idx = parseInt(part) - 1;
      if (idx >= 0 && idx < totalPages) indices.add(idx);
    }
  }
  return Array.from(indices).sort((a, b) => a - b);
};

// Roman numeral converter
const toRoman = (num) => {
  const romanNumerals = [
    [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
    [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
    [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']
  ];
  let result = '';
  for (const [value, numeral] of romanNumerals) {
    while (num >= value) { result += numeral; num -= value; }
  }
  return result;
};

module.exports = {
  getOutputPath, getTempPath, cleanupFiles, getFileSize,
  formatBytes, parsePageRanges, toRoman, outputDir, tempDir
};
