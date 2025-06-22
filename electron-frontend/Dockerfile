# 1. Use a more complete Debian-based image
FROM node:18-bullseye

# 2. Install Electron's dependencies and a virtual display
RUN apt-get update && apt-get install -y \
    xvfb \
    libnss3 \
    libgdk-pixbuf2.0-0 \
    libgtk-3-0 \
    libxss1 \
    libasound2 \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --verbose

# Copy the rest of the source code
COPY . .

# Vite dev server runs on port 3000
EXPOSE 3000

# 3. Run the 'npm run dev' command inside the virtual display
CMD [""] 