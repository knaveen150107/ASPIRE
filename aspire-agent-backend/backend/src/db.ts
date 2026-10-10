import { MongoClient, type Db } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("Missing required environment variable: MONGODB_URI");
}

const databaseName = process.env.MONGODB_DATABASE || "aspire_db";
const client = new MongoClient(uri);

let databasePromise: Promise<Db> | undefined;

async function getDb(): Promise<Db> {
  if (!databasePromise) {
    databasePromise = client.connect().then(() => client.db(databaseName));
  }
  return databasePromise;
}

export type CompanyRole = {
  id: string | number;
  company_name: string;
  role_title: string;
  required_skills: string[];
  min_cgpa: number | null;
  degree_eligibility: string[] | null;
  min_graduation_year: number | null;
  max_graduation_year: number | null;
  location: string | null;
  official_careers_url: string | null;
  source_url: string | null;
  verified_at: string | null;
  active: number | boolean;
};

function stringArray(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;
  return value.map(String);
}

function optionalNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function optionalString(value: unknown): string | null {
  return value === null || value === undefined ? null : String(value);
}

export async function searchCompanyRoles(
  _skills: string[]
): Promise<CompanyRole[]> {
  const db = await getDb();

  // Use a separate collection to avoid changing existing ASPIRE collections.
  const documents = await db
    .collection("aspire_company_roles")
    .find({ active: { $nin: [false, 0] } })
    .sort({ company_name: 1, role_title: 1 })
    .limit(250)
    .toArray();

  return documents.map((doc) => ({
    id: typeof doc.id === "number" || typeof doc.id === "string"
      ? doc.id
      : String(doc._id),
    company_name: String(doc.company_name ?? "Unknown company"),
    role_title: String(doc.role_title ?? "Unspecified role"),
    required_skills: stringArray(doc.required_skills) ?? [],
    min_cgpa: optionalNumber(doc.min_cgpa),
    degree_eligibility: stringArray(doc.degree_eligibility),
    min_graduation_year: optionalNumber(doc.min_graduation_year),
    max_graduation_year: optionalNumber(doc.max_graduation_year),
    location: optionalString(doc.location),
    official_careers_url: optionalString(doc.official_careers_url),
    source_url: optionalString(doc.source_url),
    verified_at: doc.verified_at instanceof Date
      ? doc.verified_at.toISOString()
      : optionalString(doc.verified_at),
    active: typeof doc.active === "boolean"
      ? doc.active
      : Number(doc.active ?? 1)
  }));
}

export async function saveMessage(
  conversationId: string,
  role: "user" | "assistant",
  content: string
): Promise<void> {
  const db = await getDb();

  await db.collection("aspire_agent_messages").insertOne({
    conversation_id: conversationId,
    role,
    content,
    created_at: new Date()
  });
}

export async function getRecentMessages(
  conversationId: string,
  limit = 12
) {
  const safeLimit = Math.min(Math.max(Math.floor(limit), 1), 30);
  const db = await getDb();

  const documents = await db
    .collection("aspire_agent_messages")
    .find({ conversation_id: conversationId })
    .sort({ created_at: -1 })
    .limit(safeLimit)
    .toArray();

  return documents.reverse().map((doc) => ({
    role: String(doc.role) as "user" | "assistant",
    content: String(doc.content),
    createdAt: doc.created_at
  }));
}

export async function checkDatabase(): Promise<void> {
  const db = await getDb();
  await db.command({ ping: 1 });
}
