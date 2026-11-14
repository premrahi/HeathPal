FROM node:24-alpine AS web
WORKDIR /app
COPY frontend/package*.json ./frontend/
RUN npm ci --prefix frontend
COPY frontend ./frontend
RUN npm run build --prefix frontend

FROM node:24-alpine
ENV NODE_ENV=production PORT=5000
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --omit=dev
COPY backend/src ./src
COPY --from=web /app/frontend/dist /app/frontend/dist
USER node
EXPOSE 5000
CMD ["node", "src/server.js"]
