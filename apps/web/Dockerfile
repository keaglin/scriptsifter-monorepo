# syntax = docker/dockerfile:1

# Adjust BUN_VERSION as desired
# ARG BUN_VERSION=1.0.25
# FROM oven/bun:${BUN_VERSION}-slim as base
FROM node:lts-alpine as base

LABEL fly_launch_runtime="Next.js"

# Next.js app lives here
WORKDIR /app

# Set production environment
ENV NODE_ENV="production"


# Throw-away build stage to reduce size of final image
FROM base as build

# Install packages needed to build node modules
# RUN apt-get update -qq && \
#     apt-get install --no-install-recommends -y build-essential node-gyp pkg-config python-is-python3
# Copy the hoisted node_modules from your monorepo root

# Install node modules
COPY --link package.json .
RUN npm install

# Copy application code
COPY --link . .

# Build application
RUN npm run build

# Remove development dependencies
RUN rm -rf node_modules && \
    npm install --ci


# Final stage for app image
FROM base

# Copy built application
COPY --from=build /app /app

# Start the server by default, this can be overwritten at runtime
EXPOSE 3000
CMD [ "npm", "run", "start" ]
