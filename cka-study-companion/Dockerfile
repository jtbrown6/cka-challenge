# Use Node.js LTS as the base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json .
RUN npm install

# Copy the rest of the application
COPY . .

# Expose the port the app runs on
EXPOSE 3010

# Set environment variables (can be overridden at runtime)
ENV DATA_DIR=/data/cka-app
ENV OPENAI_API_KEY=placeholder-key

# Create data directory volume
VOLUME /data/cka-app

# Command to run the application
CMD ["npm", "start"]