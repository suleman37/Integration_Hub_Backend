# Stage 1: Base
FROM node:20-alpine AS base
WORKDIR /driver-app-backend
COPY package*.json tsconfig.json ./

# Stage 2: Build
FROM base AS builder
RUN npm install
COPY . .
RUN npm run build

# Stage 3: Running
FROM node:20-alpine AS runner
WORKDIR /driver-app-backend
COPY --from=builder /driver-app-backend/dist /driver-app-backend/dist
COPY --from=builder /driver-app-backend/node_modules /driver-app-backend/node_modules
COPY --from=builder /driver-app-backend/package.json /driver-app-backend/package.json
COPY tsconfig.json .  

# Debugging: Check if the dist directory exists
RUN ls -la /driver-app-backend/dist || echo "Dist folder not found!"

EXPOSE 3001
CMD ["node", "/driver-app-backend/dist/server.js"]




