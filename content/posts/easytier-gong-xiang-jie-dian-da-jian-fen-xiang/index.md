+++
date = '2025-11-16T18:00:00+08:00'
draft = false
title = 'EasyTier 共享节点搭建分享'
categories = ['Develop']
tags = ['Notes']
+++

## 前言

最近看到很多人想搭建 EasyTier 共享节点但是不太会部署，看了其他人的教程后发现大多数不够全面，于是写了这一篇博客分享下自己的搭建方法。

> 本博客仅限于 EasyTier 的单点部署，操作均在 Debian 13 (Trixie) 上进行

## 部署 EasyTier

EasyTier 官方提供了 Docker 镜像和一件部署脚本。Docker 操作需要一定学习成本，操作麻烦，故此文章使用一键部署更加方便高效的方式。

运行下面的命令拉取安装脚本并启动

```
sudo apt update
sudo apt install wget unzip
wget -O /tmp/easytier.sh "https://raw.githubusercontent.com/EasyTier/EasyTier/main/script/install.sh" && sudo bash /tmp/easytier.sh install --gh-proxy https://cdn.crashmc.com/
```

可能会出现拉取脚本失败，请多重试

脚本会自动识别系统架构选择合适的二进制文件进行下载，当你看到 `Install EasyTier successfully!` 的时候表明安装成功了

## 配置 EasyTier

> 这里在 default 配置上进行修改。如果想要一个可辨识的名称，可以自行修改配置文件名称和服务标识符

```yaml
sudo nano /opt/easytier/config/default.conf
```

编辑文件，你也能把文件下载下来后修改再传上去

文件内容修改成如下内容（请注意替换部分字段）

```yaml
hostname = "你的节点名称"
instance_name = "你的网络名称"
dhcp = false
listeners = [
    "tcp://0.0.0.0:11010",
    "udp://0.0.0.0:11010"
]

rpc_portal = "0.0.0.0:0"

[network_identity]
network_name = "你的网络名称"
network_secret = "高强度密码"

[flags]
latency_first = false
disable_udp_hole_punching = false
relay_all_peer_rpc = true
```

对于高强度密码生成可以看下面的内容，请注意按照其中的内容替换文本

### 高连接数的情况

如果你的共享节点很受欢迎，很多人都来连接，那么会不可避免地出现文件描述符耗尽从而导致程序 panic 的情况，此时需要调整文件描述符的软限制

首先，执行 `ulimit -Hn` 查看一下文件描述符的硬限制

然后找一个比它小很多的数字，但是比你需要的 TCP 连接数大的数字，比如 8192 或者 16384，这些数字已经非常足够为 EasyTier 服务提供高连接数。

然后我们编辑下服务文件

```yaml
sudo nano /etc/systemd/system/easytier@.service
```

在 `RestartSec=1s` 下加入

```yaml
LimitNOFILE=8192 # 这里是你刚才选择的数字
```

然后

```yaml
sudo systemctl daemon-reload
sudo systemctl restart easytier@.service
```

这样一来这个服务就可以支持最高 8192 （你选择的数字）个 TCP 连接了

### 高强度密钥生成器

使用 Python 写的高强度密码生成器，`generate_secure_random_string` 默认生成 18 字节长度，你也可以指定生成任意字节长度，一般来说 128 字节已经足够安全。

```python
import secrets
import string

def generate_secure_random_string(length=18):
    charset = string.ascii_letters + string.digits
    return ''.join(secrets.choice(charset) for _ in range(length))

if __name__ == "__main__":
    print(generate_secure_random_string(128))

```

### 附加选项

#### 限制转发网络的名称

在 flags 中加入 `relay_network_whitelist` 字段，比如

```yaml
[flags]
relay_network_whitelist = "qwq* *awa TAT???" # EasyTier 使用 wildmatch 匹配网络名称 https://docs.rs/crate/wildmatch/latest
```

这样就限制了只转发前缀为 `qwq` 或者后缀为 `awa` 或者前缀为 `TAT` 并且后面只跟三个字符的网络名

如果你想只提供打洞服务，那就把白名单置空

#### 限制转发速率

在 flags 中加入 `foreign_relay_bps_limit` 字段，比如

