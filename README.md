# 🎮 真心话·大冒险

<p align="center">
  <img src="https://img.shields.io/badge/Vue-3.x-brightgreen?logo=vue.js" alt="Vue 3">
  <img src="https://img.shields.io/badge/TailwindCSS-3.x-blue?logo=tailwindcss" alt="TailwindCSS">
  <img src="https://img.shields.io/badge/License-MIT-yellow" alt="License">
  <img src="https://img.shields.io/badge/Platform-Web-orange" alt="Platform">
</p>

<p align="center">
  <b>聚会必备神器，让欢乐升级！</b>
</p>

<p align="center">
  <a href="#功能特点">功能特点</a> •
  <a href="#在线预览">在线预览</a> •
  <a href="#快速开始">快速开始</a> •
  <a href="#项目结构">项目结构</a> •
  <a href="#技术栈">技术栈</a>
</p>

---

## 📖 简介

真心话·大冒险是一款经典的聚会游戏网页应用，适合朋友聚会、团队建设、破冰活动等场景。通过随机抽取玩家和题目，让游戏更加公平有趣，增进彼此了解，创造欢乐回忆。

## ✨ 功能特点

### 🎯 快速模式
- **一键生成玩家**：设置玩家人数后快速生成
- **随机抽人**：公平随机抽取幸运玩家
- **真心话/大冒险**：丰富的题库供选择
- **一键随机**：同时抽取玩家和题目

### 🎲 真心话大冒险
- **丰富题库**：内置 30+ 真心话题目、30+ 大冒险题目
- **自定义题库**：支持添加自定义题目
- **重置功能**：一键恢复默认题库

### 👥 玩家抽人器
- **单个添加**：逐个添加玩家
- **批量导入**：支持批量添加玩家
- **可视化管理**：玩家标签展示，支持删除

### 📜 游戏历史
- **记录追踪**：显示最近 3 条游戏记录
- **时间标记**：记录每次操作的时间

### 🎨 视觉设计
- **霓虹风格**：深色霓虹渐变背景
- **毛玻璃效果**：现代感十足的卡片设计
- **丰富动画**：按钮悬停、卡片切换、抽人高亮等动画
- **响应式布局**：完美适配手机、平板和桌面

## 🌐 在线预览

- **GitHub Pages**: [https://coldestbow30654.github.io/Truth-or-Dare](https://coldestbow30654.github.io/Truth-or-Dare)
- **Gitee 镜像**: 待更新

## 🚀 快速开始

### 方式一：直接使用
直接在浏览器中打开 `index.html` 文件即可使用。

### 方式二：本地服务器
```bash
# 克隆仓库
git clone https://github.com/COLDESTBOW30654/Truth-or-Dare.git

# 进入项目目录
cd Truth-or-Dare

# 启动本地服务器（Python）
python -m http.server 3000

# 或使用 Node.js
npx serve
```

然后访问 `http://localhost:3000`

## 📁 项目结构

```
Truth-or-Dare/
├── index.html          # 主页面
├── css/
│   └── styles.css      # 样式文件
├── js/
│   └── app.js          # Vue 应用逻辑
├── data/
│   ├── truth.json      # 真心话题库
│   └── dare.json       # 大冒险题库
└── README.md           # 项目说明
```

## 🛠 技术栈

| 技术 | 说明 |
|------|------|
| [Vue 3](https://vuejs.org/) | 渐进式 JavaScript 框架 |
| [Tailwind CSS](https://tailwindcss.com/) | 实用优先的 CSS 框架 |
| [Font Awesome](https://fontawesome.com/) | 图标库 |
| [Poppins](https://fonts.google.com/specimen/Poppins) | 现代无衬线字体 |

## 📝 题库格式

题库采用 JSON 格式存储，方便维护和扩展：

```json
{
  "questions": [
    "题目内容1",
    "题目内容2",
    "题目内容3"
  ]
}
```

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

## 📄 许可证

本项目采用 [MIT](LICENSE) 许可证。

## 🙏 致谢

- 感谢所有贡献者的支持
- 感谢 Vue.js 和 Tailwind CSS 社区

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/COLDESTBOW30654">COLDESTBOW30654</a>
</p>

<p align="center">
  <a href="https://github.com/COLDESTBOW30654/Truth-or-Dare">
    <img src="https://img.shields.io/github/stars/COLDESTBOW30654/Truth-or-Dare?style=social" alt="GitHub stars">
  </a>
  <a href="https://github.com/COLDESTBOW30654/Truth-or-Dare">
    <img src="https://img.shields.io/github/forks/COLDESTBOW30654/Truth-or-Dare?style=social" alt="GitHub forks">
  </a>
</p>
