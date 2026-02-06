+++
date = '2026-02-06T15:00:00+08:00'
draft = false
title = 'Cloudflare Workers 但是 Rust'
categories = ['Develop']
tags = ['Notes']
+++

Rust 是一个非常好用的语言，可以让你在不用过于关注内存问题的同时构造出高性能的应用程序。
Cloudflare Workers 是 Cloudflare 推出的 Serverless 服务，可以方便进行全球化部署。
刚好 Cloudflare Workers 使用 WebAssembly 驱动，也就是说我们完全可以使用 Rust 进行开发（考虑到我压根不会 TypeScript ~~这多是一件美事啊~~）

[官方仓库](https://github.com/cloudflare/workers-rs)

## Init

首先你需要 `wasm32-unknown-unknown` 的 target，使用 rustup 安装

```shell
rustup target add wasm32-unknown-unknown
```

更多关于 wasm32-unknown-unknown 可以查看[官方文档](https://doc.rust-lang.org/nightly/rustc/platform-support/wasm32-unknown-unknown.html) (也提供[中文文档](https://doc.rust-lang.net.cn/rustc/platform-support/wasm32-unknown-unknown.html))

官方推荐从 cargo generate 模板创建项目

```shell
cargo generate cloudflare/workers-rs
```

> 如果你没有 cargo generate 可以 `cargo install cargo-generate`
> 如果你 Rust 都没有……那……你应该先去 [rustup](https://rustup.rs/)

然后会问你要哪种类型的模板

```
? 🤷   Which template should be expanded? ›
❯ templates\axum
  templates\hello-world
  templates\hello-world-http
  templates\leptos
```

我习惯使用 Axum 进行开发了，所以直接选择了 Axum 模板

选择完成之后输入项目名称，随后同项目名称的文件夹就生成在当前目录下了 :)

在目录中我们可以找到 `wrangler.toml`，这是后续部署到 Cloudflare Workers 所需要使用的一个文件。

## Code

默认生成了一个 lib.rs 了

```rust
use axum::{routing::get, Router};
use tower_service::Service;
use worker::*;

fn router() -> Router {
    Router::new().route("/", get(root))
}

#[event(fetch)]
async fn fetch(
    req: HttpRequest,
    _env: Env,
    _ctx: Context,
) -> Result<axum::http::Response<axum::body::Body>> {
    Ok(router().call(req).await?)
}

pub async fn root() -> &'static str {
    "Hello Axum!"
}
```

## Build

让我们调试一下看看效果(此处还需要 Node.js，环境逐渐杂乱.png)

```
npx wrangler dev
```

> Windows 下如果出现失败可以换用尝试换用 PowerShell 执行或者把 build.command 改成 `worker-build --release`。（[关于 Windows PowerShell 和 PowerShell 不是一个东西](https://learn.microsoft.com/zh-cn/powershell/scripting/whats-new/differences-from-windows-powershell)）

等它构建完了就会说

```
[wrangler:info] Ready on http://127.0.0.1:8787
```

然后我们就能用浏览器或者 wget 访问 `http://127.0.0.1:8787` 看看怎么个事

不出意外会返回 `Hello Axum!`

那我们部署到 Cloudflare Workers 看看效果。

> 开发和部署都在本地。Workers 可不帮你构建 Rust 程序，这玩意耗时耗资源，简直在浪费 CPU 时间。

你首先需要用 wrangler 登录到 Cloudflare。

```shell
npx wrangler login
```

走流程登录授权，出现 `Successfully logged in.` 代表成功了。

然后就可以部署到 Cloudflare 了

```shell
npx wrangler deploy
```

完成之后你大概就能在 dashboard 中看到你的项目了