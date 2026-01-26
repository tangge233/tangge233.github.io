+++
date = '2025-10-30T18:00:00+08:00'
draft = false
title = 'Gatus - 面向开发者的服务监控'
categories = ['Resource']
tags = ['Notes']
+++

## 起因

我在给自己的服务部署监控工具的时候发现 Uptime Kuma 官方提供的 Docker 镜像的体积有点太大了 (Docker 镜像大小 1.5GB)，在我的监控小设备上浪费的空间有点多。于是我开始寻找一个体积小但是功能齐全的服务监控工具，然后就找到了 Gatus 这样一款软件。

[GitHub 仓库](https://github.com/TwiN/gatus)

## 使用体验

不同于 Uptime Kuma，Gatus 的参数配置没有 Web UI，仅有的 Web UI 只是给你看服务情况的，一切配置都需要通过更新配置文件完成。

安装完成后通过 Docker 的监控可以发现这款工具在还未部署服务的情况下内存占用很低，大概在 8MB。在部署了 3 个 HTTP 监控和一个 TCP 监控并设置存储方式为 sqlite 之后，内存占用来到 12MB 左右，对我的小设备很是友好。

> 在我的设备上由于存储空间受限，所以 Gatus 更受到我的关注。Uptime Kuma 也是很优秀的监控软件。

## 使用

官方提供了两种使用 Gatus 的方式

第一种是懒人式的，[直接使用作者的托管服务](https://gatus.io/)。无免费计划，有 7 天试用期。

第二种是使用 Docker 部署

```shell
docker run -p 8080:8080 --name gatus twinproduction/gatus:stable
```

部署完成之后会在 8080 页面展示示例监控，但我们想要监控自己的服务，所以需要挂载配置目录和数据目录到本地目录。你可以使用作者提供的示例中的合适文件，或者用下面的 docker-compose.yml 也行，但无论如何请按照自己的需求修改文件后再  `docker compose up -d` 。

```yaml
services:
  gatus:
    image: twinproduction/gatus:latest
    ports:
      - "3002:8080"
    volumes:
      - /opt/gatus/config:/config
      - /opt/gatus/data:/data/
```

## 修改配置

如果你使用了上面的文件，直接使用下面的命令编辑文件，我用的是 nano 编辑器，你可以换用自己熟悉或喜欢的。

```yaml
sudo nano /opt/gatus/config/config.yaml
```

添加监控对象添加 `endpoints` 字段。

如果需要持久化存储健康数据，需要添加 `storage` 字段。

如果需要添加告警通知，需要添加 `alerting` 字段。

所有信息，[作者都在 readme 中详细解释了](https://github.com/TwiN/gatus?tab=readme-ov-file#)。

下面是一个示例内容

```yaml
storage:
  type: sqlite
  path: /data/data.db

alerting:
  email:
    from: "example@example.com"
    password: "empty for no auth :)"
    host: "stmp.example.com"
    port: 587
    default-alert:
      description: "Health check failed"
      send-on-resolved: true
      failure-threshold: 2
      success-threshold: 2
    to: "youremailaddr@example.com"
    overrides:
      - group: "MyTeam"
        to: "youremailaddr@example.com,ateammember@example.com"

endpoints:
  - name: A-Service
    group: MyTeam
    url: "tcp://1.1.1.1:80"
    interval: 5m
    conditions:
      - "[CONNECTED] == true"
    alerts:
      - type: email
        group: MyTeam
        description: "one one one one is down?!"
```