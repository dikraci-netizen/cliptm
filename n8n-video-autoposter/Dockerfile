# ClipTM - n8n with FFmpeg + Python + Edge TTS pre-installed
FROM n8nio/n8n:latest

USER root

# Install ffmpeg, python, fonts
RUN apk add --no-cache \
        ffmpeg \
        python3 \
        py3-pip \
        fontconfig \
        ttf-dejavu \
        curl \
        bash \
    && pip install --no-cache-dir --break-system-packages edge-tts

# Copy helper scripts and assets into the image
COPY scripts/ /data/scripts/
COPY assets/  /data/assets/
RUN chmod +x /data/scripts/*.py 2>/dev/null || true

# n8n needs to be able to read these files
RUN chown -R node:node /data

USER node
