FROM node:18-alpine
WORKDIR /app
COPY backend/package*.json ./backend/
RUN cd backend && npm install --production
COPY backend ./backend
EXPOSE 4000
CMD ["node", "backend/server.js"]
