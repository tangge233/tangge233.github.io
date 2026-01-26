+++
date = '2025-01-06T18:00:00+08:00'
draft = false
title = 'armv7l 设备可玩软件分享'
categories = ['Resource']
+++

## 前言

这里有一些自己收集的可以跑在 armv7l 设备上的软件，你也可以在评论区里分享更多的可玩软件。

以下内容没有先后顺序。看到自己安装了什么就写了什么

## 1Panel

开源的 Linux 管理面板，功能轻量，免费版本足够日常使用，并且可视化的操作方便了设备的管理。

[官网](https://1panel.cn/)

## Tailscale

异地组网软件

[官网](https://tailscale.com/)

## qBittorrent Enhanced Edition

qBittorrent 的加强版本，支持联网自动更新 Tracker 列表，同时支持 armv7l 版本

armv7l 设备需要下载名称为 qbittorrent-enhanced-nox_arm-linux-musleabihf_static 的版本

[下载页面](https://github.com/c0re100/qBittorrent-Enhanced-Edition/releases)

## Uptime Kuma

开源的服务监控程序，使用 Docker 部署

[项目页面](https://github.com/louislam/uptime-kuma)

## OpenList

开源的存储管理程序，推荐使用 Docker 部署

[项目网站](https://oplist.org/zh/)

## AdguardHome

开源的 DNS 服务端，常用于广告拦截，在 Linux 或 MacOS 下部署可使用自带的 DHCP 功能。

[项目页面](https://github.com/AdguardTeam/AdGuardHome)

## Syncthing

文件同步软件

[项目网站](https://syncthing.net/)

[Docker 部署文档](https://docs.syncthing.net/users/contrib.html#docker)

## Portainer

用于管理 Docker。与 1Panel 的 Docker 管理结合起来使用体验更好。

[项目网站](https://docs.syncthing.net/users/contrib.html#docker)

## Redis 和 PostgreSQL

数据库，没什么好多说的 :)

[Redis 官网](https://redis.io/)

[PostgreSQL 官网](https://www.postgresql.org/)

## Gitea

Gitea 本身没有 armv7l 的发行版本，但是有第三方版本支持了这个架构（原本是给树莓派用的）。
```bash
patrickthedev/gitea-rpi
```
## Nginx

高性能的 HTTP 服务端，推荐 Docker 部署

[项目网站](https://nginx.org/en/)

## Cloudflared

Cloudflare Tunnel 客户端

网心云下载名称为 cloudflared-linux-armhf.deb 的文件，然后使用下面的命令安装 deb 包。
```bash
sudo dpkg -i cloudflared-linux-armhf.deb
```
之后按照 Cloudflare 文档中安装密钥的步骤安装密钥使用。

[下载页面](https://github.com/cloudflare/cloudflared/releases)

## DDNS

动态 DNS，可以自动将你的公网 IPv4/IPv6 地址解析到对应的域名服务上。

[项目页面](https://github.com/jeessy2/ddns-go)