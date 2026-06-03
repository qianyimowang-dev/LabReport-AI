# PRD — LabReport AI
## AI-Powered Laboratory Report Assistant（智能实验报告助手）

### 文档版本
- Version: 1.0
- Product Type: Responsive Web App
- Target: University Course Project
- Tech Stack: Next.js + TypeScript + Tailwind CSS + Supabase + OpenAI/Gemini

---

# 1. Product Overview

## 1.1 Background
LabReport AI 面向计算机专业学生，通过 AI 自动分析实验数据并生成规范化实验报告内容，降低实验报告编写成本，提高学习效率。

## 1.2 Product Goals
- 自动生成实验现象
- 自动生成结果分析
- 自动生成实验结论
- 提供实验报告管理能力
- 支持 Markdown 导出

## 1.3 Success Metrics
- AI生成成功率 ≥ 95%
- 页面加载时间 < 3秒
- 报告保存成功率 ≥ 99%
- 移动端适配覆盖率 100%

---

# 2. 5W1H Analysis

| 项目 | 内容 |
|--------|--------|
| Who | 计算机专业学生、助教、教师 |
| What | AI实验报告生成平台 |
| When | 实验课程后撰写实验报告时 |
| Where | PC、平板、手机浏览器 |
| Why | 提高实验报告编写效率和质量 |
| How | 输入实验数据 → AI分析 → 自动生成报告 |

## 项目价值
### 学生价值
- 节省时间
- 学习规范写作
- 提高报告质量

### 教师价值
- 统一报告格式
- 提升教学效率

### 项目价值
- AI应用实践
- 全栈开发实践
- 软件工程项目案例

---

# 3. User Roles

## Student
- 注册登录
- 创建报告
- AI生成内容
- 导出Markdown

## Teacher/TA
- 查看报告
- 指导修改

---

# 4. Functional Requirements

## FR-01 用户认证模块

### Login
字段：
- email
- password

按钮：
- Login
- Register

### Register
字段：
- email
- password
- confirmPassword

按钮：
- Create Account

### Logout
- 清除Session
- 返回登录页

---

## FR-02 Dashboard

### 展示内容
- Welcome Card
- Create Report Button
- Recent Reports
- Statistics Summary

### 数据来源
reports表

---

## FR-03 实验报告管理

### Create Report

字段：

| 字段 | 类型 |
|--------|--------|
| title | string |
| packet_loss | decimal |
| latency | decimal |
| throughput | decimal |
| experiment_description | text |

### View Report
查看完整内容

### Update Report
允许编辑所有字段

### Delete Report
软删除或永久删除

### Save Report
保存数据库

---

## FR-04 AI Report Generator

### 输入

```json
{
  "title":"TCP实验",
  "packet_loss":1.5,
  "latency":35,
  "throughput":120,
  "experiment_description":"测试网络性能"
}
```

### Prompt Strategy

系统Prompt要求：

- 采用大学实验报告格式
- 输出专业内容
- 网络通信场景
- 中文输出

### 输出

```json
{
  "observation":"实验现象",
  "analysis":"结果分析",
  "conclusion":"实验结论"
}
```

### 生成逻辑

1. 用户提交实验数据
2. API Route接收请求
3. 调用OpenAI/Gemini
4. 返回结构化JSON
5. 保存数据库

---

## FR-05 历史记录

功能：
- 搜索
- 查看
- 编辑
- 删除

搜索字段：
- title

排序：
- created_at DESC

---

## FR-06 导出模块

### MVP
Markdown导出

文件名：

report-{id}.md

### Future
PDF导出

---

# 5. Page Design

## Login Page

### Layout
- Logo
- Login Form
- Register Link

### Components
- Input
- Button
- Alert

### Flow
登录成功→Dashboard

---

## Register Page

### Components
- Email Input
- Password Input
- Confirm Password
- Submit Button

---

## Dashboard Page

### Sections

#### Header
用户信息

#### Action Area
Create Report

#### Recent Reports
最近5条记录

#### Navigation
History入口

---

## Create Report Page

### Form Area

- 实验名称
- 丢包率
- 延迟
- 吞吐量
- 实验描述

### Actions

- Generate Report
- Save Draft

### UX
生成期间显示Loading

---

