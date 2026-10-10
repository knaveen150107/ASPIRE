"""MongoDB Atlas client connection management for ASPIRE."""

import logging
from typing import Optional
from pymongo import MongoClient
from pymongo.database import Database

from app.db.config import settings

logger = logging.getLogger("aspire.db")


class MongoConnectionManager:
    """Manages the MongoDB Atlas client lifecycle and database handle."""

    def __init__(self) -> None:
        self._client: Optional[MongoClient] = None
        self._db: Optional[Database] = None

    def get_client(self) -> MongoClient:
        """Initializes and returns the PyMongo MongoClient singleton.

        Raises:
            ValueError: If MONGODB_URI is unconfigured.
        """
        if self._client is None:
            settings.validate_or_raise()
            logger.info("Initializing MongoDB client to %s", settings.get_masked_uri())
            self._client = MongoClient(
                settings.mongodb_uri,
                serverSelectionTimeoutMS=5000,
                connectTimeoutMS=10000,
                maxPoolSize=50,
                minPoolSize=5,
                appname="ASPIRE-Backend",
            )
        return self._client

    def get_database(self, db_name: Optional[str] = None) -> Database:
        """Returns the configured database instance.

        Args:
            db_name: Optional database name override. Defaults to MONGODB_DATABASE setting.
        """
        client = self.get_client()
        target_db = db_name or settings.mongodb_database
        return client[target_db]

    def close(self) -> None:
        """Closes the MongoDB client connection pool."""
        if self._client is not None:
            logger.info("Closing MongoDB client connection pool.")
            self._client.close()
            self._client = None
            self._db = None

    def ping(self) -> bool:
        """Sends a ping command to verify connectivity to MongoDB Atlas."""
        client = self.get_client()
        result = client.admin.command("ping")
        return bool(result.get("ok") == 1)


db_manager = MongoConnectionManager()


def get_db() -> Database:
    """Helper function to retrieve the active database handle."""
    return db_manager.get_database()
