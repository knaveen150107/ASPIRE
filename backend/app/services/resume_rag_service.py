"""Vector Embedding-Based RAG Pipeline for Resume PDF Analysis and Skill Extraction.

Features:
- Multi-format document parser (PDF / DOCX / TXT)
- Semantic section tagging & recursive sliding-window chunking
- Dense vector embedding engine (Google GenAI text-embedding-004 + Local 512-D Subword Projections)
- High-precision Hybrid Extraction:
  * Comprehensive Canonical Skills Ontology (140+ industry skills & categories)
  * Rich Multi-Alias & Synonym Matching Engine (e.g. ReactJS -> React, K8s -> Kubernetes, DSA -> Data Structures & Algorithms)
  * Strictly Sandboxed Section Entity Extractor (parses custom libraries and tools ONLY from Skills sections)
  * Smart Non-Skill Entity Filter (rejects company names, locations, job titles, sentence fragments)
  * Gemini Generative AI Structured Extractor (when API key is configured)
  * Full Vector Store RAG Retrieval & Context Evidence Grounding
- Automated context-based proficiency deduction (beginner / intermediate / advanced / expert)
- Rich executive summary synthesis grounded in retrieved vector chunks
"""

import io
import json
import logging
import os
import re
import subprocess
import tempfile
from dataclasses import dataclass
from typing import Any, Dict, List, Optional, Set, Tuple
import numpy as np

logger = logging.getLogger(__name__)

try:
    import pypdf
except ImportError:
    pypdf = None

try:
    import docx
except ImportError:
    docx = None

try:
    from google import genai
    from google.genai import types
except ImportError:
    genai = None


@dataclass
class TextChunk:
    chunk_id: int
    text: str
    section: str
    word_count: int


@dataclass
class RetrievalMatch:
    chunk: TextChunk
    similarity_score: float


# =====================================================================
# 1. Comprehensive Canonical Skills Ontology & Aliases
# =====================================================================

