FROM node:20-alpine

WORKDIR /app

# Copy package files first for caching
COPY package*.json ./
RUN npm install

# Copy the rest of the app
COPY . .

# Build the server (creates dist/index.cjs)
RUN npm run server-build

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

# Start the compiled server
CMD ["node", "dist/index.cjs"]
