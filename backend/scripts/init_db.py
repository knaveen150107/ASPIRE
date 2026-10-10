"""Idempotent Database Initialization Script for ASPIRE.

Creates all 20 required MongoDB collections with JSON Schema validation and
applies all indexing and uniqueness constraints without inserting sample data.

Usage:
    python backend/scripts/init_db.py
    or (from backend directory):
    python scripts/init_db.py
"""

import os
import sys
from typing import Dict, List, Tuple
from pymongo.errors import PyMongoError

# Ensure backend root is in sys.path
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_ROOT = os.path.dirname(SCRIPT_DIR)
if BACKEND_ROOT not in sys.path:
    sys.path.insert(0, BACKEND_ROOT)

from app.db.config import settings
from app.db.connection import db_manager
from app.db.indexes import COLLECTION_INDEXES
from app.db.validators import COLLECTION_VALIDATORS


def initialize_database() -> None:
    """Connects to MongoDB Atlas and initializes all collections, schemas, and indexes."""
    print("=" * 70)
    print("ASPIRE — MongoDB Atlas Database Architecture Initialization")
    print("=" * 70)

    # 1. Validate configuration before connecting
    try:
        settings.validate_or_raise()
    except ValueError as err:
        print("\n[ERROR] Database Configuration Check Failed:")
        print(f"  {err}")
        print("\nInitialization aborted. No connection was attempted.\n")
        sys.exit(1)

    print(f"Target Database : {settings.mongodb_database}")
    print(f"Connection URI  : {settings.get_masked_uri()}")
    print("-" * 70)

    # 2. Connect to MongoDB Atlas
    try:
        print("[1/4] Connecting to MongoDB Atlas cluster...")
        db = db_manager.get_database()
        # Verify connection with ping
        db_manager.ping()
        print("      ✓ Connected successfully & ping verified.")
    except PyMongoError as exc:
        print(f"\n[ERROR] Failed to connect to MongoDB Atlas: {exc}")
        print("Please check your network connection, IP access list, and credentials.")
        sys.exit(1)
    except Exception as exc:
        print(f"\n[ERROR] Unexpected error during connection: {exc}")
        sys.exit(1)

    # 3. Inspect existing collections
    existing_collections = set(db.list_collection_names())
    print(f"\n[2/4] Inspecting existing database state ({len(existing_collections)} existing collections found)...")

    results_collections: List[Tuple[str, str]] = []

    # 4. Create or update collections with validators
    print("\n[3/4] Initializing collections and JSON Schema validators...")
    for col_name, validator in COLLECTION_VALIDATORS.items():
        try:
            if col_name in existing_collections:
                # Update validator safely on existing collection without touching documents
                db.command("collMod", col_name, validator=validator, validationLevel="strict", validationAction="error")
                results_collections.append((col_name, "MODIFIED (Validator synced)"))
                print(f"  • {col_name:<22} : Validator updated successfully.")
            else:
                # Create brand new empty collection with strict JSON Schema validator
                db.create_collection(
                    col_name,
                    validator=validator,
                    validationLevel="strict",
                    validationAction="error",
                )
                results_collections.append((col_name, "CREATED (Empty collection + Validator)"))
                print(f"  • {col_name:<22} : Created empty collection with schema.")
        except PyMongoError as err:
            print(f"\n[ERROR] Failed configuring collection '{col_name}': {err}")
            sys.exit(1)

    # 5. Apply indexes and uniqueness constraints
    print("\n[4/4] Creating and syncing database indexes...")
    index_summary: Dict[str, List[str]] = {}

    for col_name, index_models in COLLECTION_INDEXES.items():
        try:
            col = db[col_name]
            created_names = col.create_indexes(index_models)
            index_summary[col_name] = created_names
            print(f"  • {col_name:<22} : {len(created_names)} indexes verified/created.")
        except PyMongoError as err:
            print(f"\n[ERROR] Failed creating indexes on collection '{col_name}': {err}")
            sys.exit(1)

    # 6. Completion Summary
    print("\n" + "=" * 70)
    print("INITIALIZATION SUMMARY")
    print("=" * 70)
    print(f"Database: {settings.mongodb_database}")
    print(f"{'Collection Name':<25} | {'Status':<35} | {'Indexes':<8}")
    print("-" * 70)
    for col_name, status in results_collections:
        idx_count = len(index_summary.get(col_name, []))
        print(f"{col_name:<25} | {status:<35} | {idx_count} indexes")

    print("-" * 70)
    print("✓ All 20 collections created/verified.")
    print("✓ All $jsonSchema validation rules applied.")
    print("✓ All compound and unique indexes created.")
    print("✓ Strict separation preserved (NO sample records or business logic inserted).")
    print("=" * 70 + "\n")


if __name__ == "__main__":
    initialize_database()
