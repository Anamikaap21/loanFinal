# ==============================================================================
# REALCRED TECHNOLOGY PRIVATE LIMITED - MULTI-STAGE PRODUCTION DOCKERFILE
# ==============================================================================

# STAGE 1: Build Frontend Assets
FROM node:22-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# STAGE 2: Backend & Runtime Environment
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Install production dependencies for backend
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --only=production

# Copy backend source
COPY backend/ ./backend/

# Copy compiled frontend dist from Stage 1 into expected directory
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Ensure upload folders exist
RUN mkdir -p backend/uploads/documents backend/uploads/invoices

EXPOSE 5000

CMD ["node", "backend/server.js"]
