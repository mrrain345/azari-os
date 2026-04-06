# FROM docker.io/mrrain345/azari:25.9.0

# RUN echo "exclude=*nvidia*" >> /etc/dnf/dnf.conf
# COPY res/astal-shell /usr/lib/azari/astal-shell


# RUN dnf copr enable -y atim/starship && \
#     dnf copr enable -y alternateved/eza && \
#     dnf copr enable -y scottames/ghostty

# RUN dnf -y update && \
#     dnf -y upgrade

# RUN dnf install -y fish bat eza zoxide fd fzf ripgrep starship ghostty

# FROM docker.io/mrrain345/azari:26.2.0
# LABEL org.opencontainers.image.version="26.2.1"

# RUN dnf -y update && dnf -y upgrade

# RUN dnf install -y hyprpanel wireplumber upower libgtop2 bluez bluez-tools grimblast hyprpicker btop NetworkManager wl-clipboard swww brightnessctl gnome-bluetooth power-profiles-daemon gvfs nodejs gtksourceview3 libsoup3

# FROM docker.io/mrrain345/azari:26.2.1
# LABEL org.opencontainers.image.version="26.2.2"

# RUN dnf -y update && dnf -y upgrade

# RUN dnf install -y python3-pip
# RUN pip3 install gpustat

# COPY res/astal-shell /usr/lib/azari/astal-shell

# FROM docker.io/mrrain345/azari:26.2.2
# LABEL org.opencontainers.image.version="26.2.3"

# RUN dnf -y update && dnf -y upgrade

# RUN dnf install -y oh-my-posh

# FROM docker.io/mrrain345/azari:26.2.3
# LABEL org.opencontainers.image.version="26.2.4"

# RUN dnf -y update && dnf -y upgrade

# RUN dnf copr enable -y avengemedia/dms
# RUN dnf install -y dms

# RUN systemctl --global enable dms

# FROM docker.io/mrrain345/azari:26.2.4
# LABEL org.opencontainers.image.version="26.2.5"

# RUN dnf -y update && dnf -y upgrade

# RUN dnf copr enable -y avengemedia/danklinux
# RUN dnf install -y matugen dgop danksearch cliphist

# FROM docker.io/mrrain345/azari:26.2.5
# LABEL org.opencontainers.image.version="26.3.0"

# RUN dnf -y update && dnf -y upgrade

FROM docker.io/mrrain345/azari:26.3.0
LABEL org.opencontainers.image.version="26.3.1"

RUN dnf -y update && dnf -y upgrade

RUN dnf install -y hyprpaper
RUN systemctl --global enable hyprpaper