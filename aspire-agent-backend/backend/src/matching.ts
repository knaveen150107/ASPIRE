import type { CompanyRole } from "./db.js";

export type StudentProfile = {
  cgpa: number;
  degree: string;
  graduationYear: number;
  skills: string[];
  preferredRoles: string[];
};

export type RankedRole = {
  id: string | number;
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

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9+#.]/g, "").trim();
}

function skillEquivalent(a: string, b: string): boolean {
  const x = normalize(a);
  const y = normalize(b);
  if (x === y) return true;
  const aliases: Record<string, string[]> = {
    "embeddedc": ["c", "embedded c", "embedded-c"],
    "embeddedc++": ["c++", "embedded c++"],
    "microcontrollers": ["microcontroller", "mcu"],
    "armcortexm": ["cortex-m", "arm cortex m"],
    "uart": ["serial communication"],
    "spi": ["serial peripheral interface"],
    "i2c": ["iic"],
    "rtos": ["real-time operating system", "freertos"],
    "pcbdesign": ["pcb", "printed circuit board"],
    "python": ["python programming"]
  };
  const canonical = (v: string) => {
    for (const [key, vals] of Object.entries(aliases)) {
      if (normalize(key) === v || vals.some((item) => normalize(item) === v)) return key;
    }
    return v;
  };
  return canonical(x) === canonical(y);
}

export function rankCompanyRoles(profile: StudentProfile, rows: CompanyRole[]): RankedRole[] {
  const normalizedProfileSkills = profile.skills.map((s) => s.trim()).filter(Boolean);
  const preferred = profile.preferredRoles.map(normalize).filter(Boolean);

  const ranked = rows.map((row) => {
    const required = row.required_skills ?? [];
    const matchedSkills = required.filter((requiredSkill) =>
      normalizedProfileSkills.some((profileSkill) => skillEquivalent(profileSkill, requiredSkill))
    );
    const missingSkills = required.filter((skill) => !matchedSkills.includes(skill));
    const skillMatchPercent = required.length
      ? Math.round((matchedSkills.length / required.length) * 100)
      : 0;

    const notes: string[] = [];
    let eligibility: RankedRole["eligibility"] = "Unknown";
    let cgpaComponent: number | null = null;

    if (row.min_cgpa != null) {
      cgpaComponent = profile.cgpa >= row.min_cgpa ? 100 : 0;
      if (profile.cgpa >= row.min_cgpa) {
        notes.push(`CGPA ${profile.cgpa.toFixed(2)} meets the recorded minimum ${row.min_cgpa.toFixed(2)}.`);
        eligibility = "Eligible";
      } else {
        notes.push(`CGPA ${profile.cgpa.toFixed(2)} is below the recorded minimum ${row.min_cgpa.toFixed(2)}.`);
        eligibility = "Not eligible";
      }
    } else {
      notes.push("Minimum CGPA is not verified in the catalog.");
    }

    if (row.degree_eligibility?.length) {
      const degreeMatches = row.degree_eligibility.some((d) =>
        normalize(profile.degree).includes(normalize(d)) || normalize(d).includes(normalize(profile.degree))
      );
      if (!degreeMatches) {
        eligibility = "Not eligible";
        notes.push("The degree does not match the recorded degree eligibility list.");
      } else if (eligibility !== "Not eligible") {
        notes.push("Degree matches the recorded degree eligibility list.");
        if (row.min_cgpa != null) eligibility = "Eligible";
      }
    } else {
      notes.push("Degree eligibility is not verified in the catalog.");
      if (eligibility === "Eligible") eligibility = "Unknown";
    }

    if (row.min_graduation_year != null && profile.graduationYear < row.min_graduation_year) {
      eligibility = "Not eligible";
      notes.push(`Graduation year must be ${row.min_graduation_year} or later.`);
    }
    if (row.max_graduation_year != null && profile.graduationYear > row.max_graduation_year) {
      eligibility = "Not eligible";
      notes.push(`Graduation year must be ${row.max_graduation_year} or earlier.`);
    }

    const score = cgpaComponent == null
      ? skillMatchPercent
      : Math.round(skillMatchPercent * 0.8 + cgpaComponent * 0.2);
    const roleBoost = preferred.length && preferred.some((r) =>
      normalize(row.role_title).includes(r) || r.includes(normalize(row.role_title))
    ) ? 5 : 0;

    return {
      id: row.id,
      company: row.company_name,
      role: row.role_title,
      matchScore: Math.min(100, score + roleBoost),
      skillMatchPercent,
      matchedSkills,
      missingSkills,
      eligibility,
      eligibilityNotes: notes,
      location: row.location,
      careersUrl: row.official_careers_url,
      sourceUrl: row.source_url,
      verifiedAt: row.verified_at,
      requiredSkills: required
    };
  });

  const groupOrder = { "Eligible": 0, "Unknown": 1, "Not eligible": 2 };
  return ranked.sort((a, b) =>
    groupOrder[a.eligibility] - groupOrder[b.eligibility] ||
    b.matchScore - a.matchScore ||
    a.company.localeCompare(b.company)
  );
}

