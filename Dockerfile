# ===================================================
# Stage 1: Build Frontend (React 18 + Vite SPA)
# ===================================================
FROM node:20-slim AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# ===================================================
# Stage 2: Production Unified Backend & SPA Server
# ===================================================
FROM python:3.11-slim
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python requirements
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy Backend application code
COPY backend/ .

# Copy compiled React SPA into location served by FastAPI
COPY --from=frontend-builder /app/frontend/dist /frontend/dist

# Render provides $PORT dynamically (default 8000)
ENV PORT=8000
EXPOSE 8000

CMD sh -c "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"