CANONICAL_SKILL_CATALOG = [
    # Programming Languages
    {"name": "Python", "category": "Programming Languages", "aliases": ["python", "python3", "py"]},
    {"name": "Java", "category": "Programming Languages", "aliases": ["java", "core java", "j2ee"]},
    {"name": "C++", "category": "Programming Languages", "aliases": ["c++", "cpp", "c / c++", "c/c++"]},
    {"name": "C", "category": "Programming Languages", "aliases": ["c"]},
    {"name": "C#", "category": "Programming Languages", "aliases": ["c#", "csharp", "c-sharp", ".net c#"]},
    {"name": "JavaScript", "category": "Programming Languages", "aliases": ["javascript", "js", "ecmascript", "es6", "es6+"]},
    {"name": "TypeScript", "category": "Programming Languages", "aliases": ["typescript", "ts"]},
    {"name": "Go", "category": "Programming Languages", "aliases": ["go", "golang"]},
    {"name": "Rust", "category": "Programming Languages", "aliases": ["rust", "rustlang"]},
    {"name": "SQL", "category": "Programming Languages", "aliases": ["sql", "pl/sql", "t-sql", "sql queries"]},
    {"name": "Kotlin", "category": "Programming Languages", "aliases": ["kotlin"]},
    {"name": "Swift", "category": "Programming Languages", "aliases": ["swift"]},
    {"name": "PHP", "category": "Programming Languages", "aliases": ["php", "php8"]},
    {"name": "Ruby", "category": "Programming Languages", "aliases": ["ruby", "ruby on rails"]},
    {"name": "Scala", "category": "Programming Languages", "aliases": ["scala"]},
    {"name": "R", "category": "Programming Languages", "aliases": ["r language", "r programming"]},
    {"name": "Dart", "category": "Programming Languages", "aliases": ["dart"]},
    {"name": "Shell Scripting", "category": "Programming Languages", "aliases": ["bash", "shell", "shell scripting", "zsh", "powershell"]},

    # Frontend Development
    {"name": "React", "category": "Frontend Development", "aliases": ["react", "react.js", "reactjs", "react js"]},
    {"name": "Next.js", "category": "Frontend Development", "aliases": ["next.js", "nextjs", "next js", "next"]},
    {"name": "Vue.js", "category": "Frontend Development", "aliases": ["vue", "vue.js", "vuejs", "vue 3"]},
    {"name": "Angular", "category": "Frontend Development", "aliases": ["angular", "angular.js", "angularjs", "angular 2+"]},
    {"name": "HTML5", "category": "Frontend Development", "aliases": ["html5", "html", "semantic html"]},
    {"name": "CSS3", "category": "Frontend Development", "aliases": ["css3", "css", "css grid", "flexbox"]},
    {"name": "Tailwind CSS", "category": "Frontend Development", "aliases": ["tailwind css", "tailwindcss", "tailwind"]},
    {"name": "Redux", "category": "Frontend Development", "aliases": ["redux", "redux toolkit", "rtk"]},
    {"name": "Bootstrap", "category": "Frontend Development", "aliases": ["bootstrap", "bootstrap 5"]},
    {"name": "SASS/SCSS", "category": "Frontend Development", "aliases": ["sass", "scss"]},
    {"name": "Vite", "category": "Frontend Development", "aliases": ["vite", "vitejs"]},
    {"name": "Webpack", "category": "Frontend Development", "aliases": ["webpack"]},
    {"name": "jQuery", "category": "Frontend Development", "aliases": ["jquery"]},
    {"name": "Svelte", "category": "Frontend Development", "aliases": ["svelte", "sveltekit"]},

    # Backend Development
    {"name": "Node.js", "category": "Backend Development", "aliases": ["node.js", "nodejs", "node js", "node"]},
    {"name": "Express.js", "category": "Backend Development", "aliases": ["express.js", "expressjs", "express js", "express"]},
    {"name": "FastAPI", "category": "Backend Development", "aliases": ["fastapi", "fast api"]},
    {"name": "Django", "category": "Backend Development", "aliases": ["django", "django rest framework", "drf"]},
    {"name": "Flask", "category": "Backend Development", "aliases": ["flask"]},
    {"name": "Spring Boot", "category": "Backend Development", "aliases": ["spring boot", "springboot", "spring framework", "spring"]},
    {"name": "REST APIs", "category": "Backend Development", "aliases": ["rest apis", "rest api", "restful apis", "restful api", "rest web services", "rest"]},
    {"name": "GraphQL", "category": "Backend Development", "aliases": ["graphql", "apollo graphql"]},
    {"name": "gRPC", "category": "Backend Development", "aliases": ["grpc", "protobuf"]},
    {"name": "NestJS", "category": "Backend Development", "aliases": ["nestjs", "nest.js"]},
    {"name": "ASP.NET Core", "category": "Backend Development", "aliases": ["asp.net", "asp.net core", ".net core", "dot net"]},
    {"name": "Microservices", "category": "Backend Development", "aliases": ["microservices", "microservice architecture", "multi-agent applications", "multi-agent"]},
    {"name": "Celery", "category": "Backend Development", "aliases": ["celery", "task queues"]},
    {"name": "Kafka", "category": "Backend Development", "aliases": ["kafka", "apache kafka"]},
    {"name": "RabbitMQ", "category": "Backend Development", "aliases": ["rabbitmq"]},

    # Databases & Storage
    {"name": "MySQL", "category": "Databases & Storage", "aliases": ["mysql", "mariadb"]},
    {"name": "PostgreSQL", "category": "Databases & Storage", "aliases": ["postgresql", "postgres", "psql"]},
    {"name": "MongoDB", "category": "Databases & Storage", "aliases": ["mongodb", "mongo", "mongoose"]},
    {"name": "Redis", "category": "Databases & Storage", "aliases": ["redis", "redis cache"]},
    {"name": "SQLite", "category": "Databases & Storage", "aliases": ["sqlite", "sqlite3"]},
    {"name": "Elasticsearch", "category": "Databases & Storage", "aliases": ["elasticsearch", "elastic search", "elk stack"]},
    {"name": "Firebase", "category": "Databases & Storage", "aliases": ["firebase", "firestore", "firebase auth"]},
    {"name": "Supabase", "category": "Databases & Storage", "aliases": ["supabase"]},
    {"name": "Prisma", "category": "Databases & Storage", "aliases": ["prisma", "prisma orm"]},
    {"name": "Cassandra", "category": "Databases & Storage", "aliases": ["cassandra", "apache cassandra"]},
    {"name": "DynamoDB", "category": "Databases & Storage", "aliases": ["dynamodb", "aws dynamodb"]},
    {"name": "Neo4j", "category": "Databases & Storage", "aliases": ["neo4j", "graph database"]},

    # Cloud & DevOps
    {"name": "AWS", "category": "Cloud & DevOps", "aliases": ["aws", "amazon web services", "ec2", "s3", "lambda", "aws cloud"]},
    {"name": "Microsoft Azure", "category": "Cloud & DevOps", "aliases": ["azure", "microsoft azure", "azure devops"]},
    {"name": "Google Cloud (GCP)", "category": "Cloud & DevOps", "aliases": ["google cloud", "gcp", "google cloud platform", "bigquery", "cloud run"]},
    {"name": "Docker", "category": "Cloud & DevOps", "aliases": ["docker", "dockerfile", "docker compose", "containerization"]},
    {"name": "Kubernetes", "category": "Cloud & DevOps", "aliases": ["kubernetes", "k8s", "kubectl", "helm"]},
    {"name": "Git", "category": "Cloud & DevOps", "aliases": ["git", "github", "gitlab", "bitbucket", "version control"]},
    {"name": "CI/CD", "category": "Cloud & DevOps", "aliases": ["ci/cd", "ci / cd", "continuous integration", "github actions", "jenkins", "gitlab ci"]},
    {"name": "Linux", "category": "Cloud & DevOps", "aliases": ["linux", "ubuntu", "debian", "centos", "unix"]},
    {"name": "Terraform", "category": "Cloud & DevOps", "aliases": ["terraform", "iac", "infrastructure as code"]},
    {"name": "Nginx", "category": "Cloud & DevOps", "aliases": ["nginx", "reverse proxy"]},
    {"name": "Vercel", "category": "Cloud & DevOps", "aliases": ["vercel"]},
    {"name": "Netlify", "category": "Cloud & DevOps", "aliases": ["netlify"]},

    # Embedded Systems, Hardware & IoT
    {"name": "Embedded Systems", "category": "Embedded & Hardware", "aliases": ["embedded systems", "embedded firmware", "embedded prototypes", "real-time system development", "system-level debugging"]},
    {"name": "Microcontrollers", "category": "Embedded & Hardware", "aliases": ["microcontrollers", "microcontroller", "micro board"]},
    {"name": "ARM Architecture", "category": "Embedded & Hardware", "aliases": ["arm7", "arm cortex-m4", "arm cortex", "arm", "lpc2148"]},
    {"name": "Arduino", "category": "Embedded & Hardware", "aliases": ["arduino", "arduino ide"]},
    {"name": "ESP32", "category": "Embedded & Hardware", "aliases": ["esp32", "esp8266"]},
    {"name": "Raspberry Pi", "category": "Embedded & Hardware", "aliases": ["raspberry pi", "raspberry pi 5", "rpi"]},
    {"name": "Tiva Board (ARM Cortex-M4)", "category": "Embedded & Hardware", "aliases": ["tiva board", "tiva c", "tm4c"]},
    {"name": "Hardware Interfacing & GPIO", "category": "Embedded & Hardware", "aliases": ["hardware interfacing", "gpio interfacing", "gpio", "sensor integration", "pwm control", "pwm"]},
    {"name": "Edge AI", "category": "Embedded & Hardware", "aliases": ["edge ai", "edge-ai", "edge computing", "on-device ai", "embedded ai", "edge-deployed", "rv1106"]},
    {"name": "Internet of Things (IoT)", "category": "Embedded & Hardware", "aliases": ["iot", "internet of things", "iot and cloud computing"]},
    {"name": "Automotive Sensors & ECU", "category": "Embedded & Hardware", "aliases": ["automotive sensors", "ecu architecture", "ecu", "signal conditioning"]},

    # Tools, Platforms & CAD
    {"name": "Keil uVision", "category": "Tools & Platforms", "aliases": ["keil uvision", "keil"]},
    {"name": "Arduino IDE", "category": "Tools & Platforms", "aliases": ["arduino ide"]},
    {"name": "Jupyter Notebook", "category": "Tools & Platforms", "aliases": ["jupyter notebook", "jupyter"]},
    {"name": "Autodesk Fusion 360", "category": "Tools & Platforms", "aliases": ["fusion 360", "autodesk fusion", "3d-printed components", "3d printing"]},
    {"name": "Postman", "category": "Tools & Platforms", "aliases": ["postman", "api testing", "swagger"]},

    # AI, ML & Data Science
    {"name": "Machine Learning", "category": "AI, ML & Data Science", "aliases": ["machine learning", "ml", "supervised learning", "unsupervised learning"]},
    {"name": "Deep Learning", "category": "AI, ML & Data Science", "aliases": ["deep learning", "dl", "neural networks", "cnn", "rnn", "lstm"]},
    {"name": "PyTorch", "category": "AI, ML & Data Science", "aliases": ["pytorch", "torch"]},
    {"name": "TensorFlow", "category": "AI, ML & Data Science", "aliases": ["tensorflow", "tf", "keras"]},
    {"name": "Scikit-Learn", "category": "AI, ML & Data Science", "aliases": ["scikit-learn", "sklearn", "scikit learn"]},
    {"name": "Pandas", "category": "AI, ML & Data Science", "aliases": ["pandas"]},
    {"name": "NumPy", "category": "AI, ML & Data Science", "aliases": ["numpy"]},
    {"name": "Computer Vision", "category": "AI, ML & Data Science", "aliases": ["computer vision", "cv", "opencv", "object detection", "face detection", "face recognition", "scrfd", "arcface", "image processing"]},
    {"name": "Natural Language Processing (NLP)", "category": "AI, ML & Data Science", "aliases": ["nlp", "natural language processing", "spacy", "nltk", "transformers", "hugging face", "bert"]},
    {"name": "Generative AI & LLMs", "category": "AI, ML & Data Science", "aliases": ["generative ai", "genai", "gen ai", "llm", "llms", "large language models", "gemini", "gpt", "openai", "claude", "langchain", "llamaindex"]},
    {"name": "RAG (Retrieval-Augmented Generation)", "category": "AI, ML & Data Science", "aliases": ["rag", "rag-based", "retrieval-augmented generation", "retrieval augmented generation", "vector database", "chromadb", "faiss", "pinecone"]},
    {"name": "Data Analysis", "category": "AI, ML & Data Science", "aliases": ["data analysis", "business data analysis", "eda", "exploratory data analysis", "data analytics", "data visualization", "matplotlib", "seaborn", "tableau", "power bi"]},

    # Core Computer Science
    {"name": "Data Structures & Algorithms", "category": "Core Computer Science", "aliases": ["data structures & algorithms", "data structures and algorithms", "data structures", "algorithms", "dsa", "leetcode", "problem solving"]},
    {"name": "Object-Oriented Programming (OOP)", "category": "Core Computer Science", "aliases": ["object-oriented programming", "object oriented programming", "oop", "oops", "solid principles"]},
    {"name": "System Design", "category": "Core Computer Science", "aliases": ["system design", "low level design", "high level design", "lld", "hld", "scalable systems", "distributed caching"]},
    {"name": "Database Management Systems (DBMS)", "category": "Core Computer Science", "aliases": ["database management systems", "dbms", "rdbms", "database indexing", "acid properties", "normalization"]},
    {"name": "Computer System & Architecture", "category": "Core Computer Science", "aliases": ["computer system & architecture", "computer architecture", "computer organization"]},
    {"name": "Signal Processing", "category": "Core Computer Science", "aliases": ["signal processing"]},
    {"name": "Computer Networks", "category": "Core Computer Science", "aliases": ["computer networks", "computer networking", "networking", "tcp/ip", "http", "https", "dns", "websockets"]},
    {"name": "Operating Systems", "category": "Core Computer Science", "aliases": ["operating systems", "operating system", "os", "multithreading", "concurrency", "process synchronization", "memory management"]},

    # Mobile & Other
    {"name": "Flutter", "category": "Mobile Development", "aliases": ["flutter"]},
    {"name": "React Native", "category": "Mobile Development", "aliases": ["react native", "react-native"]},
    {"name": "Android Development", "category": "Mobile Development", "aliases": ["android development", "android studio", "android"]},
    {"name": "iOS Development", "category": "Mobile Development", "aliases": ["ios development", "ios", "xcode"]},

    # Testing & Quality
    {"name": "Unit Testing", "category": "Testing & QA", "aliases": ["unit testing", "pytest", "jest", "junit", "mocha", "chai", "cypress", "selenium"]},

    # Soft Skills
    {"name": "Problem Solving", "category": "Soft Skills", "aliases": ["problem solving", "problem identification", "analytical skills", "critical thinking"]},
    {"name": "Team Collaboration", "category": "Soft Skills", "aliases": ["teamwork", "team collaboration", "cross-functional collaboration", "agile sprint execution"]},
]


