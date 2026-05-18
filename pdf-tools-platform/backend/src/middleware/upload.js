const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const sanitized = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${uuidv4()}_${sanitized}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/tiff', 'image/gif', 'image/bmp',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', // pptx
    'application/msword', // doc
    'application/vnd.ms-excel', // xls
    'application/vnd.ms-powerpoint', // ppt
    'text/plain', 'text/html', 'text/csv', 'text/markdown',
    'application/rtf',
    'application/epub+zip'
  ];

  if (allowedTypes.includes(file.mimetype) || 
      file.originalname.match(/\.(pdf|png|jpg|jpeg|webp|tiff|gif|bmp|docx|xlsx|pptx|doc|xls|ppt|txt|html|csv|md|rtf|epub)$/i)) {
    cb(null, true);
  } else {
    cb(new Error(`File type "${file.mimetype}" is not supported. Supported: PDF, Images, Office, Text files.`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 200 * 1024 * 1024, // 200MB max per file
    files: 50 // Max 50 files at once
  }
});

module.exports = upload;
