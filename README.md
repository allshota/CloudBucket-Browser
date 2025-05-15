# CloudVault-Navigator

<p align="center">
  <img src="https://img.shields.io/badge/CloudFlare-F38020?style=for-the-badge&logo=cloudflare&logoColor=white" alt="Cloudflare" />
  <img src="https://img.shields.io/badge/R2_存储-00A8E1?style=for-the-badge&logo=cloudflare&logoColor=white" alt="R2存储" />
  <img src="https://img.shields.io/badge/Pages-F38020?style=for-the-badge&logo=cloudflare&logoColor=white" alt="Pages" />
</p>

## 📋 项目介绍

CloudVault-Navigator 是一个简洁易用的 Cloudflare R2 存储桶浏览器，使用 Cloudflare Pages 和 Functions 构建。它提供了直观的界面来浏览、导航和下载 R2 存储桶中的文件，让 R2 存储管理变得轻松高效。

## ✨ 核心功能

- 📁 层级式文件与目录浏览
- 🔍 直观的文件类型区分（文件/目录）
- 🧭 面包屑导航，轻松返回上层目录
- ✅ 文件多选功能与批量操作
- ⬇️ 单文件快速下载
- 📱 响应式设计，适配各种设备

## 🖼️ 界面预览

![CloudVault-Navigator 预览](https://via.placeholder.com/800x450.png?text=CloudVault-Navigator+预览图)

## 🚀 快速开始

### 前提条件

- Cloudflare 账户
- 已创建的 R2 存储桶
- Node.js 和 npm（本地开发需要）

### 安装步骤

1. 克隆仓库
   ```bash
   git clone https://github.com/allshota/CloudBucket-Browser.git
   cd CloudBucket-Browser
   ```

2. 安装依赖
   ```bash
   npm install
   ```

3. 配置你的 R2 存储桶
   修改 `wrangler.toml` 文件：
   ```toml
   [env.production]
   R2_BUCKET_NAME = "你的存储桶名称"
   ```

4. 本地开发
   ```bash
   npm run dev
   ```

5. 部署到 Cloudflare Pages
   ```bash
   npm run deploy
   ```

## ⚙️ 配置 Cloudflare Pages

部署后，你需要在 Cloudflare Dashboard 中配置正确的 R2 绑定：

1. 登录 Cloudflare Dashboard
2. 进入你的 Pages 项目
3. 点击「设置」>「Functions」
4. 在「R2 绑定」部分添加绑定：
   - 变量名称：`R2_BUCKET`
   - 选择你的 R2 存储桶

## 🛠️ 技术栈

- Cloudflare Pages - 托管和部署
- Cloudflare Functions - 后端 API
- Cloudflare R2 - 对象存储
- Vanilla JavaScript - 前端逻辑
- CSS3 - 样式和响应式设计

## 🔧 自定义

你可以根据需要修改以下部分：

- `src/styles.css` - 调整应用的样式
- `src/index.js` - 修改前端逻辑
- `functions/api/` - 调整 API 行为

## 📝 注意事项

- 此应用使用 Cloudflare R2 和 Pages，可能会产生相应的费用
- 确保 R2 存储桶的访问权限设置正确，以防止未授权访问
- 生产环境部署时，建议添加适当的身份验证和授权机制

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request 来改进这个项目。任何形式的贡献都将被感激！

## 📄 许可证

本项目采用 [MIT 许可证](LICENSE)

---

<p align="center">
  用 ❤️ 开发
</p> 