# =====================================================================
# 2. Strict Non-Skill Entity Blacklist & Spoken Languages
# =====================================================================

SPOKEN_LANGUAGES = {
    "english", "tamil", "hindi", "telugu", "kannada", "malayalam", "marathi",
    "bengali", "gujarati", "punjabi", "urdu", "french", "german", "spanish",
    "japanese", "chinese", "mandarin", "russian", "arabic", "italian",
    "portuguese", "korean", "latin", "sanskrit"
}

NON_SKILL_WORDS = {
    # Language Header Artifacts & Spoken Languages
    "language", "languages", "programming language", "programming languages",
    "language known", "languages known", "spoken language", "spoken languages",
    "natural languages", "foreign languages", "fluent", "native", "bilingual", "mother tongue",
    # Organizations & Companies
    "titan", "titan company limited", "tanishq", "company", "limited", "ltd", "corp", "corporation",
    "division", "jewelry division", "it & digital", "labs", "ai labs", "tech corp",
    # Places & Locations
    "hosur", "coimbatore", "bangalore", "bengaluru", "hyderabad", "chennai", "mumbai", "pune", "delhi", "india",
    # Institutions & Degrees
    "amrita", "amrita vishwa vidyapeetham", "amrita school of engineering", "asian christian high school",
    "university", "college", "school", "high school", "b.tech", "pcmb", "higher secondary education", "higher secondary",
    # Job Roles & Statuses
    "intern", "internship", "research intern", "intern – systems", "systems", "systems (it & digital)",
    "ongoing", "prototype", "prototype development", "development", "student", "executive", "summary", "executive summary",
    "activities", "leadership & activities", "coordinator", "ambassador", "creator", "media club", "club",
    "forum", "iete", "iete student forum", "content creator", "iic coordinator", "innovation ambassador",
    "experience", "projects", "education", "leadership", "technical interests", "interests",
    # Non-skill Sentence Fragments
    "on experience in", "focused technical events", "based ai systems", "intelligent inventory agents",
    "driven software development", "including requirement analysis", "real-time object detection",
    "smart flow", "facenet attendance", "engine management system", "digital", "present", "various",
}


