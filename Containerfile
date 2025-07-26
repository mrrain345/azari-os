FROM quay.io/fedora/fedora:42 AS builder

# Install dependencies
COPY --from=docker.io/denoland/deno:bin-2.3.5 /deno /usr/bin/deno
RUN mkdir /output

# Build the containerfile
ARG VERSION
COPY . /app
WORKDIR /app

RUN deno run \
  --allow-read=/app \
  --allow-write=/output \
  /app/build/main.ts \
  /app/manifest.yaml \
  $VERSION > /output/Containerfile

# Export the output files
FROM scratch
COPY --from=builder /output /