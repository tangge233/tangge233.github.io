+++
date = '2025-01-08T18:00:00+08:00'
draft = false
title = '损失函数学习笔记'
categories = ['Machine Learning']
tags = ['Notes']
+++

# 损失函数概念

损失函数（Loss Function）是用来描述模型的真实值与预测值之间的差距的函数。

在机器学习中，常使用损失函数得出数据与预期值之间的差值，从而可以去更新机器学习中的相关参数，以此达到学习的目的。

如果你想要最全面的损失函数列表，可以直接去 [PyTorch 文档](https://pytorch.ac.cn/docs/stable/nn.html#loss-functions)那查看所有的损失函数介绍。

# 几种损失函数

## 均方误差损失函数

Mean-Square Error，简称 MSE。~~没错就是高中数学给你讲过的那个均方误差。~~ 适用于回归问题。

### 计算方法

均方误差将每个数据点的误差值进行平方和相加之后除以数据总量得到模型的预测值与真实值的差异。

$$
L=\frac{1}{n}\sum_{i=1}^n(\hat{y_i}-y_i)^2
$$

其中 $\hat{y_i}$ 是模型算出的预测值，$y_i$ 是真实值，$n$ 为样本数量。

### Python 代码实现

```python
import torch

# 示例数据
y_true = torch.tensor([2, 4, 6],dtype=torch.float32)  # 真实值
y_pred = torch.tensor([1, 3, 5],dtype=torch.float32)  # 预测值

# 计算均方误差
mse = torch.nn.MSELoss()
loss = mse(y_true,y_pred)
print(f"Mean-Squared Error 结果：{loss.item():.6f}")
```

### 优点

对此函数进行求导运算（$\hat{y_i}$ 是自变量，$L$ 是应变量），可以得到

$$
\frac{d L}{d \hat{y_i}} = - \frac{2}{n} \sum_{i=1}^n (\hat{y_i} - y_i)
$$

不难看出导数不存在没有定义的点或者间断点，也就是说导数是连续的，也即原函数是可导且连续的。这也就是说可以使用梯度下降算法来优化。

大误差和小误差的惩罚不一致，越大的误差惩罚系数越大。

### 局限

数据中存在的异常值会由于平方计算的原因，使得其它样本的误差特征不能被准确体现出来。需要对异常的数值进行剔除再进行计算。

## 均方根误差损失函数

Root Mean Squared Error，简称 RMSE，也叫 L2 损失函数。也就是给 MSE 的计算结果进行了一次开方运算。适用于回归问题。

$$
L=\sqrt{\frac{1}{n}\sum_{i=1}^n(\hat{y_i}-y_i)^2}
$$

### Python 代码实现

```python
import torch

# 示例数据
y_true = torch.tensor([2, 4, 6],dtype=torch.float32)  # 真实值
y_pred = torch.tensor([1, 3, 5],dtype=torch.float32)  # 预测值

# 计算均方误差
mse = torch.nn.MSELoss()
loss = mse(y_true,y_pred)
# 开个方
loss = torch.sqrt(loss)
print(f"Mean-Squared Error 结果：{loss.item():.6f}")
```

### 特点

在大多数情况下是连续可导的。只有满足所有的 $\hat{y_i} = y_i$ 时，其不能连续可导。

### 局限

和 MSE 差不多（

## 平均绝对误差损失函数

Mean Absolute Error，简称 MAE，也叫 L1 损失函数。适用于回归问题。

此函数将 MSE 中的平方运算换成了绝对值运算。

$$
L=\frac{1}{n}\sum_{i=1}^n|\hat{y_i}-y_i|
$$

### 特点

由于使用的是绝对值而不是平方，因此鲁棒性相较好。

### Python 代码实现

```
import torch

# 示例数据
y_true = torch.tensor([2, 5, 7],dtype=torch.float32)  # 真实值
y_pred = torch.tensor([1, 3, 5],dtype=torch.float32)  # 预测值

# 计算平均绝对误差
mse = torch.nn.L1Loss()
loss = mse(y_true,y_pred)
print(f"Mean Absolute Error 结果：{loss.item():.6f}")
```

## Huber 损失函数

Huber 损失函数主要是集中了梯度下降时 MSE 的较准确和 MAE 应对异常值的鲁棒性的优势。适用于回归问题。

$$
L_\delta(y|\hat{y})=\begin{cases} \frac{1}{2}(y-\hat{y})^2,|y-\hat{y}|\le\delta \\ \delta |y-\hat{y}|-\frac{1}{2}\delta^2,|y-\hat{y}|>\delta \end{cases}
$$

其中  $\delta$ 是一个超参数（人为手动设置的一个值），用于选择是使用 MSE 还是 MAE 来计算。

### Python 代码实现

```python
import torch

# 示例输入
y_true = torch.tensor([2.0, 3.0, 4.0], dtype=torch.float32)
y_pred = torch.tensor([2.5, 3.2, 3.8], dtype=torch.float32)

# 计算 Huber 损失
huber_loss = torch.nn.HuberLoss()
loss = huber_loss(y_true,y_pred)
print(f"Huber Loss: {loss.item():.6f}")
```

## 均方对数误差

Mean Squared Logarithmic Error，简称 MSLE。适用于目标值范围非常大的回归问题。

$$
L = \frac{1}{n} \sum_{i=1}^{n} \left( \log(y_i + 1) - \log(\hat{y}_i + 1) \right)^2
$$

## 交叉熵损失函数

Cross-Entropy Loss。适用于分类问题，鼓励模型给出更精确的概率预测。

$$
L = -\sum_{i=1}^{n} y_i \log(\hat{y_i})
$$

其中 $y_i$ 常使用 [One-Hot](https://zhuanlan.zhihu.com/p/634296763) 编码，$\hat{y}$ 通常为 [Softmax 函数](https://zhuanlan.zhihu.com/p/105722023)的输出，$n$ 为类别的数量。

此函数在类别不平衡的情况下可能会偏向于多数类，因此可能需要使用权重参数来平衡结果。

### Python 代码实现

```python
import torch
import torch.nn as nn

# 示例数据
y_true = torch.tensor([[1, 0, 0], [0, 1, 0], [0, 0, 1]], dtype=torch.float32)  # 真实标签 (one-hot 编码)
y_pred = torch.tensor([[0.7, 0.2, 0.1], [0.1, 0.8, 0.1], [0.2, 0.3, 0.5]], dtype=torch.float32)  # 模型预测的概率分布

# 定义交叉熵损失函数
criterion = nn.CrossEntropyLoss()

# 计算损失
loss = criterion(y_pred, y_true)
print(f"Cross-Entropy Loss:{loss.item():.6f}")
```

## 二元交叉熵损失

Binary Cross-Entropy Loss。是交叉熵损失对于二分类问题的简化函数。

$$
L = -\sum_{i=1}^{n} [y_i \log(\hat{y}_i) + (1 - y_i) \log(1 - \hat{y}_i)]
$$

其中 $y_i$ 用 0 或 1 表示，$\hat{y}$ 通常为通常为 Sigmoid 函数的输出（模型预测的概率），$n$ 为类别的数量。

## 都计算损失

Hinge Loss 主要用于支持向量机（SVM），特别是二分类问题，旨在最大化分类间隔，同时确保分类的正确性。

$$
L = \frac{1}{n} \sum_{i=1}^{n} \max(0, 1 - y_i \hat{y_i})
$$

其中 $y_i$ 是真实标签，取值为 $\pm 1$ ， $\hat{y_i}$ 是模型的预测值，$n$ 是样本数量。

此函数认为，当 $y_i \hat{y_i} < 0$ 样本是被错误分类或者分类的间隔不足。由于只有这种样本才会对损失函数有贡献，所以能做到忽略部分异常值。

### Python 代码实现

```python
import torch
import torch.nn as nn

# 示例数据
y_true = torch.tensor([1, -1, 1, -1], dtype=torch.float32)  # 真实标签 (取值为 ±1)
y_pred = torch.tensor([0.8, -0.9, 0.7, -0.6], dtype=torch.float32)  # 模型预测值

# 定义铰链损失函数
criterion = nn.HingeEmbeddingLoss()

# 计算损失
loss = criterion(y_pred, y_true)
print(f"Hinge Loss:{loss.item():.6f}")
```

# 参考文章

1. [损失函数（Loss Function） - 知乎](https://zhuanlan.zhihu.com/p/261059231)
2. [神经网络中的损失函数（Loss Function） - 知乎](https://zhuanlan.zhihu.com/p/12864652528)
3. [torch.nn — PyTorch 2.6 文档 - PyTorch 深度学习库](https://pytorch.ac.cn/docs/stable/nn.html#loss-functions)
4. [损失函数 Loss Function 之 Huber loss - 知乎](https://zhuanlan.zhihu.com/p/554735911)