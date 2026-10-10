"""Seed Tier-1 Campus Placement Drives & Companies into ASPIRE Database."""

import os
import sys
from datetime import datetime, timedelta
from bson import ObjectId
from pymongo import MongoClient

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_ROOT = os.path.dirname(SCRIPT_DIR)
if BACKEND_ROOT not in sys.path:
    sys.path.insert(0, BACKEND_ROOT)

from app.core.config import settings

def seed_companies_and_jobs():
    print("Connecting to MongoDB Atlas...")
    client = MongoClient(settings.MONGODB_URI)
    db = client[settings.MONGODB_DATABASE]

    # Find or create a system recruiter
    recruiter = db["users"].find_one({"role": "recruiter"})
    if not recruiter:
        recruiter_id = ObjectId()
        db["users"].insert_one({
            "_id": recruiter_id,
            "email": "campus-recruiter@aspire.edu",
            "full_name": "University Campus Recruitment Hub",
            "hashed_password": "hashed_secret_recruiter_2026",
            "role": "recruiter",
            "is_active": True,
            "created_at": datetime.now(),
            "updated_at": datetime.now(),
        })
    else:
        recruiter_id = recruiter["_id"]

    now = datetime.now()
    deadline = now + timedelta(days=45)

    companies_data = [
        {
            "name": "Google",
            "website": "https://careers.google.com",
            "industry": "Software & Internet Services",
            "description": "Global technology leader in search, cloud systems, artificial intelligence, and operating systems.",
            "recruiter_id": recruiter_id,
            "created_at": now,
            "updated_at": now,
        },
        {
            "name": "Microsoft",
            "website": "https://careers.microsoft.com",
            "industry": "Enterprise Software & Cloud",
            "description": "Empowering every person and organization on the planet to achieve more through Azure and AI.",
            "recruiter_id": recruiter_id,
            "created_at": now,
            "updated_at": now,
        },
        {
            "name": "Amazon",
            "website": "https://amazon.jobs",
            "industry": "E-Commerce & Cloud Computing",
            "description": "Pioneering customer-centric technologies, AWS cloud infrastructure, and large scale logistics systems.",
            "recruiter_id": recruiter_id,
            "created_at": now,
            "updated_at": now,
        },
        {
            "name": "Netflix",
            "website": "https://jobs.netflix.com",
            "industry": "Entertainment & Distributed Systems",
            "description": "World leading streaming entertainment service with ultra-scalable distributed microservice architectures.",
            "recruiter_id": recruiter_id,
            "created_at": now,
            "updated_at": now,
        },
        {
            "name": "Meta",
            "website": "https://metacareers.com",
            "industry": "Social Technology & AI",
            "description": "Building the future of human connection, open-source LLaMA models, and immersive experiences.",
            "recruiter_id": recruiter_id,
            "created_at": now,
            "updated_at": now,
        },
        {
            "name": "Adobe",
            "website": "https://careers.adobe.com",
            "industry": "Creative & Cloud Digital Media",
            "description": "Changing the world through digital experiences, Firefly generative models, and document cloud tech.",
            "recruiter_id": recruiter_id,
            "created_at": now,
            "updated_at": now,
        },
        {
            "name": "Goldman Sachs",
            "website": "https://goldmansachs.com/careers",
            "industry": "Financial Technology & Trading",
            "description": "Leading global financial institution developing low-latency trading architectures and financial ML models.",
            "recruiter_id": recruiter_id,
            "created_at": now,
            "updated_at": now,
        },
        {
            "name": "Uber",
            "website": "https://uber.com/careers",
            "industry": "Mobility & Real-time Systems",
            "description": "Real-time dispatch, routing algorithms, distributed geospatial systems, and autonomous robotics.",
            "recruiter_id": recruiter_id,
            "created_at": now,
            "updated_at": now,
        }
    ]

    company_map = {}
    for comp in companies_data:
        existing = db["companies"].find_one({"name": comp["name"]})
        if existing:
            company_map[comp["name"]] = existing["_id"]
        else:
            comp_id = db["companies"].insert_one(comp).inserted_id
            company_map[comp["name"]] = comp_id

    jobs_data = [
        {
            "company_id": company_map["Google"],
            "title": "Software Development Engineer (SWE) — Campus Drive 2026",
            "description": "Join Google Core Engineering to architect distributed backend microservices, high-throughput data processing pipelines, and AI-first consumer interfaces. You will collaborate directly with world-class engineering teams to solve hard computer science problems at planetary scale.",
            "location": "Bangalore / Hyderabad / Hybrid",
            "employment_type": "full_time",
            "min_cgpa": 8.0,
            "eligible_departments": ["Computer Science and Engineering", "Information Technology", "Artificial Intelligence & Machine Learning", "Electronics and Communication"],
            "eligible_degrees": ["B.Tech", "B.E.", "M.Tech", "MCA"],
            "graduation_years": [2025, 2026, 2027],
            "required_skills": ["Data Structures & Algorithms", "Python", "C++", "System Design", "Distributed Systems"],
            "preferred_skills": ["Kubernetes", "gRPC", "Golang", "Cloud Computing"],
            "package_details": "₹32 LPA - ₹48 LPA (Base + Stocks + Sign-on)",
            "application_url": "https://careers.google.com/students",
            "deadline": deadline,
            "status": "published",
            "source_name": "Campus Placement Drive",
            "created_at": now,
            "updated_at": now,
        },
        {
            "company_id": company_map["Microsoft"],
            "title": "Cloud & AI Software Engineer",
            "description": "Build high-availability cloud platforms and generative AI services on Azure. You will develop resilient RESTful and event-driven architectures with strict low-latency requirements.",
            "location": "Hyderabad / Bangalore / Noida",
            "employment_type": "full_time",
            "min_cgpa": 7.5,
            "eligible_departments": ["Computer Science and Engineering", "Information Technology", "AI and Data Science", "Electrical and Electronics"],
            "eligible_degrees": ["B.Tech", "B.E.", "M.Tech"],
            "graduation_years": [2025, 2026, 2027],
            "required_skills": ["Python", "FastAPI", "C# / .NET", "Azure Cloud", "Data Structures"],
            "preferred_skills": ["Docker", "PostgreSQL", "CI/CD", "PyTorch"],
            "package_details": "₹28 LPA - ₹42 LPA",
            "application_url": "https://careers.microsoft.com/students",
            "deadline": deadline,
            "status": "published",
            "source_name": "Campus Placement Drive",
            "created_at": now,
            "updated_at": now,
        },
        {
            "company_id": company_map["Amazon"],
            "title": "Software Development Engineer I (SDE-1)",
            "description": "Amazon is hiring graduating engineers to build resilient, distributed fulfillment and AWS services. Candidates will design clean object-oriented systems and write high-efficiency code in Java or Python.",
            "location": "Chennai / Bangalore / Hyderabad",
            "employment_type": "full_time",
            "min_cgpa": 7.0,
            "eligible_departments": ["Computer Science and Engineering", "Information Technology", "Electronics and Communication"],
            "eligible_degrees": ["B.Tech", "B.E.", "MCA"],
            "graduation_years": [2025, 2026, 2027],
            "required_skills": ["Java / Python", "Data Structures & Algorithms", "Object-Oriented Design", "AWS", "SQL"],
            "preferred_skills": ["DynamoDB", "Microservices", "Unit Testing"],
            "package_details": "₹30 LPA - ₹44 LPA",
            "application_url": "https://amazon.jobs/university",
            "deadline": deadline,
            "status": "published",
            "source_name": "Campus Placement Drive",
            "created_at": now,
            "updated_at": now,
        },
        {
            "company_id": company_map["Netflix"],
            "title": "Full Stack Platform Engineer",
            "description": "Design ultra-responsive web applications, reactive user interfaces in React.js, and fault-tolerant microservices for millions of concurrent global viewers.",
            "location": "Mumbai / Remote",
            "employment_type": "full_time",
            "min_cgpa": 7.5,
            "eligible_departments": ["Computer Science and Engineering", "Information Technology"],
            "eligible_degrees": ["B.Tech", "B.E.", "M.Tech", "MCA"],
            "graduation_years": [2025, 2026, 2027],
            "required_skills": ["React.js", "Node.js", "MongoDB", "JavaScript / TypeScript", "GraphQL"],
            "preferred_skills": ["Redis", "AWS", "Docker", "Tailwind CSS"],
            "package_details": "₹35 LPA - ₹52 LPA",
            "application_url": "https://jobs.netflix.com",
            "deadline": deadline,
            "status": "published",
            "source_name": "Campus Placement Drive",
            "created_at": now,
            "updated_at": now,
        },
        {
            "company_id": company_map["Meta"],
            "title": "Machine Learning & AI Infrastructure Specialist",
            "description": "Scale open-source foundational AI models and high-throughput inference backends. Implement PyTorch models, vector retrieval indexes, and GPU clustering pipelines.",
            "location": "Bangalore / Hybrid",
            "employment_type": "full_time",
            "min_cgpa": 8.5,
            "eligible_departments": ["Computer Science and Engineering", "Artificial Intelligence & Data Science", "Information Technology"],
            "eligible_degrees": ["B.Tech", "B.E.", "M.Tech"],
            "graduation_years": [2025, 2026, 2027],
            "required_skills": ["PyTorch", "Python", "RAG & LLM Architectures", "CUDA / C++", "Vector Databases"],
            "preferred_skills": ["Triton", "FastAPI", "Ray", "Distributed Training"],
            "package_details": "₹38 LPA - ₹55 LPA",
            "application_url": "https://metacareers.com",
            "deadline": deadline,
            "status": "published",
            "source_name": "Campus Placement Drive",
            "created_at": now,
            "updated_at": now,
        },
        {
            "company_id": company_map["Adobe"],
            "title": "Creative Cloud & Full Stack Engineer",
            "description": "Engineer interactive web-based creative workflows using WebAssembly, Canvas API, React, and modern microservice backends.",
            "location": "Noida / Bangalore",
            "employment_type": "full_time",
            "min_cgpa": 7.5,
            "eligible_departments": ["Computer Science and Engineering", "Information Technology", "MCA"],
            "eligible_degrees": ["B.Tech", "B.E.", "MCA"],
            "graduation_years": [2025, 2026, 2027],
            "required_skills": ["JavaScript / TypeScript", "React.js", "Python", "REST APIs", "SQL"],
            "preferred_skills": ["WebGL", "Docker", "Figma API"],
            "package_details": "₹24 LPA - ₹36 LPA",
            "application_url": "https://careers.adobe.com",
            "deadline": deadline,
            "status": "published",
            "source_name": "Campus Placement Drive",
            "created_at": now,
            "updated_at": now,
        },
        {
            "company_id": company_map["Goldman Sachs"],
            "title": "Quantitative & Financial Technology Analyst",
            "description": "Develop high-throughput algorithmic risk platforms, financial simulation engines, and distributed database services.",
            "location": "Bangalore / Hyderabad",
            "employment_type": "full_time",
            "min_cgpa": 8.0,
            "eligible_departments": ["Computer Science and Engineering", "Information Technology", "Electronics", "Mathematics & Computing"],
            "eligible_degrees": ["B.Tech", "B.E.", "M.Tech"],
            "graduation_years": [2025, 2026, 2027],
            "required_skills": ["C++ / Java", "Python", "Data Structures", "PostgreSQL / MongoDB", "Probability & Statistics"],
            "preferred_skills": ["Time-Series Databases", "Kafka", "Linux Internals"],
            "package_details": "₹32 LPA - ₹46 LPA",
            "application_url": "https://goldmansachs.com/careers",
            "deadline": deadline,
            "status": "published",
            "source_name": "Campus Placement Drive",
            "created_at": now,
            "updated_at": now,
        },
        {
            "company_id": company_map["Uber"],
            "title": "Backend Distributed Systems Engineer",
            "description": "Build high-concurrency microservices processing millions of geospatial ride requests per second with high availability and automated failovers.",
            "location": "Bangalore / Hyderabad",
            "employment_type": "full_time",
            "min_cgpa": 7.5,
            "eligible_departments": ["Computer Science and Engineering", "Information Technology"],
            "eligible_degrees": ["B.Tech", "B.E.", "M.Tech"],
            "graduation_years": [2025, 2026, 2027],
            "required_skills": ["Golang / Python / Java", "Distributed Systems", "Kafka", "NoSQL Databases", "System Design"],
            "preferred_skills": ["gRPC", "Docker", "Redis", "Prometheus"],
            "package_details": "₹34 LPA - ₹50 LPA",
            "application_url": "https://uber.com/careers",
            "deadline": deadline,
            "status": "published",
            "source_name": "Campus Placement Drive",
            "created_at": now,
            "updated_at": now,
        }
    ]

    inserted_count = 0
    for job in jobs_data:
        existing_job = db["jobs"].find_one({"company_id": job["company_id"], "title": job["title"]})
        if not existing_job:
            db["jobs"].insert_one(job)
            inserted_count += 1

    print(f"✓ Seeded {len(companies_data)} Companies and {inserted_count} Tier-1 Placement Drives successfully!")

if __name__ == "__main__":
    seed_companies_and_jobs()
