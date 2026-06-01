FROM node:20-alpine

WORKDIR /app

# Copy package.json dulu
COPY package*.json .

# Install dependencies
RUN npm install

# Copy semua file frontend
COPY . .

# Build Next.js
RUN npm run build

# Expose port 3000
EXPOSE 3000

# Jalankan Next.js
CMD ["npm", "start"]