```yaml
[falgs]
foreign_relay_bps_limit = 46948352  # 每个网络限制 15 Mbps 的转发速度
```

限速只针对每个单独的网络进行计算，并非总体限速，单位是 bps ~~莫非还能限速到 1bps~~

## 配置 Fail2ban

> 非常推荐部署此服务，此服务还可以阻断尝试爆破出你服务器密码的恶意工具
>
> 但请注意，此工具无法防御大规模网络攻击（比如 DDos、UDP Flood 等）。大规模的网络攻击流量应该由网络防火墙处理，而不是你的服务器。

显然你的节点配置好了，很多人想来连接你的节点，但是并不是所有连接都是高质量的，很多无效连接会导致资源浪费，这时候就需要使用 fail2ban 让这些连接“冷静”下（并非）。

```yaml
sudo apt install fail2ban
sudo nano /etc/fail2ban/filter.d/easytier.conf
```

```yaml
# /etc/fail2ban/filter.d/easytier.conf
# From EasyTier official
[Definition]
failregex = remote: \S+://<HOST>:\d+, err: wait resp error:.+
```

```yaml
sudo nano /etc/fail2ban/jail.local
```

```yaml
# /etc/fail2ban/jail.local
# From EasyTier official

[easytier]
enabled = true
filter  = easytier
backend = systemd
journalmatch = '_SYSTEMD_UNIT=easytier.service'
maxretry = 3 # 多少次尝试
bantime  = 3600 # 封禁时长
findtime = 600 # 探查时长
banaction = nftables-multiport
```

```yaml
sudo fail2ban-client reload
```

输出 OK 表示加载成功，然后你就可以通过

```yaml
sudo fail2ban-client status easytier
```

看看情况了

## 配置区域访问限制

通常这个可以在云服务商那操作屏蔽。如果服务商没有提供，可以使用 iptables + ipset 提供拦截。

> 操作 iptables 需要非常小心，搞不好会把自己拒之门外

```yaml
sudo apt install iptables ipset

# 创建地区 IP 集
ipset create region-ips hash:net family inet hashsize 1024 maxelem 65536

# 创建链
sudo iptables -N region-only
sudo iptables -A region-only -p tcp --dport 11010 -m set --match-set region-ips src -j RETURN
sudo iptables -A region-only -p udp --dport 11010 -m set --match-set region-ips src -j RETURN
sudo iptables -A region-only -p tcp --dport 11010 -j DROP
sudo iptables -A region-only -p udp --dport 11010 -j DROP

# 确认创建无误
sudo iptables --list

# 将 11010 端口流量导入入站链中
sudo iptables -A INPUT -p tcp --dport 11010 -j region-only
sudo iptables -A INPUT -p udp --dport 11010 -j region-only

```

下面是一个 IP 段自动更新脚本（你需要修改后使用）

