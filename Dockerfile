FROM node:22-slim

# Install build tools needed for native modules
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (this will compile better-sqlite3)
RUN npm install --build-from-source

# Copy the rest
COPY . .

# Build frontend
RUN npm run build

EXPOSE 3001

CMD ["sh", "-c", "npm run db:init && npm start"]
