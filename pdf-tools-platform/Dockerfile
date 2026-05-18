FROM node:20-alpine

WORKDIR /app

# Install system dependencies for sharp, canvas, tesseract
RUN apk add --no-cache \
    python3 make g++ \
    vips-dev \
    cairo-dev pango-dev jpeg-dev giflib-dev \
    tesseract-ocr tesseract-ocr-data-eng tesseract-ocr-data-fra

# Copy package files
COPY backend/package*.json ./backend/

# Install dependencies
WORKDIR /app/backend
RUN npm install --production

# Copy application
WORKDIR /app
COPY backend/ ./backend/
COPY frontend/ ./frontend/

# Create directories
RUN mkdir -p /app/backend/uploads /app/backend/temp /app/backend/output

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

WORKDIR /app/backend
CMD ["node", "src/server.js"]
