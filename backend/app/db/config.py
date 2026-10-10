"""MongoDB configuration and environment validation for ASPIRE."""

import os
import re
from typing import Optional
from dotenv import load_dotenv

# Automatically load environment variables from .env if present
load_dotenv()


class DatabaseSettings:
    """Manages database connection settings from environment variables."""

    def __init__(self) -> None:
        self.mongodb_uri: str = os.getenv("MONGODB_URI", "").strip()
        self.mongodb_database: str = os.getenv("MONGODB_DATABASE", "aspire_db").strip()

    @property
    def is_configured(self) -> bool:
        """Returns True if the MongoDB URI is non-empty."""
        return bool(self.mongodb_uri)

    def validate_or_raise(self) -> None:
        """Validates that database connection variables are present before attempting connection.

        Raises:
            ValueError: If MONGODB_URI is not configured.
        """
        if not self.is_configured:
            raise ValueError(
                "MongoDB Atlas configuration is missing or incomplete.\n"
                "Please configure the following environment variables in your environment or .env file:\n"
                "  - MONGODB_URI: Your MongoDB Atlas connection string (e.g. mongodb+srv://...)\n"
                "  - MONGODB_DATABASE: Target database name (default: aspire_db)\n"
                "\n"
                "Example in .env:\n"
                "  MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority\n"
                "  MONGODB_DATABASE=aspire_db\n"
            )

    def get_masked_uri(self) -> str:
        """Returns the MongoDB URI with any credentials safely redacted for logging."""
        if not self.mongodb_uri:
            return "<UNSET>"
        # Regex to mask username:password in standard and srv connection strings
        masked = re.sub(r"://([^:@]+):([^@]+)@", r"://\1:****@", self.mongodb_uri)
        return masked


settings = DatabaseSettings()
