FROM node:22-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (this will compile better-sqlite3 for Node 22)
RUN npm install

# Copy the rest of the application
COPY . .

# Build the frontend
RUN npm run build

# Expose the port
EXPOSE 3001

# Initialize DB and start server
CMD ["sh", "-c", "npm run db:init && npm start"]
