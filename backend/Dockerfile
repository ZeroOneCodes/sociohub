# Base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the code
COPY . .

# Expose the port (same as in .env)
EXPOSE 3005

# Start the app
CMD ["node", "index.js"]
