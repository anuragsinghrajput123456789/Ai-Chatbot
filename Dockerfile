# Stage 1: Build React Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Run Production Node.js Server
FROM node:20-alpine
WORKDIR /app
COPY backend/package*.json ./backend/
RUN npm ci --prefix backend --only=production
COPY backend/ ./backend/
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist
ENV NODE_ENV=production
ENV PORT=5000
EXPOSE 5000
CMD ["npm", "start", "--prefix", "backend"]
