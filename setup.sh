#!/bin/bash

# Build Docker images
docker build -t scriptsifter/transcribe ./apps/transcribe
docker build -t scriptsifter/goldmine ./apps/goldmine
docker build -t scriptsifter/web ./apps/web


# Install the 1Password CLI if not already present
if ! command -v op &> /dev/null; then
  echo "1Password CLI not found. Please install it."
  exit 1
fi

# Retrieve the password from 1Password
export POSTGRES_PASSWORD=$(op item get "Scriptsifter Postgres Docker Password" --fields label=password)

# Ensure you have Docker Compose installed
if ! command -v docker-compose &> /dev/null; then
  echo "Docker Compose not found. Please install it."
  exit 1
fi

# Start your application stack
docker compose up -d
