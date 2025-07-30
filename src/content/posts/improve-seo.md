---
title: 如何提高网站的SEO？
published: 2025-07-30
description: '很多人做个网站后就不管了，殊不知想让搜索引擎快速收录并且提高排名要做的事情还不少呢！'
image: 'https://eo-r2.2x.nz/myblog/img/f334c97b-bb75-4920-8bd1-e62c9e5c675c.webp'
tags: [SEO]
category: '记录'
draft: false 
lang: ''
---

# 标题

> 即每个HTML head部分的 `title`

### 不要重名

如果你的标题是中文，请确保不要和任何知名事物关联上，比如不要叫 `树叶博客` ，而是 `叶树博客` 。

搜索引擎对于知名事物给的权重很高，如果你还和这些知名事物重名，大众则很难搜索到你

### 使用英文标题

比如 `AcoFork Blog`，`afoim Blog` 。

尝试自创一个单词，和中文一样，不要和知名事物重名

搜索引擎会将无法关联的网页作为独立权重

直接搜索您的自创单词，大概率就能找到您的网站，如：`AcoFork`

### 跨页面使用主标题锚定

一个网站大部分情况都有多个页面，如 主页，分类，归档等等

除了主页面要展示您的特有标题，其他页面也需要

比如主页面标题为 `AcoFork Blog` ，则副页面可以为 `分类 - AcoFork Blog` 或

`AcoFork Blog - 分类` 。

但是请不要直接单写一个 `分类` 。虽然这可能并不会误导搜索引擎的判断（只要还是同一个域名），但可能会误导用户的判断

比如搜索您的网站排在第一位的是一个标题为 `分类` 的网页

# 言简意赅写明description

> 即每个HTML head部分的 `meta name="description"`

网站描述不要写的太短，也不应太长，更不能没有

我的网站简介是

`分享网络技术、服务器部署、内网穿透、静态网站搭建、CDN优化、容器化部署等技术教程与实践经验的个人技术博客，专注于云原生、无服务器架构和前后端开发，作者为AcoFork/afoim/二叉树树`

# 添加相关关键词

> 即每个HTML head部分的 `meta name="keywords"`

这个我认为是越多越好

我的关键词为

`IT技术, 网络技术, 服务器部署, 内网穿透, 静态网站, 技术博客, CDN技术, 无服务器, 前后端逆向, Serverless, 云原生, 容器化, Docker, 性能优化, 网站优化, Blog, 博客, afoim, afoim Blog, 二叉树树, AcoFork Blog, Cloudflare, Cloudflare Tunnel, Cloudflare Workers, Cloudflare Pages, Cloudflare R2, EdgeOne CDN, SecBit MCDN, Netlify, Vercel, IPFS, Fleek, Next.js, Hugo, Fuwari, React, Vue, Docker Compose, Umami, GitHub, GitHub Pages, STUN, NAT, NAT1, Tailscale, Zerotier, 反向代理, 负载均衡, SSL证书, 域名解析, NAS, 对象存储, 云存储, 图床, 文件存储, 数据备份, QQBot, Koishi, ChatBot, 自动化部署, CI/CD, GitHub Actions, 域名邮箱, 短链接, 在线工具, meme-generator, 表情包生成, AI工具, 网站安全, 防火墙, 访问控制, DDoS防护, Web安全, 网站统计, 访问分析, 监控告警, 性能监控, 日志分析, 前端开发, 后端开发, 全栈开发, API开发, 微服务, REST API, 技术教程, 部署指南, 配置教程, 实践经验, 开发笔记, 踩坑记录, Kubernetes, k8s, 微服务架构, 分布式系统, 负载均衡, 高可用, 弹性伸缩, MinIO, S3, 对象存储, 文件系统, 数据库, Redis, CDN加速, 缓存优化, 带宽优化, 延迟优化, 边缘计算, PWA, 响应式设计, 移动端优化, 跨平台开发`

# 使用Lighthouse分析站点分数

Lighthouse是一个浏览器插件，可以分析站点的性能、无障碍、最佳做法和性能

可以前往各自的浏览器插件商店搜索 `Lighthouse` 进行安装测试

注意需要使用无痕模式进行测试，以免其他浏览器插件影响Lighthouse的测试结果

![](https://eo-r2.2x.nz/myblog/img/579087ce-3a48-4390-8ba3-e42dea60135e.webp)

对于每一项出现的问题以及如何解决都有明确的指示。可以根据警告对您的站点进行优化

![](https://eo-r2.2x.nz/myblog/img/5174f53e-5c7f-49a9-86fc-ea6797975d59.webp)

# 接入必应网站管理员

前往 https://www.bing.com/webmasters

接入您的站点后，必应爬虫将会分析您的网站，并且告知您的网站是否可以在搜索结果中展示

必应爬虫还会针对它的视角提出您网站的问题，您可以根据提出的问题进行优化

![](https://eo-r2.2x.nz/myblog/img/eabc21ac-c306-4165-afe0-1b9da3d2a179.webp)

![](https://eo-r2.2x.nz/myblog/img/081682fd-2d05-4d3f-a191-1c0f5c9b624c.webp)

# 接入各大分析

可以将网站接入各大分析，这样不仅能看到网站的流量，也能让搜索引擎知道这个网站是在被精心运营的

百度统计： https://tongji.baidu.com/

必应网站管理员： https://www.bing.com/webmaster/

谷歌搜索控制台： https://search.google.com/

谷歌分析： https://analytics.google.com/

谷歌广告： https://www.google.com/adsense/

# 使用IndexNow

曾经，如果想要提高网站的SEO，我们只能静静等待各大搜索引擎爬虫进行网站内容的爬取

而 **IndexNow** 允许网站主动向各大搜索引擎提交高质量的内容。详见： [Why IndexNow | Bing Webmaster Tools](https://www.bing.com/indexnow)

如果您使用Cloudflare CDN，这是开箱即用的只需要导航到您的域名 -> 缓存 -> 配置 -> 启用 **Crawler Hints** 即可

![](https://eo-r2.2x.nz/myblog/img/303b37e5-4104-4e2a-8a3b-bdb6094159e7.webp)
