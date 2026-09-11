# JobFlow AI

An AI-ready job search workspace that helps candidates track applications, understand job descriptions, match their resume to roles, and prepare for interviews.

**Current stage:** a local-first portfolio project with working Basic Analysis and an AI-ready backend. AI is disabled by default. No account or API key is needed to explore the Basic workflow.

## Why I built this

Job searching often means applications scattered across platforms, repetitive JD analysis, repeated resume comparison, fragmented interview preparation, and little visibility into the job search funnel. I built JobFlow AI to connect these tasks in one workspace and reduce repeated copying and context switching.

## Core Workflow

**Save Resume → Track Jobs → Open Job → Analyze JD → Match Resume → Prepare Interview**

Save your experience in **My Resume**, then add a job with its description. Open the job to review its details and move into any analysis module. The saved JD is filled in automatically; Resume Match and Interview Prep also load your saved resume. Analysis starts only when you click its action button.

Opening an analysis module directly from the navigation starts with an empty JD, without carrying over another job's context.

## Features

### Job Tracker

- Add, edit and delete applications, with status management.
- Save company, role, source, application date and job description.
- Open Job Detail to review a role and access its analysis workflow.
- Persist jobs in local storage across browser refreshes.
- Start with four labeled sample applications: ByteDance, JD.com, Meitu and Pinduoduo. These are demonstration records, not claims about actual applications or employers.

### Dashboard

Applications, screening, interviews, final rounds, offers and interview rate are derived dynamically from the same jobs array displayed in Job Tracker. No separate counters are maintained.

The funnel is cumulative according to the **current status**, not a history of past stages:

| Metric | Included statuses |
| --- | --- |
| Applications | All jobs, including Rejected |
| Screening | Screening, Interview, Final Round, Offer |
| Interviews | Interview, Final Round, Offer |
| Final rounds | Final Round, Offer |
| Offers | Offer |

Interview rate is interviews divided by applications, rounded to a whole percentage; an empty list displays 0%. The four initial sample jobs produce **4 applications, 2 screening, 1 interview, 0 final rounds, 0 offers and a 25% interview rate**.

### JD Analyzer

Basic keyword analysis currently works without an API. It identifies responsibilities, skills, keywords and interview focus using local rules. An AI-ready backend is prepared for structured analysis when enabled.

### Resume Match

Compare a JD with the user's real resume to identify matched skills, missing evidence, strengths and preparation risks. **The product does not invent missing experience.** Suggestions should only be used when they reflect experience the candidate genuinely has.

Basic matching detects words rather than verifying proficiency. It can miss context and negation; a missing keyword is not proof that a candidate lacks a skill. Results need human review. Match levels use Low, Medium or High rather than a misleading precise percentage.

### Interview Prep

Generate targeted Basic preparation from JD and resume topics, including role questions, resume questions, behavioral prompts, risks and preparation points. Local rules cover product management, data, research, growth, AI, SQL, collaboration, product metrics, e-commerce and operations.

### My Resume

Save resume or experience text once and reuse it in Resume Match and Interview Prep. Temporary edits in an analysis page do not overwrite the saved resume. Clearing the saved resume requires confirmation.

## AI-ready Architecture

The default configuration is:

```dotenv
AI_ENABLED=false
AI_PROVIDER=openai
AI_API_KEY=
AI_MODEL=gpt-5.6-luna
AI_BASE_URL=
```

With `AI_ENABLED=false`, the server blocks AI requests before constructing an OpenAI client. **No paid OpenAI requests are sent in this mode.** Basic analysis runs locally in the browser.

| Endpoint | Purpose |
| --- | --- |
| `POST /api/analyze-jd` | Analyze the supplied JD |
| `POST /api/match-resume` | Compare the JD and resume |
| `POST /api/interview-prep` | Prepare questions from the JD and resume |
| `GET /api/ai-status` | Report enabled, configured, provider and model, without exposing credentials |

The local Node.js HTTP server and Vercel Functions share server/aiCore.js, which selects OpenAI Responses or DeepSeek Chat Completions JSON mode and validates shared response schemas. The model is configured in one place through `AI_MODEL`. Both the server and browser validate results. Frontend requests are centralized in `src/services/aiService.js`.

If an AI request fails or returns invalid output, the page offers **Use Basic Analysis**. Neither the SDK nor the browser automatically retries analysis requests. configured indicates complete local settings (supported provider, key, model and valid base URL), not credential validity, quota or model access.

When API access and quota are available, set `AI_ENABLED=true` in the local environment file, provide a valid key, optionally change the model, restart the server and refresh the page. Both the switch and key must be present to use AI. Live paid calls have not been validated in this project stage.

## Tech Stack

- React and Vite
- JavaScript and CSS
- Node.js native HTTP server
- OpenAI SDK
- Browser localStorage
- Git / GitHub for version control and portfolio presentation

No router, UI library, database or authentication service is required for the current local workflow.

## Data Architecture

**jobs = single source of truth.** Dashboard statistics are derived from jobs on render.

| Storage key | Contents |
| --- | --- |
| `jobflow-data` | `{ jobs: [...] }` — saved applications |
| `jobflow-resume` | Saved resume / experience text |

Older stored data containing separate counters is supported: valid job records are preserved, old counters are ignored, and the next save writes only jobs. Resume data remains separate. Navigation and the selected job ID are temporary React state.

## Privacy

Job and resume data are currently stored in the user's browser using localStorage. There is no cloud synchronization. Clearing browser site data removes these records; different browsers and devices have separate storage.

