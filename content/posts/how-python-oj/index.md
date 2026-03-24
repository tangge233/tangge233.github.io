+++
date = '2026-03-22T18:00:00+08:00'
draft = false
title = 'Python 怎么 OJ'
categories = ['Algorithm']
tags = ['Notes']
+++

## 起因

蓝桥杯是大学里喜闻乐见（迫真）的算法比赛，并且允许你选择 Python 作为竞赛语言。Python 总所周知是一个非常方便的语言，但是运行解释性能使得其面对 C/C++ 有时候力不从心。面对 Python 我们并非无能为力，~~可以去隔壁 PyPy3 碰碰运气~~，通过充分利用语言特性能最大程度减少不必要的开销。

## 环境问题

蓝桥杯目前依旧采用极其先进的 Python 3.7.3，与现在主流版本(Python 310-312)有极大的性能和语法差距。Python 官方对此版本结束支持已有两年多。

Python 安装一般都是推荐使用虚拟环境，这样可以防止依赖相互打架。但目前通过 [uv](https://docs.astral.sh/uv/) 能安装最低 Python 版本是 3.8.16，与蓝桥杯所使用的差别很大。如果你不介意全局安装的话，可以直接从 [Python 官网那下载](https://www.python.org/ftp/python/3.7.3/python-3.7.3-amd64.exe)。

对于使用虚拟环境的同学来说，只能暂时妥协在本地使用 Python 3.8 了，或者尝试换用 Anaconda 虚拟化环境管理。目前 [uv 不支持更低版本的 Python 虚拟环境](https://github.com/astral-sh/uv/issues/9833)。

除了 Python3 之外，环境还支持 PyPy3。PyPy3 使用了 JIT 技术，可以让 Python 代码跑的很快。

## 学习过程中的记录

### 数据的读取

蓝桥杯的环境支持你从 sys.stdin 中获取输入，或者 input() 获取每一行数据。
sys.stdin 读取比 input() 更快，但是结尾会带有 `\n`。

不过结尾的换行符一般问题不大，这是由于我们在编写代码的时候经常会 split() 拆分读取数据。

```Python
m, n = map(int, sys.stdin.readline().split())

arrs = list(map(int, sys.stdin.readline().split()))
```

可以进行 1000000 万行数据读取测试

```Python
import sys
import time


def test_input():
    n = int(input())
    total = 0
    for _ in range(n):
        total += int(input())
    return total


def test_readline():
    data = sys.stdin.readline()
    n = int(data)
    total = 0
    for _ in range(n):
        total += int(sys.stdin.readline())
    return total


if __name__ == "__main__":
    with open("test.txt", "w") as f:
        f.write("1000000\n")
        for i in range(1000000):
            f.write(f"{i}\n")
    # 重定向标准输入
    sys.stdin = open("test.txt", "r")

    start = time.time()
    test_input()
    print(f"input() 耗时: {time.time() - start:.2f} 秒")

    sys.stdin.seek(0)  # 重置文件指针
    start = time.time()
    test_readline()
    print(f"readline() 耗时: {time.time() - start:.2f} 秒")
```

测试结果
```
input() 耗时: 0.45 秒
readline() 耗时: 0.15 秒
```

PyPy3 结果
```
input() costs: 0.77 s
readline() costs: 0.09 s
```

### 尽量使用内置 C 实现

Python 中的自带库基本都是 C 实现的，速度往往比自实现更加快。

就比如可以写个简单的速度测试，测试一下欧几里得算法求取最大公约数、Stein 算法(二进制 GCD)与 `math.gcd` 谁的耗时更小。

```Python
import random
from math import gcd
from timeit import timeit

N = 100000  # 数据对数量
random.seed(42)
pairs = [(random.randint(1, 10**6), random.randint(1, 10**6)) for _ in range(N)]


def euclidean_gcd(a: int, b: int) -> int:
    """欧几里得"""
    while b:
        a, b = b, a % b
    return a


def binary_gcd(a: int, b: int) -> int:
    """Stein"""
    if a == 0:
        return b
    if b == 0:
        return a
    shift = 0
    while ((a | b) & 1) == 0:
        a >>= 1
        b >>= 1
        shift += 1
    while (a & 1) == 0:
        a >>= 1
    while b:
        while (b & 1) == 0:
            b >>= 1
        if a > b:
            a, b = b, a
        b -= a
    return a << shift


def measure_time(func):
    def wrapper():
        for a, b in pairs:
            func(a, b)

    # 使用 timeit.timeit 运行一次 wrapper 函数，number=1
    t = timeit(wrapper, number=1)
    return t


def main():
    print(f"math.gcd: {measure_time(gcd):.5f} 秒")
    print(f"euclidean_gcd: {measure_time(euclidean_gcd):.5f} 秒")
    print(f"binary_gcd: {measure_time(binary_gcd):.5f} 秒")


if __name__ == "__main__":
    main()
```

测试结果
```
math.gcd: 0.01378 秒
euclidean_gcd: 0.06009 秒
binary_gcd: 0.49079 秒
```

PyPy3 结果
```
math.gcd: 0.00826 s
euclidean_gcd: 0.00800 s
binary_gcd: 0.02637 s
```

很明显，在 Python 中基于 C 实现的 math.gcd 的速度比自实现的快非常多。
在 PyPy3 中，自实现的 euclidean_gcd 反而比 math.gcd 稍快，但是差距不明显。

如果再加入幂计算的比较

```Python
import math
import timeit
from typing import Callable


def fast_pow(base: int, exp: int) -> int:
    result = 1
    while exp:
        if exp & 1:
            result *= base
        base *= base
        exp >>= 1
    return result


def benchmark(name: str, func: Callable, *args, number: int = 1_000_000):
    stmt = "func(*args)"
    globals_dict = {"func": func, "args": args}
    timer = timeit.Timer(stmt, globals=globals_dict)
    try:
        total_time = min(timer.repeat(repeat=5, number=number))
        avg_ns = (total_time / number) * 1e9
        print(f"{name:20} | {avg_ns:>10.2f} ns  (loop {number} times)")
    except Exception as e:
        print(f"{name:20} | Error: {e}")


def main():
    print("\n[1] 3 ** 10")
    benchmark("fast_pow", fast_pow, 3, 10, number=1_000_000)
    benchmark("math.pow", math.pow, 3, 10, number=1_000_000)
    benchmark("**", lambda x, y: x**y, 3, 10, number=1_000_000)
    benchmark("pow", pow, 3, 10, number=1_000_000)

    print("\n[2] 123456 ** 1000")
    benchmark("fast_pow", fast_pow, 123456, 1000, number=10_000)
    benchmark("**", lambda x, y: x**y, 123456, 1000, number=10_000)
    benchmark("pow", pow, 123456, 1000, number=10_000)
    # math.pow 会溢出或转浮点丢失精度，单独捕获
    benchmark("math.pow", math.pow, 123456, 1000, number=10_000)

    print("\n[3] 3.14 ** 2.5")
    benchmark("math.pow", math.pow, 3.14, 2.5, number=1_000_000)
    benchmark("**", lambda x, y: x**y, 3.14, 2.5, number=1_000_000)
    benchmark("pow", pow, 3.14, 2.5, number=1_000_000)


if __name__ == "__main__":
    main()
```

运行结果
```
[1] 3 ** 10
fast_pow             |     304.63 ns  (loop 1000000 times)
math.pow             |      62.20 ns  (loop 1000000 times)
**                   |     154.78 ns  (loop 1000000 times)
pow                  |     127.11 ns  (loop 1000000 times)

[2] 123456 ** 1000
fast_pow             |   74179.44 ns  (loop 10000 times)
**                   |   27398.52 ns  (loop 10000 times)
pow                  |   27746.79 ns  (loop 10000 times)
math.pow             | Error: math range error

[3] 3.14 ** 2.5
math.pow             |      48.33 ns  (loop 1000000 times)
**                   |      83.77 ns  (loop 1000000 times)
pow                  |      54.80 ns  (loop 1000000 times)
```

PyPy3 结果
```
[1] 3 ** 10
fast_pow             |      35.52 ns  (loop 1000000 times)
math.pow             |      44.67 ns  (loop 1000000 times)
**                   |      27.43 ns  (loop 1000000 times)
pow                  |      25.03 ns  (loop 1000000 times)

[2] 123456 ** 1000
fast_pow             |   60313.87 ns  (loop 10000 times)
**                   |   26655.75 ns  (loop 10000 times)
pow                  |   26691.16 ns  (loop 10000 times)
math.pow             | Error: math range error

[3] 3.14 ** 2.5
math.pow             |      44.59 ns  (loop 1000000 times)
**                   |      47.67 ns  (loop 1000000 times)
pow                  |      47.00 ns  (loop 1000000 times)
```

结果显示 Python 中，`math.pow` 是非常快的，但是对于比较大的数据会超范围报错。
PyPy3 中 fast_pow 在小数据量的时候稍占优势，但是数据量增大之后被 pow 远远超越。考虑到运算的时候经常会进行取模，使用 pow 进行幂运算是一个不错的选择。

说了这么多差不多就是能用 PyPy3 就 PyPy3，能用内置的 C 实现就尽量使用，除非没有我们需要的运算(如矩阵快速幂等)。

### 优先选择 deque

递归解决问题固然很好用，并且使用递归解决问题代码简单易懂。但是使用 deque 可以做到更少的内存占用以及无深度限制。

```Python
from collections import deque
from timeit import timeit


def queue(depth: int):
    queue = deque()

    for i in range(depth):
        queue.append(i)
    for i in range(depth):
        _ = queue.popleft()


def recursive(depth: int):
    if depth > 0:
        recursive(depth - 1)


def measure_time(func, *args, **kwargs):
    def wrapper():
        func(*args, **kwargs)

    t = timeit(wrapper)
    return t


def main():
    N = int(1e2)
    print(f"Queue: {measure_time(queue, N):.5f}")

    print(f"Recursive: {measure_time(recursive, N):.5f}")


if __name__ == "__main__":
    main()
```

测试结果
```
Queue: 4.30713
Recursive: 4.84971
```

使用 PyPy3 结果
```
Queue: 0.32187
Recursive: 0.32974
```

两者耗时差距很小，但是 Python 这么多循环下来后留给题目的耗时空间非常小了，遇到 TLE 可以试试 PyPy3.

~~其实 Rust 只需要 90.6789ms 就能完成 1000000 次循环的 100 入队出队，Python 慢炸了~~

### 0 与 1 开始

在处理数据的时候你经常会遇到题目从 0 或者 1 开始表示数据。在处理时最好统一下标，以确保后续代码编写思路不出小问题，除非统一格式的代价太大（多次频繁的 +1 -1 的计算开销）。

### 推导式和循环构建差异不大

Python 中你可以使用推导式构建数组或者字典

```Python
# 推导式
some_thing = {k: v for k, v in enumerate(arr)}

# 循环
some_thing = dict()
for k, v in enumerate(arr):
    some_thing[k] = v
```

这两的性能差异非常微小

### 持续更新中……
