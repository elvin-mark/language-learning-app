# --- Stage 1: Build Frontend ---
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

# Copy frontend dependency files
COPY frontend/package*.json ./
RUN npm install

# Copy frontend source and build
COPY frontend/ ./
RUN npm run build

# --- Stage 2: Install Backend Dependencies (Builder) ---
FROM python:3.11-slim-trixie AS backend-builder
WORKDIR /build

# Build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install requirements to a temporary directory
COPY backend/requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# --- Stage 3: Final Runtime ---
FROM python:3.11-slim-trixie
WORKDIR /app

# Only copy what's absolutely necessary from the builders
COPY --from=backend-builder /install /usr/local
COPY --from=frontend-builder /app/frontend/out ./static

# Copy backend source
COPY backend/ ./backend/

# Expose port and start the app
EXPOSE 8000
ENV PYTHONPATH=/app
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
