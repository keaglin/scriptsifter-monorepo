# Start from a base image that has Node.js (Bun might not have an official image yet)
FROM node:20-bookworm-slim

# Install curl
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Install Bun
RUN curl https://bun.sh/install | bash

# Set the working directory
WORKDIR /app

# Copy your TypeScript file and other necessary files
COPY ./init/kafkaInit.ts .

# Run your TypeScript file with Bun as the container starts
CMD ["bun", "./init/kafkaInit.ts"]
