FROM quay.io/fedora/fedora-bootc:42

# Install deno
ARG DENO_DIR=/tmp/deno
COPY --from=docker.io/denoland/deno:bin-2.3.5 /deno /usr/bin/deno

ARG GNUPGHOME=/tmp/gnupg
RUN mkdir -p $GNUPGHOME && chmod 700 $GNUPGHOME

# Copy files
COPY . /usr/lib/azari/current
WORKDIR /usr/lib/azari/current

# Run build script
RUN deno task -c build/deno.json build && ostree container commit

## Verify the final image
RUN bootc container lint