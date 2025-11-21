FROM quay.io/fedora/fedora:43 AS builder

# Install dependencies
COPY --from=docker.io/denoland/deno:bin-2.5.6 /deno /usr/bin/deno
RUN dnf install -y 'dnf5-command(copr)' nodejs22 git \
  && dnf copr enable -y solopasha/hyprland \
  && dnf install -y aylurs-gtk-shell2 \
  && npm install -g sass

RUN mkdir /output

# Build astal shell
COPY ./shell /app
RUN ags bundle /app/app.ts /output/astal-shell

# Export the output files
FROM scratch
COPY --from=builder /output /