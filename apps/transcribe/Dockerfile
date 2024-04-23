# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM --platform=amd64 oven/bun:1.1.4-debian as base

WORKDIR /usr/src/app

# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lockb /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

# install with --production (exclude devDependencies)
RUN mkdir -p /temp/prod
COPY package.json bun.lockb /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

# copy node_modules from temp directory
# then copy all (non-ignored) project files into the image
FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

# [optional] tests & build
ENV NODE_ENV=production
RUN bun test
RUN ls -la
RUN FLUENTFFMPEG_COV='' bun build --entrypoints index.ts --outdir out/ --target bun

# copy production dependencies and source code into final image
FROM base AS release
COPY --from=install /temp/prod/node_modules node_modules
COPY --from=prerelease /usr/src/app/index.ts .
COPY --from=prerelease /usr/src/app/package.json .
RUN ls -la
# Update, install dependencies, and create working directory
RUN <<EOF
DEBIAN_FRONTEND=noninteractive apt-get update -y
DEBIAN_FRONTEND=noninteractive apt-get install -y ffmpeg
EOF

RUN ls -la
# bun install -g pm2
# pm2 -v

# run the app
USER bun
EXPOSE 3000/tcp
CMD [ "bun", "run", "--watch", "out/index.js" ]
