# JobFlow AI

React + Vite 本地求职工具，使用 Node.js 原生 HTTP 后端。Job Tracker 保存在浏览器 localStorage（jobflow-data），不需要数据库。

## 本地启动

使用支持 --env-file-if-exists 的 Node.js（本次验证为 Node 24）。

```sh
npm run server
```

另一个终端：

```sh
npm run dev
```

后端监听 127.0.0.1:8787；Vite 将 /api 转发给后端。打开 Vite 输出的地址。

## 环境变量

.env.example 仅包含空 Key 和安全默认值。将配置放入被 Git 忽略的 .env.local，保留已有 Key，勿公开此文件。

```dotenv
OPENAI_API_KEY=
AI_ENABLED=false
OPENAI_MODEL=gpt-5.6-luna
```

只有 AI_ENABLED 严格等于 true 且服务端存在非空 Key 时才允许请求 OpenAI。其他情况下三个页面默认使用本地 Basic Analysis。即使浏览器直接请求 AI endpoint，后端也会拒绝，不创建 OpenAI 客户端。

OPENAI_MODEL 的默认值为 gpt-5.6-luna，业务函数不单独指定模型。系统终端中已经设置的环境变量会优先于 .env.local；如果修改文件后状态不变，请检查终端是否有同名变量。

## 以后充值后开启 AI

1. 打开 .env.local，将 AI_ENABLED 改为 true。
2. 确认 OPENAI_API_KEY 已填写有效的真实 Key（只在本地填写）。
3. 可选设置 OPENAI_MODEL=gpt-5.6-luna，或账户可用的兼容 Responses / Structured Outputs 的模型。
4. 停止旧后端，重新运行 npm run server。
5. 运行 npm run dev，刷新浏览器页面。
6. 确认页面显示 AI Analysis Mode，再点击分析按钮。

无需重新开发三个分析模块。实际成功仍取决于账户额度、模型访问权限和网络；本阶段没有进行任何真实付费 API 验证。

## 接口

| 方法和路径 | 输入 | 用途 |
| --- | --- | --- |
| GET /api/ai-status | 无 | 返回 enabled、configured、model；configured 只表示 Key 是否存在，不代表额度或 Key 有效性 |
| POST /api/analyze-jd | jd | 提取 JD 职责、技能、关键词、加分项、面试重点和岗位侧重 |
| POST /api/match-resume | jd、resume | 对比真实简历与 JD，输出匹配等级、缺失技能、优势、改进建议和风险 |
| POST /api/interview-prep | jd、resume | 根据岗位和候选人经历生成七类面试准备内容 |

旧的 GET /api/status 作为兼容入口保留。关闭时 POST 返回 503 / AI_DISABLED。接口只返回通用错误，不输出 Key、SDK 错误详情或用户原文日志。

真实 AI 使用 Responses API、严格 JSON Schema 和服务端/前端结构验证。提示词要求仅依据输入，不编造经历、技能、公司或数字，不制造精确匹配百分比。参考 [OpenAI Structured Outputs 文档](https://developers.openai.com/api/docs/guides/structured-outputs)。

## Basic 和失败回退

- Basic 分析在浏览器运行，保留原 JD / Resume 规则，并补齐 Interview Prep 的主题规则。
- 状态接口不可用时，页面仍可使用 Basic。
- AI 超时、网络错误、额度不足、拒绝回答、无效 JSON 或结构错误都会显示统一提示和 Use Basic Analysis。
- SDK 禁用自动重试；页面也不自动重试。只有用户再次点击才会发起新的分析。
- 每份结果显示实际来源，Basic 结果不会标记为 AI 结果。关键词规则可能忽略语境或否定词，需要对照原文检查。

## 文件组织

- server.mjs：环境变量、原生 HTTP 路由、提示词和 OpenAI SDK。
- src/services/aiService.js：统一前端请求、超时和错误处理。
- src/services/aiContracts.js：三个结果的 JSON Schema 和验证。
- src/services/basicAnalysis.js：从原 App.jsx 移出的本地分析和样例。
- src/services/basicResults.js：统一 Basic 结果结构、补充面试规则。
- src/components/AnalysisPage.jsx：三个分析页面的输入、状态、结果和回退。
- src/App.jsx：导航、Dashboard 和原有 Job Tracker 业务。

## 检查

```sh
npm run build
npm run lint
node --env-file-if-exists=.env.local --test tests/ai-disabled.test.mjs
```

测试强制关闭 AI，验证三个 endpoint 不会进入 AI provider、Basic 分析和十个面试主题。已在隔离浏览器中验证 Dashboard、Jobs、三个 Basic 流程、空输入、Clear、localStorage 刷新一致性，以及拦截请求后的三个 AI 失败回退。真实后端全程关闭，未调用 OpenAI。
