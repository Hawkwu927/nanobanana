# Nanobanana 使用指南

## 🚀 快速开始

### 本地运行

1. **启动服务器**
```bash
deno run --allow-net --allow-env main.ts
```

2. **访问应用**
打开浏览器访问 `http://localhost:8000`

### 开发模式
```bash
deno run --watch --allow-net --allow-env main.ts
```

## 🔧 配置

### 环境变量
- `PORT`: 服务器端口（默认: 8000）
- `OPENROUTER_API_KEY`: OpenRouter API 密钥（可选，也可在界面中输入）

### OpenRouter API Key
1. 访问 [OpenRouter](https://openrouter.ai/)
2. 注册账户并获取 API Key
3. 在应用界面中输入 API Key

## 📱 使用方法

### 1. 输入 API Key
在界面顶部的输入框中输入你的 OpenRouter API Key

### 2. 上传图片
- 点击上传区域或拖拽图片文件
- 支持多图片上传
- 支持格式：JPG、PNG、WebP
- 可以点击图片上的 × 按钮删除

### 3. 输入提示词
在文本框中描述你想要的效果，例如：
- "将这张图片转换为动漫风格"
- "让这个人看起来更年轻"
- "将背景改为海滩"

### 4. 生成图片
点击"🎨 生成图片"按钮开始生成

## 🎨 功能特性

### 核心功能
- ✅ 多图片上传支持
- ✅ 拖拽上传
- ✅ 实时预览
- ✅ API Key 本地存储
- ✅ 响应式设计
- ✅ 错误处理和提示

### 技术特性
- 🌐 Deno 运行时
- 🎨 现代化 UI 设计
- 📱 移动端适配
- 🔒 安全的 API 处理
- 🚀 快速响应

## 🚀 部署到 Deno Deploy

### 自动部署
```bash
chmod +x deploy.sh
./deploy.sh
```

### 手动部署
1. 确保已安装 Deno Deploy CLI
2. 运行 `deployctl login`
3. 运行 `deployctl deploy --prod --project=nanobanana main.ts`

## 🔧 API 端点

### Web UI 端点
- `GET /` - 主页面
- `GET /style.css` - 样式文件
- `GET /script.js` - JavaScript 文件
- `POST /generate` - 生成图片

### API 代理端点
- `POST /v1beta/models/gemini-pro:generateContent` - 非流式生成
- `POST /v1beta/models/gemini-pro:streamGenerateContent` - 流式生成

## 🐛 故障排除

### 常见问题

**1. 服务器启动失败**
```bash
# 检查端口是否被占用
netstat -an | grep 8000
```

**2. API Key 错误**
- 确认 API Key 有效
- 检查 OpenRouter 账户余额
- 验证 API Key 权限

**3. 图片上传失败**
- 检查图片格式是否支持
- 确认图片大小合理（建议 < 10MB）
- 检查浏览器控制台错误

**4. 生成失败**
- 确认网络连接正常
- 检查 OpenRouter API 状态
- 验证提示词内容适当

### 日志查看
服务器会输出详细的错误信息，帮助诊断问题。

## 📝 开发说明

### 项目结构
```
├── main.ts              # 主服务器文件
├── test_server.ts       # 测试服务器
├── deno.json           # Deno 配置
├── deploy.sh           # 部署脚本
├── static/             # 静态文件
│   ├── index.html      # 主页面
│   ├── style.css       # 样式
│   └── script.js       # 前端逻辑
└── README.md           # 项目说明
```

### 技术栈
- **后端**: Deno + TypeScript
- **前端**: 原生 HTML/CSS/JavaScript
- **AI**: OpenRouter API
- **部署**: Deno Deploy

## 📄 许可证

本项目采用 MIT 许可证。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！