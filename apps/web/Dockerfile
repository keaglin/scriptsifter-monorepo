# syntax = docker/dockerfile:1
ARG NODE_VERSION=20.10.0
FROM node:${NODE_VERSION}-alpine as base

# Adjust NODE_VERSION as desired
ARG NEXT_PUBLIC_SUPABASE_URL \
    NEXT_PUBLIC_SUPABASE_ANON_KEY \
    SUPABASE_URL \
    SUPABASE_ANON_KEY

LABEL fly_launch_runtime="Next.js"

# Next.js app lives here
WORKDIR /app

# Set production environment
ENV NODE_ENV="production"

# Throw-away build stage to reduce size of final image
FROM base as build

# Install packages needed to build node modules
RUN apk update && \
    apk add --no-cache build-base nodejs-current npm python3

# Install node modules
COPY --link package.json ./
RUN npm install --include=dev

# Copy application code
COPY --link . .

# Build application
RUN npm run build

# Remove development dependencies
RUN npm prune --omit=dev

# Final stage for app image
FROM base

# Copy built application
COPY --from=build /app /app

# Start the server by default, this can be overwritten at runtime
EXPOSE 3000
CMD [ "npm", "run", "start" ]
