# AzariOS

Custom declarative immutable linux system based on Fedora bootc.

## Build an image

```sh
# Rebuild, push to the registry and switch active system
# - without upgrading the base image
sudo ./build.sh switch

# - with upgrading the base image
sudo ./build.sh upgrade
```

## Restore dotfiles

```sh
stow -t ~ dotfiles
```

## Switch versions

```sh
sudo bootc switch --transport containers-storage docker.io/mrrain345/azari:latest
```

## Useful links

- [Bootc manual](https://bootc-dev.github.io/bootc/)
- [Fedora bootc repo](https://gitlab.com/fedora/bootc/base-images)
- [Fedora bootc examples](https://gitlab.com/fedora/bootc/examples)
- [RPM Find](https://rpmfind.net/linux/rpm2html/search.php?query=&system=fedora&arch=x86_64)
- [Fedora Packages](https://packages.fedoraproject.org/)
