FROM quay.io/fedora/fedora-bootc:42

# Install deno
ARG DENO_DIR=/tmp/deno
COPY --from=docker.io/denoland/deno:bin-2.3.5 /deno /usr/bin/deno

ARG GNUPGHOME=/usr/lib/gnupg
RUN mkdir -p /usr/lib/gnupg

# Copy files
COPY . /usr/lib/azari/current
WORKDIR /usr/lib/azari/current

RUN dnf install -y https://download1.rpmfusion.org/free/fedora/rpmfusion-free-release-42.noarch.rpm https://download1.rpmfusion.org/nonfree/fedora/rpmfusion-nonfree-release-42.noarch.rpm

# Run build script
RUN deno task -c build/deno.json build

# Clean up
WORKDIR /
RUN rm -rf /tmp/*
RUN dnf clean all
RUN rm -rf /var/*

## Commit and verify final image
RUN ostree container commit
RUN bootc container lint