Saving a job or resume does not upload it. In the default Basic mode, analysis also stays in the browser. If AI is explicitly enabled later, clicking an AI analysis action sends the supplied JD and, where required, resume through the backend to the configured provider. OpenAI requests use `store: false`; this is not a claim that provider-side retention is eliminated.

API credentials belong only in server-side configuration. `.env.local` is ignored by Git and `.env.example` contains no real key. Never put credentials in `src/`, a `VITE_` variable, screenshots or a public repository. Use fictional resume text when recording a portfolio demo.

## Run Locally

Use Node.js 24 (the tested runtime) and npm.

```sh
npm install
```

For the default Basic demo, no key or environment file is required. To configure the server, copy `.env.example` to `.env.local` only if that local file does not already exist. Keep `AI_ENABLED=false` for a demo without paid API calls.

**Terminal 1:**

```sh
npm run server
```

**Terminal 2:**

```sh
npm run dev
```

Open the local address printed by Vite. The backend listens at `127.0.0.1:8787`; Vite forwards `/api` requests there. Basic features remain usable with AI disabled, including when the status service is unavailable.

Environment variables already set in your terminal override `.env.local`. Restart the backend after changing its configuration.

### A short portfolio demo

1. Show Overview and explain that its numbers come from the four sample jobs.
2. Save fictional experience in My Resume.
3. Add a fictional job with a JD, or edit a sample job to include a JD; initial sample jobs have no saved JD.
4. Open the job and demonstrate JD analysis, resume matching and interview preparation. Point out that these are Basic results.
5. Change a job's status and return to Overview to show the automatically updated funnel.
6. Refresh to demonstrate local persistence.

### Validation

```sh
npm run build
npm run lint
node --test tests/job-stats.test.mjs
node --env-file-if-exists=.env.local --test tests/ai-disabled.test.mjs
```

The offline AI test forces AI off. Tests cover cumulative statistics and the disabled-provider gate. Browser checks cover the core workflow, CRUD, resume reuse, empty states and persistence. These checks do not establish live model quality or production hosting readiness.

## Future Improvements

These are possible future directions, **not implemented features**:

- Cloud database
- Authentication
- Resume file parsing
- Real AI analysis validation and activation
- Cross-device synchronization
- Application analytics

## Deploying to Vercel

Deployment preparation is complete; this stage has not created or deployed a Vercel project.

Import the repository with **Framework: Vite**, **Build Command: npm run build**, **Output Directory: dist**, and **Node.js 24.x**. The small vercel.json pins these frontend settings so server.mjs remains the local entry point. Files in api/ export individual Node.js request handlers and do not start a listening server. No SPA rewrite is needed because navigation uses React state.

Set AI_ENABLED=false for the first deployment. An API key is unnecessary for Basic mode. The four existing /api paths are handled by Vercel Functions on the same origin, so frontend request URLs stay unchanged. /api/ai-status should return enabled=false and configured=false when no key has been set. The model defaults to gpt-5.6-luna.

When you have API quota and want to enable real AI, set the following in **Vercel Project Settings → Environment Variables**, selecting the intended environment (Production and/or Preview):

| Variable | Value |
| --- | --- |
| AI_ENABLED | true |
| AI_PROVIDER | openai or deepseek |
| AI_BASE_URL | Leave empty for OpenAI official API; required for DeepSeek |
| AI_API_KEY | Your secret API key, entered only in Vercel settings |
| AI_MODEL | gpt-5.6-luna (optional) |

Redeploy after changing variables, then refresh the site and check /api/ai-status. A missing key safely leaves Basic mode available even if AI_ENABLED=true. configured indicates complete local settings, not valid credentials or available quota. Real AI still depends on account access and network availability. These are server variables: never prefix them with VITE_ or put secrets into source/config files.

Local development remains npm run server plus npm run dev with the existing Vite proxy. Browser data is origin-specific: localhost jobs and resumes will not automatically appear at the deployed URL.

Validation: node --test tests/vercel-functions.test.mjs checks the four imported handlers offline, including disabled/missing-key gates, request parsing and safe fallback. It does not replace a deployment smoke test. After deployment, check all four /api paths with AI disabled before considering activation.

References: [Vercel Node.js Functions](https://vercel.com/docs/functions/runtimes/node-js), [supported Node.js versions](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions), and [Vite on Vercel](https://vercel.com/docs/frameworks/frontend/vite).

### Provider configuration

All provider configuration stays on the server; frontend URLs and analysis results are unchanged. OpenAI is the default provider and uses gpt-5.6-luna when no model is set. An empty AI_BASE_URL uses the official OpenAI API endpoint.

For DeepSeek, set AI_PROVIDER=deepseek and supply AI_API_KEY, AI_MODEL and AI_BASE_URL yourself. No DeepSeek model or URL is hardcoded. The selected endpoint/model must support Chat Completions JSON mode. Results are validated against the same schemas; invalid or incomplete responses keep the existing Basic fallback available. Other compatible services can use the matching protocol with a custom URL, but only the openai and deepseek provider identifiers are supported.

Compatibility: an absent or blank AI_API_KEY falls back to OPENAI_API_KEY; an absent or blank AI_MODEL falls back to OPENAI_MODEL. Unified variables take priority. When switching providers, set both explicitly to avoid reusing old OpenAI credentials or model settings. Keep AI_ENABLED=false while configuring. Restart the local server, or redeploy after updating Vercel environment variables.

No real model requests were made during provider integration testing. DeepSeek JSON mode reference: [official documentation](https://api-docs.deepseek.com/guides/json_mode/).
