FROM node:18-alpine

# Install dependencies
RUN apk add --no-cache \
    build-base \
    python3 \
    ffmpeg \
    libc-dev

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install npm dependencies
RUN npm install

# Copy project files
COPY . .

# Create required directories
RUN mkdir -p auth_info_baileys logs assets

# Expose port
EXPOSE 3000

# Run the bot
CMD ["npm", "start"]
