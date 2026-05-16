FROM node:20-alpine

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    vips-dev

# Copy backend package files
COPY backend/package*.json ./backend/

# Install dependencies
WORKDIR /app/backend
RUN npm install --production

# Copy application code
WORKDIR /app
COPY backend/ ./backend/
COPY frontend/ ./frontend/

# Create required directories
RUN mkdir -p /app/backend/uploads /app/backend/temp

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

WORKDIR /app/backend
CMD ["node", "src/server.js"]