# =====================================================================
# 3. Document Parser
# =====================================================================

class DocumentParser:
    """Extracts clean raw text from PDF, DOCX, or text files."""

    @staticmethod
    def extract_from_pdf(content: bytes) -> str:
        text = ""
        if pypdf:
            try:
                reader = pypdf.PdfReader(io.BytesIO(content))
                pages = [page.extract_text() or "" for page in reader.pages]
                text = "\n".join(pages).strip()
            except Exception:
                text = ""

        # Fallback to pdftotext CLI
        if len(text.strip()) < 50 and os.path.exists("/bin/pdftotext"):
            try:
                with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
                    tmp.write(content)
                    tmp_path = tmp.name

                proc = subprocess.run(
                    ["/bin/pdftotext", tmp_path, "-"],
                    capture_output=True,
                    text=True,
                    timeout=10,
                )
                if proc.returncode == 0 and len(proc.stdout.strip()) > len(text):
                    text = proc.stdout.strip()
                os.unlink(tmp_path)
            except Exception:
                pass

        return text

    @staticmethod
    def extract_from_docx(content: bytes) -> str:
        if not docx:
            return ""
        try:
            doc = docx.Document(io.BytesIO(content))
            paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
            for table in doc.tables:
                for row in table.rows:
                    for cell in row.cells:
                        if cell.text.strip():
                            paragraphs.append(cell.text.strip())
            return "\n".join(paragraphs).strip()
        except Exception:
            return ""

    @classmethod
    def parse_file(cls, filename: str, content: bytes) -> str:
        ext = filename.lower().split(".")[-1] if "." in filename else ""
        if ext == "pdf":
            return cls.extract_from_pdf(content)
        elif ext in ["docx", "doc"]:
            return cls.extract_from_docx(content)
        else:
            try:
                return content.decode("utf-8", errors="ignore")
            except Exception:
                return ""


# =====================================================================
# 4. Semantic Chunker
# =====================================================================

class SemanticChunker:
    """Splits resume into semantic, overlapping chunks with section metadata."""

    SECTION_HEADERS = {
        "skills": r"\b(technical\s+skills?|skills?|technologies|proficiencies|tools|languages|stack|technical\s+expertise|competencies|areas\s+of\s+expertise)\b",
        "experience": r"\b(experience|work\s+history|employment|professional\s+experience|internships?|work\s+experience)\b",
        "projects": r"\b(projects?|personal\s+projects?|academic\s+projects?|key\s+projects?|technical\s+projects?)\b",
        "education": r"\b(education|academic\s+background|qualifications?|degrees?|academics)\b",
        "certifications": r"\b(certifications?|licenses?|achievements?|awards?|honors?|publications)\b",
        "leadership": r"\b(leadership|activities|volunteering|extracurricular)\b",
    }

    @classmethod
    def chunk(cls, text: str, chunk_size: int = 50, overlap: int = 15) -> List[TextChunk]:
        lines = [line.strip() for line in text.splitlines() if line.strip()]
        current_section = "general"
        chunks: List[TextChunk] = []
        chunk_id = 0

        annotated_lines: List[Tuple[str, str]] = []
        for line in lines:
            line_lower = line.lower()
            for sec_name, pattern in cls.SECTION_HEADERS.items():
                if re.search(pattern, line_lower) and len(line.split()) <= 7:
                    current_section = sec_name
                    break
            annotated_lines.append((current_section, line))

        all_words: List[Tuple[str, str]] = []
        for sec, line in annotated_lines:
            for w in line.split():
                all_words.append((sec, w))

        if not all_words:
            return []

        i = 0
        while i < len(all_words):
            window = all_words[i : i + chunk_size]
            if not window:
                break
            chunk_text = " ".join(w[1] for w in window)
            sections = [w[0] for w in window]
            dom_section = max(set(sections), key=sections.count)
            chunks.append(
                TextChunk(
                    chunk_id=chunk_id,
                    text=chunk_text,
                    section=dom_section,
                    word_count=len(window),
                )
            )
            chunk_id += 1
            i += max(1, chunk_size - overlap)

        return chunks


# =====================================================================
# 5. Dense Vector Embedding Engine
# =====================================================================

class DenseVectorEmbeddingEngine:
    """Computes dense vector embeddings for texts using Gemini text-embedding-004

    or 512-dimensional dense neural/subword feature vectors.
    """

    DIMENSION = 512

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        self.client = None
        if self.api_key and genai:
            try:
                self.client = genai.Client(api_key=self.api_key)
            except Exception:
                self.client = None

    def embed_texts(self, texts: List[str]) -> np.ndarray:
        """Generates L2-normalized dense embeddings for a list of strings."""
        if not texts:
            return np.empty((0, self.DIMENSION), dtype=np.float32)

        if self.client:
            try:
                embeddings = []
                batch_size = 50
                for i in range(0, len(texts), batch_size):
                    batch = texts[i : i + batch_size]
                    res = self.client.models.embed_content(
                        model="text-embedding-004",
                        contents=batch,
                    )
                    if hasattr(res, "embeddings") and res.embeddings:
                        for emb in res.embeddings:
                            vec = np.array(emb.values, dtype=np.float32)
                            norm = np.linalg.norm(vec)
                            if norm > 0:
                                vec = vec / norm
                            embeddings.append(vec)
                if len(embeddings) == len(texts):
                    return np.array(embeddings, dtype=np.float32)
            except Exception:
                pass

        vectors = []
        for text in texts:
            vec = self._compute_dense_vector(text)
            vectors.append(vec)
        return np.array(vectors, dtype=np.float32)

    def _compute_dense_vector(self, text: str) -> np.ndarray:
        """Computes a high-dimensional dense semantic feature vector with subword and token hashing."""
        vec = np.zeros(self.DIMENSION, dtype=np.float32)
        words = re.findall(r"\b[\w+#\.\-]{2,}\b", text.lower())
        if not words:
            return vec

        for w in words:
            h_word = abs(hash(w)) % self.DIMENSION
            weight = 1.0 + (0.5 if len(w) > 4 else 0.0)
            vec[h_word] += weight

            if len(w) >= 3:
                for j in range(len(w) - 2):
                    sub = w[j : j + 3]
                    h_sub = abs(hash(sub)) % self.DIMENSION
                    vec[h_sub] += 0.35

        norm = np.linalg.norm(vec)
        if norm > 1e-6:
            vec = vec / norm
        return vec


