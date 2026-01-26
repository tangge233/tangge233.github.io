+++
date = '2025-05-05T18:00:00+08:00'
draft = false
title = '简易的 NAT 穿透实现'
categories = ['Network']
tags = ['Notes']
+++

# NAT 简单分类

| 代号 | 名称                            | 特征                                                                  |
| ---- | ------------------------------- | --------------------------------------------------------------------- |
| NAT1 | Full Cone（全锥型）             | 最宽松，端口映射之后 NAT 外用户甚至可以直接访问对应端口               |
| NAT2 | Restricted Cone（IP 限制锥型）  | 较严格，可映射到同端口，但是只允许之前主动访问过的 IP 访问此端口      |
| NAT3 | Restricted Cone（端口限制锥型） | 较严格，可映射到同端口，在 NAT2 的基础上多出了对于目标端口的要求      |
| NAT4 | Symmetric（对称型）             | 最严格，无法长期保持同一外部端口，只允许之前主动访问过的 IP:端口 访问 |

NATn 里的设备与 NATm 里的设备能达成通信的要求是 $n+m \le 6$ 。

# 穿透原理

NAT 穿透很简单，即通过访问目标 IP:端口 让 NAT 防火墙记录并允许与目标 IP:端口 进行双向通信。

NAT4 设计之初就是为了防止 NAT 穿透，即便你是源 IP:端口 相同，对外的端口也不一定相同，因此 NAT4 内的设备达成 NAT 穿透一般都是比较困难的。NAT1 基本没有什么限制，所以 NAT 穿透主要集中在 NAT2 和 NAT3 上。

# 具体实现

从上面的简单介绍表格中已经可以简单的知道 NAT2 与 NAT3 需要先访问一次目标 IP:端口 才能允许对方的访问。

显然，目前处于不知道自己的对外 IP:端口，也不知道别人的 IP:端口。

这里我们需要借助 STUN 服务器，获取到自己此时对外 IP:端口，并将数据通过中继服务器等方式发送给对方。这样我们就获取到对方的 IP:端口 了。

此处不关闭 TCP 连接，保持同一端口通信以确保对外的 IP:端口 没有发生改变。（当然也可以使用端口复用技术）

此时再向目标 IP:端口 发送任意数据即完成了简单了 NAT 穿透。（NAT 防火墙有了 源 IP:端口 - 目标 IP:端口 的记录，允许双向通信）

以下为 C# 代码，其中使用了 STUN 包。

```csharp
using STUN;

IPAddress[] stunIPs = Dns.GetHostAddresses("stun.miwifi.com");
IPEndPoint stunServer = new IPEndPoint(stunIPs[0], 3478);
var queryResult = STUNClient.Query(stunServer, STUNQueryType.ExactNAT, false);
var socket = queryResult.Socket;

// 发送任意消息
byte[] data = System.Text.Encoding.UTF8.GetBytes($"Hello world!");
IPEndPoint remoteEP = new(IPAddress.Parse("123.123.123.123"), 2333);
udpSocket.SendTo(data, remoteEP);

// 接收消息
while (true)
{
    byte[] buffer = new byte[1024];
    int received = udpSocket.ReceiveFrom(buffer, ref remoteEP);
    string message = System.Text.Encoding.UTF8.GetString(buffer, 0, received);
}


```

# 参考文章

* [NAT的四种分类：全锥形NAT,地址受限锥形NAT,端口受限锥形NAT,对称NAT - 知乎](https://zhuanlan.zhihu.com/p/556550190)