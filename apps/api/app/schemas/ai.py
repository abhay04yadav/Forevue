from typing import Any



from pydantic import BaseModel, ConfigDict, Field





class SemanticMetricSchema(BaseModel):

    model_config = ConfigDict(extra="forbid")



    id: str

    label: str

    description: str

    value_type: str

    allowed_dimensions: list[str]

    allowed_filters: list[str]





class SemanticSchemaResponse(BaseModel):

    metrics: list[SemanticMetricSchema]

    role: str





class SemanticQueryRequest(BaseModel):

    model_config = ConfigDict(extra="forbid")



    metric: str

    dimensions: list[str] = Field(default_factory=list)

    filters: dict[str, str] = Field(default_factory=dict)

    limit: int = Field(default=100, ge=1, le=500)





class SemanticQueryResponse(BaseModel):

    metric: str

    columns: list[str]

    rows: list[dict[str, Any]]

    row_count: int

    truncated: bool

    interpretation: str





class AskRequest(BaseModel):

    model_config = ConfigDict(extra="forbid")



    question: str = Field(min_length=1, max_length=2000)

    session_id: str | None = Field(default=None, max_length=64)





class AskResponse(BaseModel):

    abstained: bool

    interpretation: str | None = None

    metric: str | None = None

    columns: list[str] = Field(default_factory=list)

    rows: list[dict[str, Any]] = Field(default_factory=list)

    narration: str | None = None

    cached: bool = False

    session_id: str

    evidence_sources: list[str] = Field(default_factory=list)





class GovernedDocumentCreateRequest(BaseModel):

    model_config = ConfigDict(extra="forbid")



    title: str = Field(min_length=1, max_length=500)

    source_label: str = Field(min_length=1, max_length=200)

    content: str = Field(min_length=1, max_length=500_000)





class GovernedDocumentCreateResponse(BaseModel):

    document_id: str

    chunk_count: int


