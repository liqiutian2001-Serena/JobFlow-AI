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
OPENAI_API_KEY=
AI_ENABLED=false
OPENAI_MODEL=gpt-5.6-luna
```

With `AI_ENABLED=false`, the server blocks AI requests before constructing an OpenAI client. **No paid OpenAI requests are sent in this mode.** Basic analysis runs locally in the browser.

| Endpoint | Purpose |
| --- | --- |
| `POST /api/analyze-jd` | Analyze the supplied JD |
| `POST /api/match-resume` | Compare the JD and resume |
| `POST /api/interview-prep` | Prepare questions from the JD and resume |
| `GET /api/ai-status` | Report enabled, configured and model, without exposing credentials |

The native Node.js HTTP server uses the OpenAI Responses API and shared structured response schemas. The model is configured in one place through `OPENAI_MODEL`. Both the server and browser validate results. Frontend requests are centralized in `src/services/aiService.js`.

If an AI request fails or returns invalid output, the page offers **Use Basic Analysis**. Neither the SDK nor the browser automatically retries analysis requests. A configured key indicates presence only; it does not verify validity, quota or model access.

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

Saving a job or resume does not upload it. In the default Basic mode, analysis also stays in the browser. If AI is explicitly enabled later, clicking an AI analysis action sends the supplied JD and, where required, resume through the local backend to OpenAI. The backend requests `store: false`; this is not a claim that provider-side retention is eliminated.

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

The current application is designed for a local demo. Hosting the full AI workflow requires a server runtime, private environment configuration and appropriate API routing; publishing static frontend files alone does not host the Node.js API.
