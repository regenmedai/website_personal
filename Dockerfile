# Build phase
FROM node:20-alpine as builder
WORKDIR /app
COPY . .
RUN npm install && npm run build

# Serve phase
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"] 