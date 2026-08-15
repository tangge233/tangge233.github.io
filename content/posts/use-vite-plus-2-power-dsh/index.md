+++
date = '2026-08-15T18:00:00+08:00'
draft = false
title = '使用 VitePlus 驱动 DeepSeek Harness'
categories = ['Resource']
+++

## 开门见山

安装 VitePlus

```
# For Linux/MacOS
curl -fsSL https://vite.plus | bash

# For Windows
irm https://vite.plus/ps1 | iex
```

使用 VitePlus 管理工具链并托管 DeepSeek Harness (DSH，DeepSeek 官方推出的 Agent 工具)

```
vp i -g @deepseek-ai/dsh
```

之后只需要在终端中运行

```
dsh web
```

即可启动 DSH。

VitePlus 同时支持一键更新其所托管的全局包。

```
vp up -g
```

同理，OpenCode、WorkBuddy 等等工具助手也都可以方便地安装

```
# 官方格式
npm install -g @tencent-ai/codebuddy-code
# 使用 VitePlus
vp i -g @tencent-ai/codebuddy-code

# 官方格式
npm i -g opencode-ai
# 使用 VitePlus
vp i -g opencode-ai
```
## 优势

使用管理方便，无需关注以及选择 Node.js 和包管理器，对于不熟悉 Node.js 生态并的用户比较友好
