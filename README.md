# AzariOS

Custom declarative immutable linux system based on Fedora bootc.

## Building an image

```sh
podman build --security-opt=label=disable --cap-add=all --device /dev/fuse -t docker.io/mrrain345/azari:VERSION .
```

## Useful links

- [Bootc manual](https://bootc-dev.github.io/bootc/)
- [Fedora bootc repo](https://gitlab.com/fedora/bootc/base-images)
- [Fedora bootc examples](https://gitlab.com/fedora/bootc/examples)
- [RPM Find](https://rpmfind.net/linux/rpm2html/search.php?query=&system=fedora&arch=x86_64)
