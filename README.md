# 🌍 FIRENomad — 早退休旅居地图

专为 FIRE 族设计的全球旅居参考平台，AI 实时生成个性化建议。

---

## 🚀 5分钟上线教程（完全免费）

### 第一步：注册 GitHub

1. 打开 https://github.com
2. 点右上角 **Sign up**，注册一个账号
3. 免费账号就够用

### 第二步：上传项目

1. 登入 GitHub 后，点右上角 **+** → **New repository**
2. Repository name 填 `firenomad`
3. 选 **Public**，点 **Create repository**
4. 点页面中间的 **uploading an existing file**
5. 把这个 `firenomad` 文件夹里所有的文件拖进去上传
6. 点 **Commit changes**

### 第三步：部署到 Vercel

1. 打开 https://vercel.com
2. 点 **Sign Up** → 选 **Continue with GitHub**（用刚注册的 GitHub 账号登入）
3. 点 **Add New Project** → 找到 `firenomad` → 点 **Import**
4. 展开 **Environment Variables**，添加：
   - Name: `REACT_APP_ANTHROPIC_API_KEY`
   - Value: 你的 Anthropic API Key（在 https://console.anthropic.com 可以拿到）
5. 点 **Deploy**，等约 1–2 分钟
6. 部署完成后 Vercel 会给你一个网址，例如 `firenomad.vercel.app`

🎉 完成！这个网址可以直接分享给任何人。

---

## 🔑 获取 Anthropic API Key

1. 打开 https://console.anthropic.com
2. 注册或登入
3. 左边菜单点 **API Keys**
4. 点 **Create Key**，复制这串代码

---

## 📁 文件结构

```
firenomad/
├── public/
│   └── index.html        # 网页入口
├── src/
│   ├── index.js          # React 入口
│   └── App.jsx           # 主应用（地图 + 所有城市数据）
├── package.json          # 依赖配置
├── vercel.json           # Vercel 部署配置
└── .env.example          # API Key 配置示例
```

---

## ✨ 功能

- 🗺️ **互动世界地图** — 点击城市查看详情
- 🌍 **17+ 旅居城市** — 亚洲、欧洲、美洲、中东
- 🔥 **5种 FIRE 类型** — Lean / Regular / Fat / Barista / Coast
- 💰 **生活成本细分** — 住宿/餐饮/交通/娱乐/医保
- 🛂 **签证指南** — 每个城市的签证选项和要求
- 🏥 **医保建议** — 本地医疗 + 国际保险推荐
- 🛡️ **安全文化** — 安全状况和文化注意事项
- 🤖 **AI 个性化建议** — 根据你的 FIRE 类型实时生成分析

---

## 🛠 本地开发（可选）

```bash
# 安装 Node.js（https://nodejs.org）后运行：
npm install
cp .env.example .env
# 编辑 .env 填入你的 API Key
npm start
# 打开 http://localhost:3000
```
