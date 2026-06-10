# Stage 1 — Build
FROM node:20-alpine AS builder

WORKDIR /app

# Accept API key as build argument
ARG VITE_MISTRAL_API_KEY
ENV VITE_MISTRAL_API_KEY=$VITE_MISTRAL_API_KEY

COPY package*.json ./
RUN npm ci --silent

COPY . .
RUN npm run build

# Stage 2 — Serve with nginx (Cloud Run needs port 8080)
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
