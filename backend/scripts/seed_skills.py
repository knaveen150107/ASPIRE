"""Seeds standard canonical skills into MongoDB Atlas for ASPIRE."""

import os
import sys
from datetime import datetime

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_ROOT = os.path.dirname(SCRIPT_DIR)
if BACKEND_ROOT not in sys.path:
    sys.path.insert(0, BACKEND_ROOT)

from app.db.connection import get_db

CANONICAL_SKILLS = [
    # Programming Languages
    {"name": "Python", "category": "Programming Languages", "description": "High-level general-purpose language for backend, AI, and data science."},
    {"name": "Java", "category": "Programming Languages", "description": "Enterprise-grade object-oriented language for high-performance backends."},
    {"name": "C++", "category": "Programming Languages", "description": "High-performance systems programming language for algorithms and competitive coding."},
    {"name": "C", "category": "Programming Languages", "description": "Foundational low-level systems programming language."},
    {"name": "C#", "category": "Programming Languages", "description": "Modern multi-paradigm language for .NET framework and gaming."},
    {"name": "JavaScript", "category": "Programming Languages", "description": "Standard scripting language for modern web browsers and server runtimes."},
    {"name": "TypeScript", "category": "Programming Languages", "description": "Typed superset of JavaScript providing static typing and modern syntax."},
    {"name": "Go", "category": "Programming Languages", "description": "Fast, statically typed compiled language designed for concurrency and cloud services."},
    {"name": "Rust", "category": "Programming Languages", "description": "Memory-safe systems programming language with zero-cost abstractions."},
    {"name": "SQL", "category": "Programming Languages", "description": "Standard declarative language for relational database queries and transactions."},

    # Frontend Development
    {"name": "React", "category": "Frontend Development", "description": "Declarative component-based library for building reactive user interfaces."},
    {"name": "Next.js", "category": "Frontend Development", "description": "Production-grade React framework for hybrid static and server rendering."},
    {"name": "Vue.js", "category": "Frontend Development", "description": "Progressive JavaScript framework for user interface development."},
    {"name": "Angular", "category": "Frontend Development", "description": "Comprehensive enterprise TypeScript web application platform."},
    {"name": "HTML5", "category": "Frontend Development", "description": "Standard semantic markup language for modern web documents."},
    {"name": "CSS3", "category": "Frontend Development", "description": "Style sheet language for responsive layouts, animations, and typography."},
    {"name": "Tailwind CSS", "category": "Frontend Development", "description": "Utility-first CSS framework for rapid UI styling."},
    {"name": "Redux", "category": "Frontend Development", "description": "Predictable centralized state management container for JavaScript applications."},

    # Backend Development
    {"name": "Node.js", "category": "Backend Development", "description": "Asynchronous event-driven JavaScript server runtime."},
    {"name": "Express.js", "category": "Backend Development", "description": "Minimalist web framework for Node.js RESTful API backends."},
    {"name": "FastAPI", "category": "Backend Development", "description": "Modern, high-performance Python web framework for asynchronous APIs and OpenAPI schemas."},
    {"name": "Django", "category": "Backend Development", "description": "Batteries-included Python web framework for robust full-stack applications."},
    {"name": "Flask", "category": "Backend Development", "description": "Lightweight WSGI Python microframework."},
    {"name": "Spring Boot", "category": "Backend Development", "description": "Production-ready enterprise Java framework for microservices."},
    {"name": "REST APIs", "category": "Backend Development", "description": "Architectural style for designing networked web service APIs."},
    {"name": "GraphQL", "category": "Backend Development", "description": "Query language and runtime for declarative API data fetching."},

    # Databases & Storage
    {"name": "MongoDB", "category": "Databases & Storage", "description": "NoSQL document database designed for scalability and flexible JSON schemas."},
    {"name": "PostgreSQL", "category": "Databases & Storage", "description": "Advanced open-source relational database supporting ACID and JSONB."},
    {"name": "MySQL", "category": "Databases & Storage", "description": "Widely used relational database management system for web services."},
    {"name": "Redis", "category": "Databases & Storage", "description": "In-memory key-value data structure store used for caching and messaging queues."},
    {"name": "Elasticsearch", "category": "Databases & Storage", "description": "Distributed search and analytics engine for full-text indexing."},

    # Cloud & DevOps
    {"name": "AWS", "category": "Cloud & DevOps", "description": "Amazon Web Services comprehensive cloud computing platform."},
    {"name": "Google Cloud (GCP)", "category": "Cloud & DevOps", "description": "Google Cloud suite of scalable infrastructure, storage, and AI services."},
    {"name": "Microsoft Azure", "category": "Cloud & DevOps", "description": "Cloud computing platform by Microsoft for building, testing, and deploying apps."},
    {"name": "Docker", "category": "Cloud & DevOps", "description": "Containerization platform to package applications with dependencies."},
    {"name": "Kubernetes", "category": "Cloud & DevOps", "description": "Automated open-source container orchestration and deployment platform."},
    {"name": "Git", "category": "Cloud & DevOps", "description": "Distributed version control system for source code tracking and collaboration."},
    {"name": "CI/CD", "category": "Cloud & DevOps", "description": "Continuous Integration and Continuous Deployment automated pipelines."},
    {"name": "Linux", "category": "Cloud & DevOps", "description": "Open-source Unix-like OS, bash scripting, and server system administration."},

    # AI, ML & Data Science
    {"name": "Machine Learning", "category": "AI, ML & Data Science", "description": "Statistical modeling, supervised and unsupervised learning algorithms."},
    {"name": "Deep Learning", "category": "AI, ML & Data Science", "description": "Multi-layer neural network architectures for vision, NLP, and tabular data."},
    {"name": "PyTorch", "category": "AI, ML & Data Science", "description": "Tensors and dynamic computation graphs for deep learning research and deployment."},
    {"name": "TensorFlow", "category": "AI, ML & Data Science", "description": "End-to-end open source platform for machine learning pipelines."},
    {"name": "Scikit-Learn", "category": "AI, ML & Data Science", "description": "Python library for predictive data analysis and classic ML estimators."},
    {"name": "Pandas", "category": "AI, ML & Data Science", "description": "High-performance data manipulation and analysis library for Python."},
    {"name": "NumPy", "category": "AI, ML & Data Science", "description": "Fundamental package for scientific computing with multi-dimensional arrays."},
    {"name": "Natural Language Processing (NLP)", "category": "AI, ML & Data Science", "description": "Text processing, tokenization, transformers, and embeddings."},
    {"name": "Computer Vision", "category": "AI, ML & Data Science", "description": "Image classification, object detection, and OpenCV processing."},
    {"name": "Generative AI & LLMs", "category": "AI, ML & Data Science", "description": "Prompt engineering, Large Language Models, embeddings, and fine-tuning."},
    {"name": "RAG (Retrieval-Augmented Generation)", "category": "AI, ML & Data Science", "description": "Grounding LLM generation with vector search and knowledge retrieval."},

    # Core Computer Science
    {"name": "Data Structures & Algorithms", "category": "Core Computer Science", "description": "Trees, graphs, dynamic programming, sorting, and algorithmic complexity."},
    {"name": "Object-Oriented Programming (OOP)", "category": "Core Computer Science", "description": "Encapsulation, inheritance, polymorphism, and modular software design."},
    {"name": "System Design", "category": "Core Computer Science", "description": "Scalable distributed system architectures, load balancers, and caching layers."},
    {"name": "Database Management Systems (DBMS)", "category": "Core Computer Science", "description": "Relational algebra, normalization, indexing, and transaction isolation."},
    {"name": "Computer Networks", "category": "Core Computer Science", "description": "TCP/IP, HTTP/HTTPS, DNS, sockets, and OSI network architecture."},
    {"name": "Operating Systems", "category": "Core Computer Science", "description": "Process scheduling, multithreading, concurrency, memory management."},

    # Soft Skills
    {"name": "Problem Solving", "category": "Soft Skills", "description": "Analytical problem breakdown and creative technical solution design."},
    {"name": "Communication", "category": "Soft Skills", "description": "Clear technical and interpersonal articulation in engineering discussions."},
    {"name": "Team Collaboration", "category": "Soft Skills", "description": "Cross-functional teamwork, code reviews, and Agile sprint execution."}
]


def seed_skills():
    db = get_db()
    print("Seeding canonical skills ontology into MongoDB...")
    now = datetime.now()
    count = 0
    for sk in CANONICAL_SKILLS:
        result = db["skills"].update_one(
            {"name": {"$regex": f"^{sk['name']}$", "$options": "i"}},
            {
                "$set": {
                    "name": sk["name"],
                    "category": sk["category"],
                    "description": sk["description"],
                },
                "$setOnInsert": {
                    "created_at": now,
                }
            },
            upsert=True
        )
        if result.upserted_id or result.modified_count:
            count += 1

    total = db["skills"].count_documents({})
    print(f"Successfully synced skills! Total canonical skills in database: {total}")


if __name__ == "__main__":
    seed_skills()
