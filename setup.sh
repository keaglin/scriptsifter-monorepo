#!/bin/bash

# Install the 1Password CLI if not already present
if ! command -v op &> /dev/null; then
  echo "1Password CLI not found. Please install it."
  exit 1
fi

# Sign in to 1Password (if not already signed in)
# if ! op account list &> /dev/null; then
#   echo "Enter your 1Password credentials to sign in:"
#   eval $(op signin)
# fi

# I never seem to be logged in so for now, just login every time
eval $(op signin)

# Retrieve secrets from 1Password
# In your Docker Compose file or a startup script

export POSTGRES_PASSWORD=$(op read op://$VAULT_NAME/"Scriptsifter Secrets"/password)
export SUPABASE_URL=$(op read op://$VAULT_NAME/"Scriptsifter Secrets"/SUPABASE_URL)
export SUPABASE_ANON_KEY=$(op read op://$VAULT_NAME/"Scriptsifter Secrets"/SUPABASE_ANON_KEY)
export SUPABASE_SERVICE_ROLE_KEY=$(op read op://$VAULT_NAME/"Scriptsifter Secrets"/SUPABASE_SERVICE_ROLE_KEY)
export SUPABASE_JWT_SECRET=$(op read op://$VAULT_NAME/"Scriptsifter Secrets"/SUPABASE_JWT_SECRET)
export OPENAI_API_KEY=$(op read op://$VAULT_NAME/"Scriptsifter Secrets"/OPENAI_API_KEY)
export NEXT_PUBLIC_SUPABASE_URL=$(op read op://$VAULT_NAME/"Scriptsifter Secrets"/NEXT_PUBLIC_SUPABASE_URL)
export NEXT_PUBLIC_SUPABASE_ANON_KEY=$(op read op://$VAULT_NAME/"Scriptsifter Secrets"/NEXT_PUBLIC_SUPABASE_ANON_KEY)
export NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$(op read op://$VAULT_NAME/"Scriptsifter Secrets"/NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)


# Ensure you have Docker Compose installed
if ! command -v docker compose &> /dev/null; then
  echo "Docker Compose not found. Please install it."
  exit 1
fi

# Build Docker images
docker build -t kevonstaycoding/scriptsifter-transcribe:latest ./apps/transcribe
docker build -t kevonstaycoding/scriptsifter-goldmine:latest ./apps/goldmine
docker build -t kevonstaycoding/scriptsifter-web:latest ./apps/web

# Start your application stack
docker compose up -d
