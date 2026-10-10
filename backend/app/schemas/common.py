"""Common API Response schemas and helpers."""

from typing import Any, Generic, List, Optional, TypeVar
from pydantic import BaseModel, Field

DataT = TypeVar("DataT")


class ApiResponse(BaseModel, Generic[DataT]):
    """Standard unified API envelope response."""

    success: bool = True
    message: str = "Success"
    data: Optional[DataT] = None


class PaginatedResponse(BaseModel, Generic[DataT]):
    """Standard unified paginated envelope response."""

    success: bool = True
    total: int = 0
    page: int = 1
    page_size: int = 20
    data: List[DataT] = Field(default_factory=list)
