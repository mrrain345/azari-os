FROM quay.io/fedora/fedora:42 AS builder

# Install dependencies
COPY --from=docker.io/denoland/deno:bin-2.3.5 /deno /usr/bin/deno
RUN dnf install -y 'dnf5-command(copr)' nodejs22 git \
&& dnf copr enable -y solopasha/hyprland \
&& dnf install -y aylurs-gtk-shell2 \
&& npm install -g sass

RUN mkdir /output

# Build astal shell
COPY ./shell /tmp/astall
RUN ags bundle /tmp/astall/app.ts /output/astal-shell

# Build the containerfile
ARG VERSION
COPY . /app
RUN deno run --allow-read=/app /app/build/main.ts /app/manifest.yaml $VERSION > /output/Containerfile

# Export the output files
FROM scratch
COPY --from=builder /output/* /