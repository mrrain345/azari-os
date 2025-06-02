FROM quay.io/fedora/fedora-bootc:42

# Install deno
ARG DENO_DIR=/tmp/deno
COPY --from=docker.io/denoland/deno:bin-2.3.5 /deno /usr/bin/deno

# Copy files
COPY . /usr/lib/azari/current
WORKDIR /usr/lib/azari/current

# Run build script
RUN deno task -c build/deno.json build && ostree container commit

# Clean up
WORKDIR /
RUN rm -rf /tmp/deno
RUN dnf clean all
RUN rm -rf /var/*

## Commit and verify final image
RUN ostree container commit
RUN bootc container lint