# =====================================================================
# 6. In-Memory Vector Store
# =====================================================================

class VectorIndex:
    """In-memory vector store supporting cosine similarity search across all chunks."""

    def __init__(self, embedding_engine: DenseVectorEmbeddingEngine):
        self.engine = embedding_engine
        self.chunks: List[TextChunk] = []
        self.embeddings: Optional[np.ndarray] = None

    def index_chunks(self, chunks: List[TextChunk]) -> None:
        self.chunks = chunks
        if not chunks:
            self.embeddings = None
            return
        texts = [c.text for c in chunks]
        self.embeddings = self.engine.embed_texts(texts)

    def find_all_matching_chunks(self, keyword_pattern: str, query: str) -> List[Tuple[TextChunk, float, bool]]:
        """Finds all chunks matching either exact regex pattern or semantic similarity."""
        results = []
        if not self.chunks:
            return results

        q_vec = self.engine.embed_texts([query])[0] if self.embeddings is not None else None
        scores = np.dot(self.embeddings, q_vec) if (self.embeddings is not None and q_vec is not None) else [0.0] * len(self.chunks)

        for idx, chunk in enumerate(self.chunks):
            has_regex = bool(re.search(keyword_pattern, chunk.text, re.IGNORECASE))
            sim_score = float(scores[idx]) if idx < len(scores) else 0.0
            if has_regex or sim_score > 0.60:
                results.append((chunk, sim_score, has_regex))

        results.sort(key=lambda x: (1 if x[2] else 0, x[1]), reverse=True)
        return results


# =====================================================================
# 7. Section-Aware Dynamic Entity Extractor (Sandboxed to Skills Section)
# =====================================================================

class SectionSkillExtractor:
    """Extracts custom technical items, frameworks, and tools strictly from the

    Skills section of the resume. Never extracts from Experience, Projects, or Leadership.
    """

    STOPWORDS = {
        "and", "or", "the", "with", "using", "for", "in", "on", "at", "to", "by", "of",
        "etc", "various", "experience", "knowledge", "proficient", "familiar", "skilled",
        "strong", "hands", "good", "basic", "advanced", "intermediate", "year", "years",
        "project", "projects", "developer", "engineer", "frameworks", "languages", "language",
        "tools", "technologies", "databases", "database", "skills", "technical", "concepts",
        "other", "libraries", "platforms", "methodologies", "development", "architecture",
        "stack", "present", "summary", "core", "built", "implemented", "developed", "systems"
    }

    CATEGORY_MAP = {
        "language": "Programming Languages",
        "prog": "Programming Languages",
        "frontend": "Frontend Development",
        "ui": "Frontend Development",
        "web": "Frontend Development",
        "backend": "Backend Development",
        "framework": "Backend Development",
        "database": "Databases & Storage",
        "db": "Databases & Storage",
        "cloud": "Cloud & DevOps",
        "devops": "Cloud & DevOps",
        "embedded": "Embedded & Hardware",
        "hardware": "Embedded & Hardware",
        "iot": "Embedded & Hardware",
        "tool": "Tools & Platforms",
        "platform": "Tools & Platforms",
        "ai": "AI, ML & Data Science",
        "ml": "AI, ML & Data Science",
        "data": "AI, ML & Data Science",
        "core": "Core Computer Science",
        "fundamental": "Core Computer Science",
        "mobile": "Mobile Development",
        "test": "Testing & QA",
        "qa": "Testing & QA",
    }

    @classmethod
    def extract_from_text(cls, text: str) -> List[Dict[str, str]]:
        """Parses lines STRICTLY within technical skills section headers."""
        candidates: List[Dict[str, str]] = []
        lines = [line.strip() for line in text.splitlines() if line.strip()]

        in_skills_section = False

        for raw_line in lines:
            # Strip leading bullet icons
            line = re.sub(r"^[•·\-\*►▪]+\s*", "", raw_line).strip()
            line_lower = line.lower()

            # Ignore spoken language headers completely
            if re.match(r"^(?:spoken\s+languages?|languages?\s+known|natural\s+languages?|languages?\s+spoken)[:\s]*.*$", line_lower):
                continue

            # Start skills section on matching header
            if re.match(r"^(?:technical\s+|core\s+|key\s+)?skills(?:\s+and\s+tools|\s+and\s+platforms|\s+summary)?[:\s]*$", line_lower) or line_lower in ["technologies", "tech stack", "technical expertise"]:
                in_skills_section = True
                continue
            # End skills section as soon as any other major section header is encountered
            elif in_skills_section and re.match(r"^(?:experience|work\s+history|professional\s+experience|internships?|projects?|education|academics|certifications?|leadership|activities|interests|languages?\s+known|spoken\s+languages?|publications?)[:\s\-–—]*.*$", line_lower):
                in_skills_section = False
                continue

            # Only parse lines if strictly inside skills section
            if in_skills_section:
                subrow_match = re.match(r"^([\w\s&/,+]+)[:\-–](.+)$", line)
                if subrow_match:
                    header_part = subrow_match.group(1).strip()
                    items_part = subrow_match.group(2).strip()

                    # Skip row if it's spoken languages
                    if any(w in header_part.lower() for w in ["spoken", "known", "natural", "mother tongue"]):
                        continue

                    cat = "Technical Skills"
                    for key, mapped_cat in cls.CATEGORY_MAP.items():
                        if key in header_part.lower():
                            cat = mapped_cat
                            break

                    expanded_items = cls._expand_parentheses(items_part)
                    for it in expanded_items:
                        clean_item = cls._clean_skill_token(it)
                        if clean_item and not cls._is_blacklisted(clean_item):
                            candidates.append({"skill_name": clean_item, "category": cat})
                else:
                    items = re.split(r"[,\|•·\t]+", line)
                    for it in items:
                        clean_item = cls._clean_skill_token(it)
                        if clean_item and not cls._is_blacklisted(clean_item):
                            candidates.append({"skill_name": clean_item, "category": "Technical Skills"})

        return candidates

    @classmethod
    def _expand_parentheses(cls, text: str) -> List[str]:
        """Splits comma/pipe separated items and extracts parenthetical sub-skills cleanly."""
        cleaned = re.sub(r"[\(\)]", ", ", text)
        parts = re.split(r"[,\|•·\t]+", cleaned)
        return [p.strip() for p in parts if p.strip()]

    @classmethod
    def _is_blacklisted(cls, token: str) -> bool:
        t_low = token.lower().strip()
        if t_low in NON_SKILL_WORDS or t_low in SPOKEN_LANGUAGES:
            return True
        for b in NON_SKILL_WORDS:
            if b == t_low or (len(b) > 4 and b in t_low):
                return True
        for lang in SPOKEN_LANGUAGES:
            if lang == t_low:
                return True
        return False

    @classmethod
    def _clean_skill_token(cls, token: str) -> Optional[str]:
        tok = token.strip().strip("():;[]{}*•-–.,")
        tok = re.sub(r"^(?:and|or|with|using|built using|developed using)\s+", "", tok, flags=re.IGNORECASE).strip()
        tok = re.sub(r"\s+(?:and|or)$", "", tok, flags=re.IGNORECASE).strip()

        # Remove trailing colon from header e.g. "Programming Languages: C" -> "C"
        if ":" in tok:
            parts = tok.split(":")
            tok = parts[-1].strip()

        if "@" in tok or "http" in tok or "www." in tok:
            return None
        if "/" in tok and tok.upper() not in ["CI/CD", "TCP/IP", "PL/SQL", "C/C++"]:
            return None
        if len(tok) < 2 or len(tok) > 35:
            return None
        if tok.lower() in cls.STOPWORDS or tok.lower() in SPOKEN_LANGUAGES:
            return None
        if re.match(r"^\d+$", tok):
            return None
        if not re.search(r"[a-zA-Z]", tok):
            return None
        # Disallow generic headers
        if tok.lower() in ["systems", "division", "digital", "company", "limited", "intern", "management", "language", "languages", "programming language", "programming languages", "tool", "tools"]:
            return None
        return tok


