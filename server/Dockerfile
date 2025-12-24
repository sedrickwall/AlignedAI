FROM node:20-alpine

WORKDIR /app

# Copy package files from repo root (build context must be the repo root)
COPY package*.json ./
RUN npm install

# Explicitly copy the server folder and any build scripts/configs the build requires
# (this keeps the build context minimal while ensuring files referenced by script/build.ts are present)
COPY server ./server
COPY script ./script
COPY client ./client
COPY shared ./shared
COPY tsconfig.json .
COPY vite.config.ts .
COPY drizzle.config.ts .

# Run the server build (this project uses `script/build.ts` which outputs `dist/index.cjs`)
RUN npm run server-build

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

# Start the compiled server
CMD ["node", "dist/index.cjs"]
