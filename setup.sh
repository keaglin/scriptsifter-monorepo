#!/bin/bash

# Build Docker images
# docker build -t scriptsifter/transcribe ./apps/transcribe
# docker build -t scriptsifter/goldmine ./apps/goldmine
# docker build -t scriptsifter/web ./apps/web


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
export POSTGRES_PASSWORD=$(op item get "Scriptsifter Secrets" --fields label=password)
export SUPABASE_URL=$(op item get "Scriptsifter Secrets" --fields label=SUPABASE_URL)
export SUPABASE_ANON_KEY=$(op item get "Scriptsifter Secrets" --fields label=SUPABASE_ANON_KEY)
export SUPABASE_SERVICE_ROLE_KEY=$(op item get "Scriptsifter Secrets" --fields label=SUPABASE_SERVICE_ROLE_KEY)
export SUPABASE_JWT_SECRET=$(op item get "Scriptsifter Secrets" --fields label=SUPABASE_JWT_SECRET)
export OPENAI_API_KEY=$(op item get "Scriptsifter Secrets" --fields label=OPENAI_API_KEY)
export NEXT_PUBLIC_SUPABASE_URL=$(op item get "Scriptsifter Secrets" --fields label=NEXT_PUBLIC_SUPABASE_URL)
export NEXT_PUBLIC_SUPABASE_ANON_KEY=$(op item get "Scriptsifter Secrets" --fields label=NEXT_PUBLIC_SUPABASE_ANON_KEY)
export NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$(op item get "Scriptsifter Secrets" --fields label=NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)
export FLUENTFFMPEG_COV=''
# Ensure you have Docker Compose installed
if ! command -v docker compose &> /dev/null; then
  echo "Docker Compose not found. Please install it."
  exit 1
fi

# Start your application stack
docker compose up -d
