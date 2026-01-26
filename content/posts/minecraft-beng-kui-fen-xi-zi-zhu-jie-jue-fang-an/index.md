+++
date = '2025-03-01T18:00:00+08:00'
draft = false
title = 'Minecraft 崩溃分析自助解决方案'
categories = ['Resource']
tags = ['Minecraft']
+++

# 一般分析思路

## 二分禁用法

不断将 Mod 分为两类，将不会发生冲突崩溃的部分放入加载，直到崩溃产生找到存在问题的模组

## 重新安装法

之前还能玩，之后突然不能玩了，在排除存档的问题情况下，尝试重新安装整合包解决此问题

## 禁用插头

插头指的是[信雅互联（Sinytra Connector）](https://www.mcmod.cn/class/11627.html)和 [Kilt](https://www.mcmod.cn/class/16277.html) 这类可以支持跨加载器加载模组的模组，通常不稳定，非必要也不建议使用

## 丢给启动器分析

目前已知 PCL 和 HMCL 都支持了崩溃分析，可以把崩溃报告丢给对应的启动器，启动器会依据特征给出相应的参考解决方案

# 常见不兼容

## OptiFine

基本上高版本 1.12.2 及以上不再推荐使用 OptiFine，由于其闭源并且做出许多破坏性改动使得其与其它模组的兼容性极差。对于高版本可以用 Sodium + Iris 组合代替。

```
OptiFine 导致了游戏崩溃，请删掉 OptiFine。如有开光影需求，请考虑使用 Sodium + Iris 组合代替
```

安装了多个 OptiFine

在启动参数中可以看到重复的 OptiFine 参数，这通常是由于使用了一些启动器提供的修改实例功能导致的错误。

```
你安装了多个 OptiFine，备份此版本的数据（世界、模组设置、客户端设置、服务器列表、资源包、模组包等内容）后重新安装此版本
```

## Valkyrien Skies/Valkyrien Warfare 与 Connector Extras

Connector Extras 存在相关问题，会导致

Mixin apply for mod reach_entity_attributes failed mixins.reach-entity-attributes.json:client.GameRendererMixin from mod reach_entity_attributes

使用 [zxy19](https://github.com/zxy19) 大佬编写的[临时修复版本](https://github.com/Sinytra/ConnectorExtras/files/14906855/ConnectorExtras-1.10.0%2B1.20.1%2Bdev-g9a9680e.zip)

```
Valkyrien Skies/Valkyrien Warfare 与 Connector Extras 不兼容，把 Connector Extras 换成这个版本
https://tangge233.lanzouv.com/iFIzy2pnkn1a
```

# 特征分析

## 缺少前置问题

java.lang.Exception: Mod Loading has failed

Failure message: Mod `模组名称` requires `前置模组`  `前置模组要求最低版本` or above
Currently, `前置模组` is not installed

Failure message: The Man From The Fog (man) has failed to load correctly
java.lang.NoClassDefFoundError: software/bernie/geckolib3/core/IAnimatable

Error loading class: mekanism/client/render/armor/MekaSuitArmor (java.lang.ClassNotFoundException: mekanism.client.render.armor.MekaSuitArmor)

```
你的游戏缺少 [前置]，下载这个 [下载链接] 放到你的 mods 文件夹里
```

### Fabric Rendering API 问题

特别是对于安装了 Sodium（0.6 版本及之前）的客户端，Fabric Rendering API 不完全，需要安装 Indium 补全

需要此模组的模组：[野营物品 (Campanion)](https://www.mcmod.cn/class/2852.html "野营物品 (Campanion)") 、[Bits and Chisels](https://www.mcmod.cn/class/5588.html "Bits and Chisels") 、[Lambda的更好的草方块 (LambdaBetterGrass)](https://www.mcmod.cn/class/4238.html "Lambda的更好的草方块 (LambdaBetterGrass)") 、[Continuity](https://www.mcmod.cn/class/4906.html "Continuity") 、[自定义包裹 (Packages)](https://www.mcmod.cn/class/8353.html "自定义包裹 (Packages)") 等

The Fabric Rendering API is not available. If you have Sodium, install Indium!

可能导致 java.lang.NullPointerException: Cannot invoke "net.minecraft.class_1087.method_4710()" because "$$6" is null

```
请安装 Indium （https://modrinth.com/mod/indium）
```

## Java 版本使用错误

### 使用的版本过低

The requested compatibility level JAVA_21 could not be set. Level is not supported by the active JRE or ASM version

```
你使用的 Java 版本过低，在 版本设置 -> 设置 -> 游戏 Java 中，修改到 [当前版本需要]
```

### 使用的版本过高

java.lang.UnsupportedClassVersionError

module java.base does not export

```
你使用的 Java 版本过高，在 版本设置 -> 设置 -> 游戏 Java 中，修改到 [当前版本需要]
```

### 更加具体的解决方案

[各Minecraft常见版本所需Java版本及其常见答疑（尽量长期维护） - 哔哩哔哩](https://www.bilibili.com/opus/939387567592177669)

### 换用 JDK 版本

java.lang.ClassCastException: java.base/jdk

java.lang.ClassCastException: class jdk.

```
在 版本设置 -> 设置 -> 游戏 Java 中，换用 JDK 版本的 Java
```

### 模组需要更高版本 Java

Mixin config visibletraders.mixins.json specifies compatibility level JAVA_21 which is not recognised

但很有可能用了高版本也没有用（见 [Visible Traders](https://www.mcmod.cn/class/15597.html)）

## Forge 版本低

Failure message: Mod File xxx.jar needs language provider javafml:50 or above to load
We have found 40

```
你的 Forge 版本过低，请修改提升 Forge 版本
```

## 并发问题

### [CME is Bad](https://www.mcmod.cn/class/17502.html)

[教程视频](https://www.bilibili.com/video/BV1QXrpYcEZY/)

并发修改异常（ConcurrentModificationException，CME）

下标越界异常（IndexOutOfBoundsException，IOOBE）

等问题导致游戏崩溃安装此模组并配置 JVM 参数解决

以下内容来自 MCMOD 原文整理

JVM 参数

```
-javaagent:mods/<mod_name>.jar=<class_full_name>;<field_name>;<type>;<phase>
```

| 参数名          | 用途                                    | 示例                                   |
| --------------- | --------------------------------------- | -------------------------------------- |
| mod_name        | 当前 CME 模组的名称                     | CME-1.0.0.jar                          |
| class_full_name | 被监视容器所在类（class）的全名         | net/minecraft/client/audio/SoundEngine |
| field_name      | 被监视容器的变量名，只支持类成员变量    | field_217942_m                         |
| type            | 被监视容器的类型，只支持 List、Set、Map | Map                                    |
| phase           | static 或 nonstatic                     | nonstatic                              |

```
游戏由于并发修改错误崩溃，@Viola_Siemens
相关修复模组 CME is Bad （https://modrinth.com/mod/cme-is-bad）
```

## 各种 Ticking 问题

安装 [Neruina](https://www.mcmod.cn/class/10051.html)

```
安装这个模组 https://modrinth.com/mod/neruina
```

## Night Config 问题

Caused by: com.electronwill.nightconfig.core.io.ParsingException: Not enough data available

使用 [Night Config Fixes](https://www.mcmod.cn/class/9007.html) ~~（面包师傅：修复了个🥚）~~

[ZekerZhayard 编译的版本](https://gitee.com/zekerzhayard/HMCL-KOOK-Resources/releases/download/2024.2.5/NightConfigFixesPlus-1.1.jar)（极度推荐）

```
安装这个模组 https://gitee.com/zekerzhayard/HMCL-KOOK-Resources/releases/download/2024.2.5/NightConfigFixesPlus-1.1.jar
```

## 模组不适用的加载器

java.lang.NoSuchMethodError: 'net.minecraft.sounds.Music twilightforest.ASMHooks.music(net.minecraft.sounds.Music)'

检查安装的模组的适用加载器以及是否有插头在

```
模组 [模组] 下载错版本了，请删除并重新下载对应的加载器版本
```

## 特定硬件平台

[Reflex AntiLag](https://www.mcmod.cn/class/18464.html)  N 卡平台，崩溃会生成 hs_err，其包名为 com.example.*  ~~谁家草台班子~~

```
Reflex AntiLag 模组不适用于你的设备，把它禁用
```

[Nvidium](https://www.mcmod.cn/class/10065.html)  要求拥有支持网格着色器的 NVIDIA GPU

## 模组不兼容

java.lang.RuntimeException: Could not execute entrypoint stage 'client' due to errors, provided by '不兼容模组ID'!

```
[模组] 不兼容当前的 Fabric API，请调整模组版本或者升级 Fabric
```

# 其它崩溃分析自助网站

* [CrashMC | 为普通玩家编写的 Minecraft 崩溃分析指南](https://www.crashmc.com/)

# 大佬资源

* [ZekerZhayard 大佬的各类修复模组(最后的特效药，使用起来可能会有些性能问题)](https://github.com/orgs/ZekerZhayard-s-Random-Patches/repositories)