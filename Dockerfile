FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm ci && npm run build    # or your build step
EXPOSE 3000
CMD ["npm", "start"]           # or "node server.js" 