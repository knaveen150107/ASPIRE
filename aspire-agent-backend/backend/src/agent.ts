import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { tool } from "@langchain/core/tools";
import { Annotation, StateGraph, START, END } from "@langchain/langgraph";
import { z } from "zod";
import { getRecentMessages, searchCompanyRoles, type CompanyRole } from "./db.js";
import { rankCompanyRoles, type RankedRole, type StudentProfile } from "./matching.js";

const companySearchTool = tool(
  async ({ skills }) => {
    const rows = await searchCompanyRoles(skills);
    // Return only the fields needed for recommendation generation.
    return JSON.stringify(rows.map((r) => ({
      id: r.id,
      company_name: r.company_name,
      role_title: r.role_title,
      required_skills: r.required_skills,
      min_cgpa: r.min_cgpa,
      degree_eligibility: r.degree_eligibility,
      min_graduation_year: r.min_graduation_year,
      max_graduation_year: r.max_graduation_year,
      location: r.location,
      official_careers_url: r.official_careers_url,
      source_url: r.source_url,
      verified_at: r.verified_at
    })));
  },
  {
    name: "search_company_roles",
    description: "Read the active company-role catalog from MySQL. Use this to retrieve role requirements before explaining recommendations.",
    schema: z.object({
      skills: z.array(z.string()).max(50).describe("Student skills used as matching context")
    })
  }
);

const AgentState = Annotation.Root({
  profile: Annotation<StudentProfile>(),
  conversationId: Annotation<string>(),
  userMessage: Annotation<string>(),
  history: Annotation<Array<{ role: "user" | "assistant"; content: string }>>(),
  catalog: Annotation<CompanyRole[]>({ reducer: (_, next) => next, default: () => [] }),
  ranked: Annotation<RankedRole[]>({ reducer: (_, next) => next, default: () => [] }),
  explanation: Annotation<string>({ reducer: (_, next) => next, default: () => "" })
});

const model = new ChatGoogleGenerativeAI({
  model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
  apiKey: process.env.GOOGLE_API_KEY,
  temperature: 0.2,
  maxOutputTokens: 1400
});

const graph = new StateGraph(AgentState)
  .addNode("retrieve_catalog", async (state) => {
    // Explicitly invoke the LangChain tool. SQL stays read-only and parameterized.
    const raw = await companySearchTool.invoke({ skills: state.profile.skills });
    const catalog = JSON.parse(String(raw)) as CompanyRole[];
    return { catalog };
  })
  .addNode("rank_roles", async (state) => ({
    ranked: rankCompanyRoles(state.profile, state.catalog)
  }))
  .addNode("explain_results", async (state) => {
    const top = state.ranked.slice(0, 12).map((r, i) => ({
      rank: i + 1,
      company: r.company,
      role: r.role,
      score: r.matchScore,
      eligibility: r.eligibility,
      matchedSkills: r.matchedSkills,
      missingSkills: r.missingSkills,
      notes: r.eligibilityNotes,
      verifiedAt: r.verifiedAt,
      sourceUrl: r.sourceUrl,
      careersUrl: r.careersUrl
    }));

    const history = state.history.slice(-8).map((m) => `${m.role}: ${m.content}`).join("\n");
    const response = await model.invoke([
      {
        role: "system",
        content: `You are ASPIRE, a careful career-intelligence assistant.
Explain the already-computed ranked company-role results in clear beginner-friendly language.
Do not change the numeric scores, reorder results, invent openings, invent CGPA cutoffs, or claim a student is eligible if eligibility is Unknown.
Explain that score means skill/requirements fit, not probability of hiring.
If data is missing, say it is missing. Prioritize concrete missing skills and practical next steps.
Do not apply for jobs, send messages, or change records. These are read-only recommendations.`
      },
      {
        role: "user",
        content: `Student profile: ${JSON.stringify(state.profile)}
Recent conversation:
${history || "(no previous messages)"}

Latest request: ${state.userMessage}

Use these ranked results exactly as given:
${JSON.stringify(top, null, 2)}

Write a short summary of the strongest matches and the most important skill gaps. Do not repeat the entire table.`
      }
    ]);
    return { explanation: typeof response.content === "string" ? response.content : JSON.stringify(response.content) };
  })
  .addEdge(START, "retrieve_catalog")
  .addEdge("retrieve_catalog", "rank_roles")
  .addEdge("rank_roles", "explain_results")
  .addEdge("explain_results", END)
  .compile();

export async function recommendCompanies(input: {
  profile: StudentProfile;
  conversationId: string;
  userMessage: string;
}) {
  const history = await getRecentMessages(input.conversationId, 12);
  const result = await graph.invoke({
    ...input,
    history: history.map((m) => ({ role: m.role, content: m.content }))
  });
  return {
    explanation: result.explanation,
    recommendations: result.ranked,
    catalogCount: result.catalog.length,
    notice: "Catalog-based recommendation only. Verify current vacancies and eligibility through the official source."
  };
}