## Report Detail Page

### Sections

实验数据

实验现象

结果分析

实验结论

### Actions

- Edit
- Delete
- Export Markdown

---

## History Page

### Components

- Search Bar
- Report Table
- Pagination

---

# 6. UI/UX Specification

## Design Style
- Modern
- Clean
- Academic

## Color System

Primary:
- #2563EB

Success:
- #10B981

Warning:
- #F59E0B

Error:
- #EF4444

## Responsive Breakpoints

| Device | Width |
|----------|----------|
| Mobile | <768px |
| Tablet | 768-1024px |
| Desktop | >1024px |

## Dark Mode
支持切换

---

# 7. Database Design

## ERD

users (Supabase Auth)
1:N
reports

---

## reports

| Field | Type | Constraint |
|---------|---------|---------|
| id | uuid | PK |
| user_id | uuid | FK |
| title | varchar(255) | not null |
| packet_loss | numeric(10,2) | not null |
| latency | numeric(10,2) | not null |
| throughput | numeric(10,2) | not null |
| experiment_description | text | nullable |
| generated_observation | text | nullable |
| generated_analysis | text | nullable |
| generated_conclusion | text | nullable |
| created_at | timestamptz | default now |
| updated_at | timestamptz | default now |

### Relationship

reports.user_id
→ auth.users.id

---

# 8. Security

## Authentication
Supabase Auth

## Authorization
RLS Policy

### Example

User仅访问自己的报告

```sql
auth.uid() = user_id
```

## JWT
Bearer Token

---

# 9. API Design

## Authentication

### Register

POST /auth/register

### Login

POST /auth/login

### Logout

POST /auth/logout

---

## Create Report

POST /api/reports

Request

```json
{
  "title":"TCP实验"
}
```

Response

```json
{
  "success":true,
  "id":"uuid"
}
```

---

## Get Reports

GET /api/reports

---

## Get Report Detail

GET /api/reports/{id}

---

## Update Report

PUT /api/reports/{id}

---

## Delete Report

DELETE /api/reports/{id}

---

## AI Generate Report

POST /api/ai/generate

Request

```json
{
  "title":"TCP实验",
  "packet_loss":2,
  "latency":30,
  "throughput":150,
  "experiment_description":"测试"
}
```

Response

```json
{
  "observation":"...",
  "analysis":"...",
  "conclusion":"..."
}
```

### Error Response

```json
{
  "success":false,
  "message":"AI generation failed"
}
```

---

# 10. UX Flow

```text
Login
  ↓
Dashboard
  ↓
Create Report
  ↓
Input Data
  ↓
Generate Report
  ↓
AI Processing
  ↓
Display Result
  ↓
Save Report
  ↓
History
  ↓
Export Markdown
```

---

# 11. Non-functional Requirements

## Performance
- FCP < 2s
- Page Load < 3s

## Reliability
- Auto Save
- Retry Mechanism

## Security
- HTTPS
- JWT
- RLS

## Availability
- 99%

---

# 12. Technical Architecture

Frontend
- Next.js App Router
- TypeScript
- Tailwind CSS

Backend
- Next.js API Routes

Database
- Supabase PostgreSQL

Authentication
- Supabase Auth

AI
- OpenAI API 或 Gemini API

Deployment
- Vercel

Repository
- GitHub

---

# 13. Folder Structure

```text
src/
 ├─ app/
 ├─ components/
 ├─ lib/
 ├─ services/
 ├─ types/
 ├─ hooks/
 ├─ styles/
 └─ api/
```

---

# 14. MVP Scope

必须完成：

- 用户注册
- 用户登录
- Dashboard
- 创建实验报告
- AI生成实验现象
- AI生成结果分析
- AI生成实验结论
- 历史记录
- Markdown导出
- GitHub管理
- Vercel部署

---

# 15. Future Roadmap

V2
- PDF导出
- 图表分析

V3
- 多实验模板
- AI评分

V4
- 分享功能
- 教师审核系统

---

# 16. Acceptance Criteria

1. 用户可完成注册登录
2. 用户可创建实验报告
3. AI可生成三部分内容
4. 报告可保存
5. 历史记录可查看
6. Markdown可导出
7. 移动端正常使用
8. Vercel成功部署
