+++
date = '2025-01-24T18:00:00+08:00'
draft = false
title = 'Git 从其它仓库的分支拉取并合并到当前分支'
categories = ['Develop']
+++

在部分时候，你的 Fork 仓库需要合并上游仓库特定分支的内容，很显然你可以使用 GitHub 的 New pull request 合并，但这仅限于没有冲突或者冲突较少的情况，而且还会留下一次 PR 记录，对想要经常更新上游仓库内容的开发者来说很难受。这时候可以使用下面的 git 操作完成本地分支更新。

其实只需要在当前分支执行下面 这行命令就可以将 example/example 仓库拉取 TargetBranch  分支并合并到当前分支

```bash
git pull git@github.com:example/example.git TargetBranch
```
可以搭配 Visual Studio Code 解决合并时的冲突