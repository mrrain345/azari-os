FROM quay.io/fedora/fedora:43 AS builder

# Install dependencies
COPY --from=docker.io/denoland/deno:bin-2.5.6 /deno /usr/bin/deno
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