```python
#!/usr/bin/env python3
import sys
import time
import ssl
import urllib.request
import urllib.error
import subprocess
import ipaddress
from typing import List

# 配置
IPSET_NAME = "region-ips"
MAIN_URL = "https://www.ipdeny.com/ipblocks/data/countries/??.zone"
CDN_URL_TEMPLATE = "https://fallback_cdn_here/{}"
MAX_RETRIES = 3
REQUEST_TIMEOUT = 10
SLEEP_BETWEEN_RETRIES = 2  # 秒

# 检查必要命令是否存在
if not subprocess.run(["/sbin/ipset"], capture_output=True).returncode != 0:
    print("[CRITICAL] ipset 命令未找到，请确认已安装 ipset 并位于 /sbin/ipset")
    sys.exit(1)

def run_cmd(cmd: List[str], check=True) -> str:
    """执行命令并支持重试"""
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=10)
            if check and result.returncode != 0:
                raise subprocess.CalledProcessError(result.returncode, cmd, result.stderr)
            return result.stdout.strip()
        except (subprocess.CalledProcessError, subprocess.TimeoutExpired) as e:
            if attempt == MAX_RETRIES:
                print(f"[ERROR] 命令失败（{attempt}/{MAX_RETRIES}）: {' '.join(cmd)} | 错误: {e}")
                raise
            print(f"[WARN] 命令失败（{attempt}/{MAX_RETRIES}），{SLEEP_BETWEEN_RETRIES}秒后重试: {' '.join(cmd)}")
            time.sleep(SLEEP_BETWEEN_RETRIES)
    return ""

def fetch_cidrs() -> List[str]:
    """下载并解析 IP 段列表，支持主站 + CDN 回退与重试"""
    urls_to_try = [
        MAIN_URL,
        CDN_URL_TEMPLATE.format(MAIN_URL.split("://", 1)[-1])  # 替换为 CDN 地址
    ]

    for url in urls_to_try:
        print(f"[INFO] 尝试从 {url} 下载 IP 段列表...")
        for attempt in range(1, MAX_RETRIES + 1):
            try:
                # 创建安全的 SSL 上下文（启用证书验证）
                context = ssl.create_default_context()

                with urllib.request.urlopen(url, timeout=REQUEST_TIMEOUT, context=context) as response:
                    content = response.read().decode('utf-8').strip()
                    lines = [line.strip() for line in content.splitlines() if line.strip() and not line.startswith("#")]

                    # 校验每行是否为合法 CIDR
                    valid_cidrs = []
                    for cidr in lines:
                        try:
                            ipaddress.ip_network(cidr, strict=False)
                            valid_cidrs.append(cidr)
                        except ValueError:
                            print(f"[WARN] 跳过无效 CIDR（来自 {url}）: {cidr}")
                            continue

                    print(f"[INFO] 成功从 {url} 获取 {len(valid_cidrs)} 个有效 IP 段")
                    return valid_cidrs

            except urllib.error.URLError as e:
                if attempt == MAX_RETRIES:
                    print(f"[ERROR] 从 {url} 下载失败（{attempt}/{MAX_RETRIES}）: {e}")
                    continue  # 尝试下一个 URL
                print(f"[WARN] 下载失败（{attempt}/{MAX_RETRIES}），{SLEEP_BETWEEN_RETRIES}秒后重试: {url} | 错误: {e}")
                time.sleep(SLEEP_BETWEEN_RETRIES)
            except Exception as e:
                if attempt == MAX_RETRIES:
                    print(f"[ERROR] 解析或连接异常（{attempt}/{MAX_RETRIES}）: {e}")
                    continue
                print(f"[WARN] 异常（{attempt}/{MAX_RETRIES}），{SLEEP_BETWEEN_RETRIES}秒后重试: {url} | 错误: {e}")
                time.sleep(SLEEP_BETWEEN_RETRIES)

    print("[CRITICAL] 所有源（主站 + CDN）均失败，无法获取 IP 段")
    return []

def main():
    print("[START] 正在更新 IP 段到 ipset...")

    # 1. 下载最新 CIDR 列表
    cidrs = fetch_cidrs()
    if not cidrs:
        print("[CRITICAL] 无法获取任何有效 IP 段，取消更新以避免误封！")
        sys.exit(1)

    # 2. 清空现有 ipset
    try:
        run_cmd(["/sbin/ipset", "flush", IPSET_NAME])
        print(f"[INFO] 已清空 ipset: {IPSET_NAME}")
    except subprocess.CalledProcessError:
        print(f"[ERROR] ipset '{IPSET_NAME}' 不存在！请先运行完整配置脚本创建它。")
        sys.exit(1)

    # 3. 批量加载新 CIDR
    loaded = 0
    failed = 0
    for cidr in cidrs:
        try:
            # 再次校验（防御性编程）
            ipaddress.ip_network(cidr, strict=False)
            run_cmd(["/sbin/ipset", "add", IPSET_NAME, cidr])
            loaded += 1
        except ValueError:
            print(f"[WARN] 跳过无效 CIDR（二次校验）: {cidr}")
            failed += 1
        except subprocess.CalledProcessError as e:
            print(f"[WARN] 添加 {cidr} 失败: {e}")
            failed += 1

    print(f"[SUCCESS] 已更新 ipset '{IPSET_NAME}'，共加载 {loaded}/{len(cidrs)} 个有效 IP 段 "
          f"({failed} 个失败或无效)")

if __name__ == "__main__":
    main()

```

通过 crontab 配置在网络流量低峰期（一般是早上）进行 ipset 更新

## 其他提醒

确保你只开放了需要的端口，作为共享节点要保证好本节点的数据安全。