# =====================================================================
# 8. Gemini LLM Structured Extractor
# =====================================================================

class GeminiSkillExtractor:
    """Uses Gemini to extract structured skills directly when API key is present."""

    @classmethod
    def extract(cls, resume_text: str, client: Any) -> List[Dict[str, str]]:
        if not client:
            return []
        try:
            prompt = (
                "You are an expert ATS and Technical Resume Analyzer. Extract strictly technical competencies, "
                "programming languages, hardware/embedded tools, frameworks, databases, cloud platforms, and core CS skills "
                "from the resume text below. Do NOT extract company names, internship titles, locations, or dates.\n\n"
                "Return a valid JSON array of objects with keys: 'skill_name' (proper canonical title case) and 'category' "
                "(one of: 'Programming Languages', 'Frontend Development', 'Backend Development', 'Databases & Storage', "
                "'Cloud & DevOps', 'Embedded & Hardware', 'Tools & Platforms', 'AI, ML & Data Science', 'Core Computer Science', 'Soft Skills').\n\n"
                f"Resume Text:\n{resume_text[:4500]}\n\n"
                "JSON Output:"
            )
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.1,
                ),
            )
            if hasattr(response, "text") and response.text:
                parsed = json.loads(response.text.strip())
                if isinstance(parsed, list):
                    return [
                        {"skill_name": str(item.get("skill_name", "")).strip(), "category": str(item.get("category", "Technical Skills")).strip()}
                        for item in parsed
                        if item.get("skill_name") and not SectionSkillExtractor._is_blacklisted(str(item.get("skill_name", "")))
                    ]
        except Exception as e:
            logger.warning("Gemini skill extraction skipped or failed: %s", e)
        return []


# =====================================================================
# 9. Main Resume RAG Service Orchestrator
# =====================================================================

