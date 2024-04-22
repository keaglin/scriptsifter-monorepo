# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1.1.4-debian as base

# Update, install dependencies, and create working directory
RUN DEBIAN_FRONTEND=noninteractive apt-get update -y && \
  DEBIAN_FRONTEND=noninteractive apt-get install -y ffmpeg && \
  mkdir -p /app

WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install

FROM oven/bun:1.1.4-debian as build
RUN ls -la
WORKDIR /app
RUN pwd
COPY . .
RUN ls -la
COPY --from=base /app/node_modules /app/node_modules
RUN ls -la
RUN pwd
RUN bun build --entrypoints ./index.ts --outdir /app/out --target bun

FROM oven/bun:1.1.4-debian as app
RUN ls -la
WORKDIR /app
RUN ls -la
COPY --from=build /app/out /app/out
RUN ls -la
RUN bun install -g pm2


# run the app
USER bun
EXPOSE 3000/tcp
CMD [ "pm2", "start", "/app/out/index.js" ]
