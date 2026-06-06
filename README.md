# LabReport AI (智能实验报告助手) 🧪✍️

An AI-powered academic assistant designed for computer science students to generate structured, professional network experiment reports automatically based on raw simulation data (latency, throughput, packet loss).

---

## 🌟 项目简介 (Introduction)

**LabReport AI** 是一款面向计算机与通信专业学生的智能实验报告生成与管理平台。
在传统的计算机网络实验中，学生通常需要花费大量时间将测试工具（如 Ping, iPerf, Wireshark）输出的裸数据转换成合规的实验报告。本系统通过 **AI (Gemini / OpenAI / DeepSeek)** 分析输入的**丢包率、延迟、吞吐量**等关键指标，结合经典网络理论（如 TCP 拥塞控制、Mathis 公式等），一键生成规范的**实验现象描述、结果定量/定性分析与实验结论**。

为了确保演示和使用零门槛，系统支持 **云端数据库模式 (Supabase)** 与 **免配置本地模式 (LocalStorage Fallback)** 智能切换。

---

## ✨ 核心功能 (Key Features)

- 🔐 **双模式身份认证**：支持基于 Supabase Auth 的云端注册登录；若未配置云端，则自动降级到**本地离线模式**，数据安全存储于浏览器本地。
- 📊 **实验数据录入**：支持实验名称、丢包率 (Packet Loss)、时延 (Latency)、吞吐量 (Throughput) 及实验环境描述的快速表单录入。
- 🤖 **多 AI 模型引擎驱动**：
  - 优先调用 **Gemini 1.5 Flash API**，返回高精度结构化 JSON 报告。
  - 支持 **OpenAI (GPT-4o-mini)** 与 **DeepSeek API** 备用接入。
  - **无 Key 免配置体验**：若未填入任何 API Key，系统将自动使用内置的**本地启发式网络报告生成算法**，确保随时可用！
- 📝 **结构化报告自动生成**：
  - **实验现象 (Observation)**：包括报文状态、时延监测等。
  - **结果分析 (Analysis)**：深入结合 TCP 滑动窗口、拥塞避免机制及 RTT 时延带宽积进行专业学术分析。
  - **实验结论 (Conclusion)**：提供客观性能评估及系统优化建议（如 BBR 算法、滑动窗口调整等）。
- 📂 **历史记录管理**：支持对所有已生成报告的模糊搜索、在线编辑、重新生成与删除。
- 📥 **Markdown 导出**：一键将生成的报告导出为标准的 `.md` 文件，方便导入 Word 或学术排版工具。
- 🌗 **现代化极简 academic 视觉系统**：
  - 完美适配移动端、折叠屏及 PC 端的响应式布局。
  - 支持流畅的**暗黑模式 (Dark Mode)** 与亮色模式切换。
  - 优雅的玻璃拟态 (Glassmorphic) UI 与微交互动画。

---

## 🛠️ 技术栈 (Tech Stack)

- **Frontend**: Next.js (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v4 (with modern custom CSS tokens & animation)
- **Icons**: Lucide React
- **Database & Auth**: Supabase (PostgreSQL)
- **AI Integration**: Gemini API, OpenAI API, DeepSeek API (OpenAI Compatible)
- **Deployment**: Vercel

---

## 🚀 运行方法 (How to Run)

### 1. 环境准备 (Environment Setup)
在项目根目录下创建一个 `.env.local` 文件（可参考 `.env.example`）：

```bash
# Supabase 配置 (可选，如留空则自动启用离线模式)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# AI API Keys (可选，如全部留空则自动启用本地模板生成器)
GEMINI_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key
DEEPSEEK_API_KEY=your_deepseek_api_key
```

### 2. 安装依赖并启动开发服务器
```bash
# 安装项目依赖
npm install

# 启动本地开发服务 (支持 ExecutionPolicy 绕过)
powershell -ExecutionPolicy Bypass -Command "npm run dev"
# 或者直接运行
npm run dev
```
打开浏览器访问 [http://localhost:3000](http://localhost:3000) 即可开始使用。

---

## 🤖 AI 协作记录 (Vibe Coding with AI)

本项目的页面设计、前后端逻辑和 API 错误重试机制均由**学生与 AI 协同开发**完成。
- **AI 辅助设计**：使用 AI 快速生成符合学术界审美（Academic Blue）的 UI 调色板及响应式断点控制。
- **本地降级方案**：AI 协助设计了优雅的 LocalStorage Fallback 方案，使得即使在没有网络连接或数据库失效的情况下，用户也能够完美体验所有功能。
- **结构化 Prompt 开发**：设计了能够迫使 AI 严格以 JSON 格式返回“实验现象、分析、结论”三段式报告的 System Prompt，确保了生成结果的稳定性。