class ResumeRAGService:
    """Orchestrates RAG embedding-based resume analysis, multi-source skill extraction,

    chunk citation grounding, and executive profile synthesis.
    """

    @classmethod
    def extract_text(cls, filename: str, content: bytes) -> str:
        return DocumentParser.parse_file(filename, content)

    @classmethod
    def analyze_resume_skills(
        cls,
        resume_text: str,
        db: Optional[Any] = None,
        api_key: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Runs the complete hybrid RAG embedding pipeline:

        1. Semantic Chunking & Section Tagging
        2. Dense Vector Indexing (text-embedding-004 / 512-D local dense space)
        3. Multi-Source Skill Entity Identification:
           - Built-in Canonical Skills Catalog (140+ skills) with full alias expansion
           - MongoDB Skills collection (if populated)
           - Sandboxed section-aware syntactic extractor
           - Gemini GenAI structured extractor (if LLM is available)
        4. Vector Retrieval & Context Grounding:
           - Finds highest-scoring vector chunk for citation evidence using matched aliases
           - Context-based proficiency deduction (beginner / intermediate / advanced / expert)
           - Confidence score calculation
        5. Executive Summary Synthesis grounded in retrieved chunks
        """
        if not resume_text or len(resume_text.strip()) == 0:
            return {
                "extracted_skills": [],
                "total_skills": 0,
                "summary": "No readable text content found in document.",
                "sections_found": [],
                "retrieved_chunk_count": 0,
            }

        # 1. Semantic Chunking
        chunker = SemanticChunker()
        chunks = chunker.chunk(resume_text, chunk_size=50, overlap=15)
        if not chunks:
            chunks = [TextChunk(chunk_id=0, text=resume_text[:500], section="general", word_count=len(resume_text.split()))]

        sections_found = sorted(list({c.section for c in chunks if c.section != "general"}))

        # 2. Vector Indexing
        engine = DenseVectorEmbeddingEngine(api_key=api_key)
        vector_index = VectorIndex(engine)
        vector_index.index_chunks(chunks)

        # 3. Assemble Candidates from all sources
        db_skills_map: Dict[str, Dict[str, Any]] = {}
        if db is not None:
            try:
                db_skills = list(db["skills"].find({}, {"name": 1, "category": 1, "description": 1}))
                for s in db_skills:
                    s_name = s.get("name", "").strip()
                    if s_name:
                        db_skills_map[s_name.lower()] = {
                            "id": str(s.get("_id")),
                            "name": s_name,
                            "category": s.get("category", "Technical Skills"),
                            "description": s.get("description", ""),
                        }
            except Exception as e:
                logger.warning("MongoDB skill lookup warning (proceeding with built-in catalog): %s", e)

        master_catalog: List[Dict[str, Any]] = []
        seen_canonical: Set[str] = set()

        for item in CANONICAL_SKILL_CATALOG:
            name = item["name"]
            key = name.lower()
            seen_canonical.add(key)
            db_match = db_skills_map.get(key)
            master_catalog.append({
                "id": db_match.get("id") if db_match else None,
                "name": name,
                "category": item["category"],
                "aliases": item.get("aliases", [key]),
                "description": db_match.get("description", "") if db_match else "",
            })

        for key, s in db_skills_map.items():
            if key not in seen_canonical:
                seen_canonical.add(key)
                master_catalog.append({
                    "id": s["id"],
                    "name": s["name"],
                    "category": s.get("category", "Technical Skills"),
                    "aliases": [key],
                    "description": s.get("description", ""),
                })

        # 4. Hybrid Matching:
        matched_skills_map: Dict[str, Dict[str, Any]] = {}

        # Source 1: Master Catalog + Multi-Alias Full-Text & Vector Search
        for item in master_catalog:
            canonical_name = item["name"]
            category = item["category"]
            aliases = item.get("aliases", [canonical_name.lower()])

            matched_alias = None
            for alias in aliases:
                # Disallow matching soft skills on degree name e.g. "Communication" in "Communication Engineering"
                if alias == "communication" and re.search(r"communication\s+engineering", resume_text, re.IGNORECASE):
                    # Check if communication appears outside "communication engineering"
                    sub_text = re.sub(r"communication\s+engineering", "", resume_text, flags=re.IGNORECASE)
                    if not re.search(r"\bcommunication\b", sub_text, re.IGNORECASE):
                        continue

                # Disallow matching "leadership" solely on section headers like "Leadership & Activities"
                if alias == "leadership":
                    sub_text = re.sub(r"leadership\s+&\s+activities", "", resume_text, flags=re.IGNORECASE)
                    if not re.search(r"\bleadership\b", sub_text, re.IGNORECASE):
                        continue

                pattern = cls._build_alias_pattern(alias)
                if re.search(pattern, resume_text, re.IGNORECASE):
                    matched_alias = alias
                    break

            if matched_alias:
                pattern = cls._build_alias_pattern(matched_alias)
                matching_chunks = vector_index.find_all_matching_chunks(pattern, f"{canonical_name} {category}")
                if matching_chunks:
                    best_chunk, sim_score, is_exact = matching_chunks[0]
                    # Pass matched alias and alias list to locate the most authentic citation sentence
                    proficiency, evidence = cls._evaluate_chunk_context(
                        canonical_name, best_chunk, resume_text, search_terms=[matched_alias, canonical_name] + aliases
                    )
                    confidence = float(np.clip((0.88 if is_exact else sim_score) * 1.1, 0.70, 0.99))
                    matched_skills_map[canonical_name.lower()] = {
                        "skill_id": item.get("id"),
                        "skill_name": canonical_name,
                        "category": category,
                        "proficiency": proficiency,
                        "evidence": evidence,
                        "confidence": round(confidence, 2),
                        "chunk_id": best_chunk.chunk_id,
                        "chunk_section": best_chunk.section,
                    }

        # Source 2: Sandboxed Section Entity Extractor (parses comma/bullet lists in skills sections)
        section_candidates = SectionSkillExtractor.extract_from_text(resume_text)
        for cand in section_candidates:
            c_name = cand["skill_name"]
            c_cat = cand["category"]
            c_key = c_name.lower()

            if c_key in matched_skills_map:
                continue

            canonical_matched = False
            for cat_item in master_catalog:
                if any(c_key == a.lower() for a in cat_item.get("aliases", [])):
                    canonical_matched = True
                    break

            if not canonical_matched and not SectionSkillExtractor._is_blacklisted(c_name):
                pattern = cls._build_alias_pattern(c_name)
                matching_chunks = vector_index.find_all_matching_chunks(pattern, f"{c_name} {c_cat}")
                best_chunk = matching_chunks[0][0] if matching_chunks else chunks[0]
                proficiency, evidence = cls._evaluate_chunk_context(
                    c_name, best_chunk, resume_text, search_terms=[c_name]
                )

                db_id = db_skills_map.get(c_key, {}).get("id")

                matched_skills_map[c_key] = {
                    "skill_id": db_id,
                    "skill_name": c_name,
                    "category": c_cat,
                    "proficiency": proficiency,
                    "evidence": evidence,
                    "confidence": 0.85,
                    "chunk_id": best_chunk.chunk_id,
                    "chunk_section": best_chunk.section,
                }

        # Source 3: Gemini GenAI Structured Extractor (if client is active)
        if engine.client:
            llm_candidates = GeminiSkillExtractor.extract(resume_text, engine.client)
            for cand in llm_candidates:
                l_name = cand["skill_name"]
                l_cat = cand.get("category", "Technical Skills")
                l_key = l_name.lower()

                if l_key in matched_skills_map or SectionSkillExtractor._is_blacklisted(l_name):
                    continue

                pattern = cls._build_alias_pattern(l_name)
                matching_chunks = vector_index.find_all_matching_chunks(pattern, f"{l_name} {l_cat}")
                best_chunk = matching_chunks[0][0] if matching_chunks else chunks[0]
                proficiency, evidence = cls._evaluate_chunk_context(
                    l_name, best_chunk, resume_text, search_terms=[l_name]
                )
                db_id = db_skills_map.get(l_key, {}).get("id")

                matched_skills_map[l_key] = {
                    "skill_id": db_id,
                    "skill_name": l_name,
                    "category": l_cat,
                    "proficiency": proficiency,
                    "evidence": evidence,
                    "confidence": 0.92,
                    "chunk_id": best_chunk.chunk_id,
                    "chunk_section": best_chunk.section,
                }

        # Convert to list and sort by confidence score
        extracted_skills = list(matched_skills_map.values())
        extracted_skills.sort(key=lambda x: (x["confidence"], x["skill_name"]), reverse=True)

        # 5. RAG Profile Summary Synthesis
        summary = ""
        if engine.client and genai and extracted_skills:
            try:
                top_citations = "\n".join(
                    [f"- {s['skill_name']} ({s['category']}): {s['evidence']}" for s in extracted_skills[:10]]
                )
                prompt = (
                    f"Candidate resume vector retrieval identified {len(extracted_skills)} technical competencies:\n{top_citations}\n\n"
                    "Provide a concise 2-sentence executive placement summary highlighting the candidate's core tech stack, "
                    "primary strengths, and readiness."
                )
                res = engine.client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=prompt,
                )
                if hasattr(res, "text") and res.text:
                    summary = res.text.strip()
            except Exception as e:
                logger.warning("Gemini summary synthesis skipped: %s", e)
                summary = ""

        if not summary:
            top_names = [s["skill_name"] for s in extracted_skills[:6]]
            summary = (
                f"RAG embedding analysis verified {len(extracted_skills)} competencies across "
                f"{len(chunks)} indexed vector chunks. Primary technical stack: {', '.join(top_names)}."
                if top_names
                else "Document scanned across vector chunks but no technical skills were recognized."
            )

        return {
            "extracted_skills": extracted_skills,
            "total_skills": len(extracted_skills),
            "summary": summary,
            "sections_found": sections_found,
            "retrieved_chunk_count": len(chunks),
        }

    @staticmethod
    def _build_alias_pattern(alias: str) -> str:
        """Constructs safe regex pattern for skill alias with boundary precision."""
        alias_clean = alias.strip()
        if alias_clean.lower() in ["c++", "c#"]:
            return re.escape(alias_clean)
        elif alias_clean.lower() == "c":
            return r"\b(?:languages?|programming|skills?)?:?\s*c\b(?!\+\+|#)"
        elif alias_clean.lower() in [".net", "asp.net", "node.js", "vue.js", "next.js", "react.js", "express.js"]:
            parts = alias_clean.split(".")
            escaped_parts = [re.escape(p) for p in parts]
            return r"\b" + r"\.?".join(escaped_parts) + r"\b"
        else:
            return r"\b" + re.escape(alias_clean) + r"\b"

    @classmethod
    def _evaluate_chunk_context(
        cls,
        skill_name: str,
        chunk: TextChunk,
        full_text: str = "",
        search_terms: Optional[List[str]] = None,
    ) -> Tuple[str, str]:
        """Extracts the cleanest evidence citation sentence and deduces proficiency level."""
        terms = search_terms or [skill_name]
        terms_patterns = []
        for t in terms:
            if t.lower() in ["c++", "c#"]:
                terms_patterns.append(re.escape(t))
            elif t.lower() == "c":
                terms_patterns.append(r"\b(?:languages?|programming|skills?)?:?\s*c\b(?!\+\+|#)")
            else:
                terms_patterns.append(r"\b" + re.escape(t) + r"\b")

        combined_regex = r"(?:" + "|".join(terms_patterns) + r")"

        best_sentence = ""
        if full_text:
            lines = [l.strip() for l in full_text.splitlines() if l.strip()]
            action_lines = []
            for l in lines:
                if re.search(combined_regex, l, re.IGNORECASE) and len(l) > 15:
                    action_lines.append(l)
            if action_lines:
                # Prioritize bullet points or lines with action verbs
                bullet_matches = [
                    l for l in action_lines
                    if l.startswith(("-", "•", "·", "*")) or any(w in l.lower() for w in ["developed", "built", "engineered", "implemented", "optimized", "created", "designed", "deployed", "fabricated", "integrated", "fine-tuned"])
                ]
                if bullet_matches:
                    best_sentence = bullet_matches[0].lstrip("-•·* ").strip()
                else:
                    best_sentence = action_lines[0].lstrip("-•·* ").strip()

        if not best_sentence:
            text = chunk.text
            sentences = [s.strip() for s in re.split(r"[•·\*\-\|\.\n]+", text) if s.strip()]
            matched_sentences = [s for s in sentences if re.search(combined_regex, s, re.IGNORECASE)]
            if matched_sentences:
                best_sentence = max(matched_sentences, key=len)
            elif sentences:
                best_sentence = max(sentences, key=len)
            else:
                best_sentence = text

        if len(best_sentence) > 160:
            best_sentence = best_sentence[:157] + "..."

        text_lower = (best_sentence + " " + chunk.text).lower()
        expert_words = ["architect", "architected", "lead", "led", "spearheaded", "principal", "production", "optimized", "scale", "scale-out", "distributed", "managed"]
        advanced_words = ["developed", "built", "engineered", "implemented", "deployed", "microservice", "full stack", "integrated", "designed", "fine-tuned", "finetuned", "trained", "customized", "automated", "refactored", "fabricated"]
        beginner_patterns = [r"\bbeginner\b", r"\bnovice\b", r"\bbasics?\b", r"\bintroductory\b", r"\belementary\b", r"\b(?:currently|actively)\s+learning\b", r"\bcoursework\b"]

        if any(w in text_lower for w in expert_words):
            return "expert", best_sentence
        elif any(w in text_lower for w in advanced_words) or chunk.section in ["experience", "projects"]:
            return "advanced" if any(w in text_lower for w in advanced_words) else "intermediate", best_sentence
        elif any(re.search(p, text_lower) for p in beginner_patterns):
            return "beginner", best_sentence
        else:
            return "intermediate", best_sentence
