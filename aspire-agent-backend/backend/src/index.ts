import "dotenv/config";
import express from "express";
import cors from "cors";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { checkDatabase, getRecentMessages, saveMessage } from "./db.js";
import { recommendCompanies } from "./agent.js";

const app = express();
const port = Number(process.env.PORT || 8787);
const allowedOrigin = process.env.FRONTEND_ORIGIN || "http://localhost:5173";

app.use(cors({ origin: allowedOrigin }));
app.use(express.json({ limit: "100kb" }));

const profileSchema = z.object({
  cgpa: z.number().min(0).max(10),
  degree: z.string().trim().min(2).max(160),
  graduationYear: z.number().int().min(2000).max(2100),
  skills: z.array(z.string().trim().min(1).max(80)).min(1).max(50),
  preferredRoles: z.array(z.string().trim().min(1).max(100)).max(20).default([])
});

const requestSchema = z.object({
  conversationId: z.string().uuid().optional(),
  message: z.string().trim().min(1).max(4000).default("Rank the most suitable company roles for my profile."),
  profile: profileSchema
});

app.get("/health", async (_req, res) => {
  try {
    await checkDatabase();
    res.json({ status: "ok", database: "connected" });
  } catch (error) {
    res.status(503).json({ status: "error", database: "unavailable", message: "Check MySQL configuration and schema." });
  }
});

app.post("/api/agent/recommendations", async (req, res) => {
  const parsed = requestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid request", details: parsed.error.flatten() });
  }

  const conversationId = parsed.data.conversationId || randomUUID();
  const { profile, message } = parsed.data;

  try {
    // Save the request and response for MySQL-backed conversation memory.
    await saveMessage(conversationId, "user", `${message}\nProfile: ${JSON.stringify(profile)}`);
    const result = await recommendCompanies({ profile, conversationId, userMessage: message });
    await saveMessage(conversationId, "assistant", result.explanation);

    return res.json({ conversationId, ...result });
  } catch (error) {
    console.error("Recommendation request failed:", error);
    return res.status(500).json({
      error: "The recommendation could not be completed.",
      hint: "Check the backend terminal, Gemini API key, MySQL connection, and company_roles table."
    });
  }
});

app.get("/api/agent/conversations/:conversationId", async (req, res) => {
  const parsed = z.string().uuid().safeParse(req.params.conversationId);
  if (!parsed.success) return res.status(400).json({ error: "Invalid conversation ID" });
  try {
    const messages = await getRecentMessages(parsed.data, 30);
    res.json({ conversationId: parsed.data, messages });
  } catch (error) {
    console.error("Conversation history request failed:", error);
    res.status(500).json({ error: "Could not load conversation history." });
  }
});

app.listen(port, () => {
  console.log(`ASPIRE Agent API listening at http://localhost:${port}`);
  console.log("This starter is read-only and intended for local development.");
});
