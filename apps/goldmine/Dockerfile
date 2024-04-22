# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1.1.4-alpine as base
WORKDIR /app

COPY package.json bun.lockb ./

RUN bun install && bun run build

COPY . .
RUN bun install -g pm2


# run the app
USER bun
EXPOSE 3000/tcp
CMD [ "pm2", "start", "./out/index.js" ]
