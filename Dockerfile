# Build Stage
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

FROM base AS test
RUN npm run format:check
RUN npm run lint
RUN npm test

FROM base AS build
RUN npm run build

# Serve using NGINX
FROM nginx:alpine
ARG ENV=prod

COPY nginx.${ENV}.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

# Create SSL directory
RUN mkdir -p /etc/nginx/ssl

# Install openssl for certificate generation
RUN apk add --no-cache openssl

# Generate self-signed certificate if not provided
# This allows the container to start immediately in development
# Production deployments can mount real certificates to override these
RUN openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/key.pem \
    -out /etc/nginx/ssl/cert.pem \
    -subj "/C=MY/ST=Malaysia/L=Malaysia/O=MindSync/CN=mindsync.my"

EXPOSE 80 443
CMD ["nginx", "-g", "daemon off;"]
