# Build Stage
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

FROM base AS test
# Run format check
RUN npm run format:check

# Run linting with complexity checks
RUN npm run lint

# Generate complexity report
RUN npm run quality:complexity || true

# Run tests with coverage
RUN npm run test:coverage:threshold

# Display coverage summary
RUN if [ -f coverage/coverage-summary.json ]; then \
  echo "=== Coverage Report ===" && \
  cat coverage/coverage-summary.json | head -20; \
fi

FROM base AS build
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
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
