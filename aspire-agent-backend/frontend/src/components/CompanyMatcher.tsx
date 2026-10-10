import { useState } from "react";

type Recommendation = {
  id: number;
  company: string;
  role: string;
  matchScore: number;
  skillMatchPercent: number;
  matchedSkills: string[];
  missingSkills: string[];
  eligibility: "Eligible" | "Unknown" | "Not eligible";
  eligibilityNotes: string[];
  location: string | null;
  careersUrl: string | null;
  sourceUrl: string | null;
  verifiedAt: string | null;
  requiredSkills: string[];
};

type ApiResponse = {
  conversationId: string;
  explanation: string;
  recommendations: Recommendation[];
  catalogCount: number;
  notice: string;
};

const API = import.meta.env.VITE_ASPIRE_AGENT_API_URL || "http://localhost:8787";

export default function CompanyMatcher() {
  const [cgpa, setCgpa] = useState("7.2");
  const [degree, setDegree] = useState("B.Tech Computer and Communication Engineering");
  const [graduationYear, setGraduationYear] = useState("2027");
  const [skills, setSkills] = useState("C, Embedded C, STM32, UART, SPI, Microcontrollers");
  const [roles, setRoles] = useState("Embedded Systems, Firmware");
  const [message, setMessage] = useState("Rank the most suitable company roles for my profile and explain my skill gaps.");
  const [conversationId, setConversationId] = useState("");
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const response = await fetch(`${API}/api/agent/recommendations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: conversationId || undefined,
          message,
          profile: {
            cgpa: Number(cgpa),
            degree,
            graduationYear: Number(graduationYear),
            skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
            preferredRoles: roles.split(",").map((s) => s.trim()).filter(Boolean)
          }
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Request failed");
      setResult(data as ApiResponse);
      setConversationId(data.conversationId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to reach the ASPIRE API.");
    } finally {
      setLoading(false);
    }
  }

  const styles: Record<string, React.CSSProperties> = {
    page: { maxWidth: 1080, margin: "0 auto", padding: 24, color: "var(--text-primary, #172033)", fontFamily: "inherit" },
    card: { border: "1px solid var(--border, #dce2ec)", borderRadius: 16, padding: 20, marginBottom: 18, background: "var(--card, #fff)" },
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 14 },
    label: { display: "grid", gap: 6, fontSize: 14, fontWeight: 600 },
    input: { width: "100%", boxSizing: "border-box", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: 9, font: "inherit", background: "var(--input-bg, #fff)", color: "inherit" },
    button: { border: 0, borderRadius: 10, padding: "12px 18px", background: "#2459a9", color: "white", fontWeight: 700, cursor: "pointer" },
    muted: { color: "var(--text-secondary, #5c6678)", fontSize: 13 },
    tag: { display: "inline-block", padding: "4px 8px", borderRadius: 999, background: "#eef2f8", margin: "3px 4px 3px 0", fontSize: 12 },
    result: { border: "1px solid #dce2ec", borderRadius: 13, padding: 16, marginBottom: 12 }
  };

  return (
    <main style={styles.page}>
      <header style={{ marginBottom: 22 }}>
        <p style={{ color: "#2459a9", fontWeight: 800, letterSpacing: 1.4, fontSize: 12 }}>ASPIRE · CAREER INTELLIGENCE</p>
        <h1 style={{ margin: "4px 0 8px" }}>Company Match Agent</h1>
        <p style={styles.muted}>Enter a profile to rank company-role matches by skill fit and known eligibility criteria.</p>
      </header>

      <form style={styles.card} onSubmit={submit}>
        <div style={styles.grid}>
          <label style={styles.label}>CGPA (out of 10)
            <input style={styles.input} type="number" min="0" max="10" step="0.01" value={cgpa} onChange={(e) => setCgpa(e.target.value)} required />
          </label>
          <label style={styles.label}>Graduation year
            <input style={styles.input} type="number" min="2000" max="2100" value={graduationYear} onChange={(e) => setGraduationYear(e.target.value)} required />
          </label>
          <label style={styles.label}>Degree
            <input style={styles.input} value={degree} onChange={(e) => setDegree(e.target.value)} required />
          </label>
          <label style={styles.label}>Preferred roles (comma-separated)
            <input style={styles.input} value={roles} onChange={(e) => setRoles(e.target.value)} placeholder="Embedded, Firmware, VLSI" />
          </label>
          <label style={{ ...styles.label, gridColumn: "1 / -1" }}>Skills (comma-separated)
            <textarea style={{ ...styles.input, minHeight: 90, resize: "vertical" }} value={skills} onChange={(e) => setSkills(e.target.value)} required />
          </label>
          <label style={{ ...styles.label, gridColumn: "1 / -1" }}>What would you like the agent to do?
            <textarea style={{ ...styles.input, minHeight: 70, resize: "vertical" }} value={message} onChange={(e) => setMessage(e.target.value)} required />
          </label>
        </div>
        <button style={{ ...styles.button, marginTop: 16 }} type="submit" disabled={loading}>
          {loading ? "Analyzing profile…" : "Find suitable companies"}
        </button>
        {error && <p role="alert" style={{ color: "#b42318", marginTop: 12 }}>{error}</p>}
      </form>

      {result && (
        <>
          <section style={styles.card}>
            <h2 style={{ marginTop: 0 }}>Agent analysis</h2>
            <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{result.explanation}</p>
            <p style={styles.muted}>Loaded {result.catalogCount} role records · Conversation saved in MySQL.</p>
          </section>
          <section style={styles.card}>
            <h2 style={{ marginTop: 0 }}>Ranked company roles</h2>
            <p style={styles.muted}>Sorted by eligibility group, then match score descending. Unknown eligibility is not a confirmation of eligibility.</p>
            {result.recommendations.map((r, i) => (
              <article key={r.id} style={styles.result}>
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                  <div>
                    <p style={{ ...styles.muted, margin: "0 0 4px" }}>#{i + 1} · {r.company}</p>
                    <h3 style={{ margin: "0 0 8px" }}>{r.role}</h3>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <strong style={{ fontSize: 24 }}>{r.matchScore}%</strong>
                    <div style={styles.muted}>match score</div>
                  </div>
                </div>
                <p><strong>Eligibility:</strong> {r.eligibility}</p>
                <p><strong>Skill fit:</strong> {r.skillMatchPercent}%</p>
                <div><strong>Matched skills:</strong><br />{r.matchedSkills.length ? r.matchedSkills.map((s) => <span key={s} style={styles.tag}>{s}</span>) : <span style={styles.muted}>No direct matches found</span>}</div>
                <div style={{ marginTop: 8 }}><strong>Skills to develop:</strong><br />{r.missingSkills.length ? r.missingSkills.map((s) => <span key={s} style={styles.tag}>{s}</span>) : <span style={styles.muted}>No listed skill gaps</span>}</div>
                <ul style={{ paddingLeft: 20, lineHeight: 1.5 }}>{r.eligibilityNotes.map((n, idx) => <li key={idx}>{n}</li>)}</ul>
                <p style={styles.muted}>Requirements last verified: {r.verifiedAt || "Not recorded"}</p>
                {r.careersUrl && <a href={r.careersUrl} target="_blank" rel="noreferrer">Company careers page ↗</a>}
                {r.sourceUrl && <> · <a href={r.sourceUrl} target="_blank" rel="noreferrer">Eligibility source ↗</a></>}
              </article>
            ))}
            <p style={styles.muted}>{result.notice}</p>
          </section>
          <section style={styles.card}>
            <h3 style={{ marginTop: 0 }}>Approval and safety</h3>
            <p style={styles.muted}>This agent only reads the company catalog and creates recommendations. It does not change your profile, contact recruiters, or submit applications. Those features must use an authenticated approval step before execution.</p>
          </section>
        </>
      )}
    </main>
  );
}
