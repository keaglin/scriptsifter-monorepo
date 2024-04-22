# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1.1.4-debian as base

# Update, install dependencies, and create working directory
RUN DEBIAN_FRONTEND=noninteractive apt-get update -y && \
  DEBIAN_FRONTEND=noninteractive apt-get install -y ffmpeg && \
  mkdir -p /usr/src/app

WORKDIR /app

COPY package.json bun.lockb ./

RUN bun install -g pm2

COPY . .

RUN bun run build

# run the app
USER bun
EXPOSE 3000/tcp
CMD [ "pm2", "start", "./out/index.js" ]
