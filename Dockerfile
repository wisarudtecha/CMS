# Stage 1: Build the Vite + TypeScript app
FROM asia-southeast1-docker.pkg.dev/metthier-devops/open-platform/node:18 AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
COPY tsconfig*.json ./
RUN npm install

# Copy the rest of the source code
COPY . .

# Set build environment variables
ARG ENVIRONMENT
ARG NODE_OPTIONS
ENV NODE_OPTIONS=${NODE_OPTIONS}
 
# Build the app (TypeScript + Vite)
RUN npm run build -- --mode ${ENVIRONMENT}

# Stage 2: Serve using nginx
FROM asia-southeast1-docker.pkg.dev/metthier-devops/open-platform/nginx:stable

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy our custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose nginx default port
EXPOSE 80

# Start nginx server
CMD ["nginx", "-g", "daemon off;"]
