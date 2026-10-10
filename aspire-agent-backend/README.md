# ASPIRE AI Agent — Company Matching Starter

This is an **add-on starter**, not a replacement for your existing ASPIRE application.
It adds a standalone Node.js API using LangChain, LangGraph, Google Gemini, and MySQL,
plus a React component that can be imported into your existing Vite frontend.

## What it does
- Accepts CGPA, degree, graduation year, skills, preferred roles, and a conversation ID.
- Reads company-role requirements from MySQL using a read-only LangChain tool.
- Computes transparent, deterministic match scores and sorts recommendations.
- Uses Gemini to explain the ranked results and skill gaps.
- Persists user/assistant conversation messages in MySQL.
- Does not apply to jobs, modify student profiles, or perform other consequential actions.
  Those operations must be added behind an explicit approval gate and your real authentication.

## Important limitations
- Seed records are examples of role/skill categories at real companies, **not live vacancies**.
- Minimum CGPA and eligibility values are intentionally unknown until you enter verified data.
- Match score is a skill/requirements fit indicator, not a hiring probability.
- The starter has no authentication. Run locally only until you connect it to your existing
  authenticated backend. Do not expose it publicly as-is.
- I could not inspect your live local Git working tree from this chat. The code is isolated so
  you can test it before integrating it.

## Requirements
- Node.js 20 or newer
- MySQL 8+
- Google Gemini API key from Google AI Studio
- Existing React + TypeScript + Vite app

## 1. Create the database tables
Open MySQL Workbench, connect to your local MySQL server, and run:
`database/schema.sql`

The script creates `aspire_agent` if it does not already exist. If you already use a different
database, change `DB_NAME` in `.env` and run the table definitions inside that database.

## 2. Configure the backend
Open a terminal in `backend`:

```powershell
npm install
Copy-Item .env.example .env
```

Edit `backend/.env` and set your MySQL credentials and Gemini key. Do not commit `.env`.

Then run:

```powershell
npm run dev
```

Health check: http://localhost:8787/health

## 3. Add the React component
Copy `frontend/src/components/CompanyMatcher.tsx` into your existing Vite frontend.
Import it where you want the matching form to appear:

```tsx
import CompanyMatcher from "./components/CompanyMatcher";

export default function CareerMatchingPage() {
  return <CompanyMatcher />;
}
```

If the component is in a different folder, adjust the import path. The component is standalone and
does not require a UI library.

Optional frontend `.env`:
```env
VITE_ASPIRE_AGENT_API_URL=http://localhost:8787
```
Restart Vite after changing environment variables.

## 4. Test it
1. Start MySQL.
2. Start the API from `backend` with `npm run dev`.
3. Start your existing frontend with its usual `npm run dev`.
4. Enter a CGPA and skills such as `C, Embedded C, STM32, UART, SPI, RTOS`.
5. Review the sorted company-role list and eligibility status.

## API
`POST /api/agent/recommendations`

Example JSON:
```json
{
  "conversationId": "a0a9e8f0-6c0f-4e0f-a2e1-b27f62f7b3b1",
  "message": "Rank companies for my profile and explain skill gaps.",
  "profile": {
    "cgpa": 7.2,
    "degree": "B.Tech Computer and Communication Engineering",
    "graduationYear": 2027,
    "skills": ["C", "Embedded C", "STM32", "UART", "SPI", "RTOS"],
    "preferredRoles": ["Embedded Systems", "Firmware"]
  }
}
```

`GET /api/agent/conversations/:conversationId` returns stored chat history.
`GET /health` checks the API and MySQL connection.

## How scoring works
- Skill fit is calculated from the overlap between the student's skills and the role's required skills.
- If a verified minimum CGPA is present, the score includes a CGPA component.
- Roles with known unmet CGPA requirements are ranked below eligible and unknown-eligibility roles.
- If CGPA criteria are absent, eligibility is **Unknown**, not assumed eligible.
- Final sorting is eligibility group first, then score descending.

Edit the company-role catalog with verified requirements and source URLs before relying on eligibility.
Use the official company career pages and your placement cell's current circulars as sources.

## Integrating with the existing project safely
- Do not replace your existing `package.json`, app router, login flow, or database configuration.
- First run this add-on separately and confirm it works.
- Then merge only the needed API routes and the React component.
- In production, derive the student identity from your authenticated session; do not trust a
  user ID sent by the browser.
- Add an authenticated approval workflow before implementing actions such as saving profile
  changes, submitting applications, or sending messages.
