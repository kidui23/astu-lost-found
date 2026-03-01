FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./

# Install dependencies (only production deps for smaller image)
RUN npm ci --only=production

# Copy the rest of the application code
COPY . .

# Expose the API port
EXPOSE 5000

# Set Node environment to production
ENV NODE_ENV=production

# Start the application
CMD ["npm", "start"]
