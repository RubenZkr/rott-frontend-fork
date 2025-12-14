
# RoTT Backend - Code Wiki

## Overview

**RoTT Backend** is a FastAPI-based application that leverages generative AI to create short assessment moments (quizzes) for HBO-ICT students. The system uses Retrieval-Augmented Generation (RAG) to generate contextually relevant quiz questions from uploaded documents.

### Contributors
- Ahmed Benhajar (21024154)
- Edwin Ross (19137052)
- Jennifer Goudswaard (21155496)
- Marjo Salo (21146942)
- Sander in 't Hout (15126463)

---

## Architecture Overview

The application follows a **layered architecture** pattern with clear separation of concerns:

```
┌─────────────────────────────────────────┐
│         Presentation Layer              │
│  (FastAPI Routes & Controllers)         │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│         Application Layer               │
│  (Services & Business Logic)            │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│         Domain Layer                    │
│  (Models & Entities)                    │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│         Infrastructure Layer            │
│  (Redis, Ollama, Celery, RAG)          │
└─────────────────────────────────────────┘
```

---

## Project Structure

```bash
rott-backend/
├── app/                           # Main application directory
│   ├── configs/                   # Application configurations
│   │   ├── logging_config.py     # Logging setup with rotating file handler
│   │   └── redis_config.py       # Redis client and vector store configuration
│   ├── quizzes/                   # Quiz domain module
│   │   ├── models/                # Domain models
│   │   │   ├── question_model.py  # Question entity
│   │   │   ├── quiz_model.py      # Quiz aggregate root
│   │   │   └── question_count. py  # Value object for question counts
│   │   ├── routes/                # API endpoints
│   │   │   └── quiz_controller.py # Quiz HTTP controllers
│   │   ├── services/              # Business logic services
│   │   │   ├── quiz_service.py            # Quiz CRUD operations
│   │   │   ├── quiz_generation_service.py # Quiz generation orchestration
│   │   │   ├── question_create_service. py # Question factory
│   │   │   └── quiz_export_service.py     # CSV export functionality
│   │   └── tasks/                 # Asynchronous task handlers
│   │       └── quiz_generation_task.py    # Celery background tasks
│   ├── rag/                       # RAG (Retrieval-Augmented Generation) module
│   │   ├── models/                # RAG-specific models
│   │   │   ├── generative_model.py   # Ollama LLM wrapper
│   │   │   └── embeddings_model.py   # Embeddings model wrapper
│   │   ├── services/              # RAG processing services
│   │   │   ├── rag_service.py              # RAG application factory
│   │   │   ├── rag_quiz_generator.py       # Quiz generation via RAG
│   │   │   ├── content_retriever_service.py # Document loading
│   │   │   └── vector_store_service.py     # Vector database operations
│   │   ├── templates/             # Prompt templates
│   │   │   ├── multiple_choice.py    # MC question prompts
│   │   │   ├── true_false.py         # TF question prompts
│   │   │   ├── short_answer.py       # SA question prompts
│   │   │   └── regenerate_quiz_template.txt
│   │   ├── rag_application.py     # RAG orchestration
│   │   └── rag_chain.py           # LangChain integration
│   ├── utils/                     # Utility functions
│   │   └── file_handler.py        # File operations
│   └── main.py                    # Application entry point
├── docker/                        # Docker configurations
│   ├── app/Dockerfile            # Application container
│   └── ollama/                   # Ollama LLM service
│       ├── Dockerfile
│       └── run-ollama.sh         # Ollama initialization script
├── files/                        # Runtime file storage
├── rag_files/                    # Uploaded documents for RAG
├── . env. example                  # Environment variables template
├── docker-compose.yml            # Multi-container orchestration
├── docker-compose-with-ollama.yml # Alternative with embedded Ollama
└── requirements.txt              # Python dependencies
```

---

## Core Components

### 1. Domain Models

#### Quiz Model (`app/quizzes/models/quiz_model.py`)

The **Quiz** is the aggregate root that manages a collection of questions. 

```python
class Quiz(BaseModel):
    id: str
    title: constr(min_length=3, max_length=100)
    questions: List[Question] = []
```

**Responsibilities:**
- Add questions to the quiz
- Find and retrieve questions by ID
- Replace questions (for regeneration)
- Persist to Redis with TTL (2 hours)

**Key Methods:**
- `add_question(question: Question)` - Adds a question to the quiz
- `find_question_index_by_id(question_id: str)` - Locates question index
- `replace_question_by_id(question_id: str, new_question: Question)` - Updates a question
- `save()` - Persists quiz to Redis

#### Question Model (`app/quizzes/models/question_model.py`)

Represents an individual quiz question with support for multiple question types.

```python
class Question(BaseModel):
    type: constr(min_length=1)  # "MC", "TF", or "SA"
    id: str
    title: str
    question_text: str
    points: int
    difficulty: str
    scoring:  Optional[str] = None
    image:  Optional[str] = None
    options: Optional[Any] = None  # Format varies by type
    hint: Optional[str] = None
    feedback: Optional[str] = None
```

**Question Types:**
- **MC** (Multiple Choice): 4 options with one correct answer
- **TF** (True/False): Boolean question
- **SA** (Short Answer): Open-ended questions with multiple acceptable answers

**Key Methods:**
- `to_csv_format()` - Converts question to CSV format for export

#### QuestionCount Value Object (`app/quizzes/models/question_count.py`)

Encapsulates the count of each question type requested.

```python
class QuestionCount: 
    def __init__(self, short_answer_count: int = 0, 
                 multiple_choice_count: int = 0, 
                 true_false_count:  int = 0):
        self.short_answer = short_answer_count
        self.multiple_choice = multiple_choice_count
        self.true_false = true_false_count
```

---

### 2. Application Services

#### Quiz Generation Service (`app/quizzes/services/quiz_generation_service.py`)

Orchestrates the quiz generation process using RAG.

```python
def generate_quiz(quiz_uuid: str, subject: str, 
                  question_count: QuestionCount, 
                  content:  str) -> Quiz:
    """Generates a complete quiz using RAG"""
    questions_data = run_quiz_rag(subject, question_count, content)
    quiz = create_quiz(quiz_uuid, subject, questions_data)
    return quiz. save()
```

#### Question Creation Service (`app/quizzes/services/question_create_service.py`)

Factory service for creating Question entities from RAG output.

**Key Functions:**
- `create_quiz()` - Creates a Quiz aggregate with questions
- `bulk_create_questions()` - Batch creates questions
- `create_single()` - Creates individual Question from RAG JSON

**Question Option Mapping:**
- **MC**: Maps answer keys (a, b, c, d) to options with scores (100 = correct, 0 = incorrect)
- **TF**: Creates TRUE/FALSE options with appropriate scores
- **SA**: Creates answer options (all scored 100)

#### Quiz Service (`app/quizzes/services/quiz_service.py`)

Handles CRUD operations for quizzes.

```python
def get_quiz(quiz_uuid: str) -> Quiz:
    """Retrieves quiz from Redis"""
    quiz_data = redis_client.json().get(quiz_uuid, Path.root_path())
    if not quiz_data:
        raise HTTPException(status_code=404, detail="Quiz not found")
    return Quiz.parse_raw(quiz_data)

def delete_quiz(quiz_uuid: str):
    """Deletes quiz from Redis"""
    get_quiz(quiz_uuid)  # Validates existence
    redis_client.delete(quiz_uuid)
```

#### Quiz Export Service (`app/quizzes/services/quiz_export_service.py`)

Exports quizzes to CSV format compatible with Learning Management Systems.

```python
def export_quiz(quiz_uuid: str):
    """Exports quiz to CSV format"""
    quiz = get_quiz(quiz_uuid)
    output = io.StringIO()
    writer = csv.writer(output)
    
    for question in quiz.questions:
        for row in question.to_csv_format():
            writer.writerow(row)
    
    return output
```

---

### 3. RAG (Retrieval-Augmented Generation) System

#### RAG Application (`app/rag/rag_application.py`)

Orchestrates the RAG process to generate questions from documents.

```python
class RAGApplication:
    def __init__(self, content, chain, number:  int, subject: str):
        self.content = content  # Retrieved documents
        self.chain = chain      # LangChain chain
        self.number = number    # Number of questions
        self.subject = subject  # Quiz subject
    
    def run(self):
        """Executes RAG to generate questions"""
        doc_texts = "\n".join([doc.page_content for doc in self.content])
        answer = self.chain.invoke({
            "subject": self.subject,
            "number": self.number,
            "documents": doc_texts
        })
        return answer
```

#### RAG Service (`app/rag/services/rag_service.py`)

Factory for creating configured RAG applications.

```python
def get_quiz_rag(template:  str, variables: List[str], 
                 number: int, subject: str, content: str) -> RAGApplication:
    """Creates a configured RAG application"""
    main_model_name = os.getenv("MAIN_MODEL_NAME")
    generative_model = GenerativeModel(main_model_name, 0. 3).init_model()
    
    rag_chain = RAGChain(template, variables, generative_model)
    return RAGApplication(content, rag_chain. chain, number, subject)
```

#### Generative Model (`app/rag/models/generative_model.py`)

Wrapper for Ollama LLM integration via LangChain.

```python
class GenerativeModel:
    def __init__(self, llm:  str, temp: float):
        self.llm = llm
        self.temp = temp
    
    def init_model(self) -> ChatOllama:
        return ChatOllama(
            model=self.llm,
            temperature=self.temp,
            base_url=os.getenv("OLLAMA_BASE_URL"),
            format="json"  # Enforces JSON output
        )
```

#### Embeddings Model (`app/rag/models/embeddings_model.py`)

Wrapper for text embeddings used in vector search.

```python
class EmbeddingsModel:
    def __init__(self, embeddings_model: str):
        self.embeddings_model = embeddings_model
    
    def init_model(self):
        return OllamaEmbeddings(
            model=self.embeddings_model,
            base_url=os.getenv("OLLAMA_BASE_URL")
        )
```

---

### 4.  Prompt Templates

The system uses carefully crafted prompts for each question type to ensure high-quality generation.

#### Multiple Choice Template (`app/rag/templates/multiple_choice.py`)

```python
persona = """Je bent een grondig getraind machine learning-model 
dat expert is in het genereren van multiple choice-quizvragen."""

instruction = """Genereer {number} vragen over {subject}. 
    - Gebruik alléén de geleverde documenten
    - Genereer 3 foute en 1 correct antwoord per vraag
    - Type moet "MC" zijn
    - Plaats correcte antwoord in "correcte_antwoord" lijst"""

context = """Bedoeld voor HBO-ICT studenten"""
audience = """HBO-studenten ICT"""
tone = """Professioneel en educatief, maar helder en toegankelijk"""
```

#### Short Answer Template (`app/rag/templates/short_answer.py`)

```python
instruction = """Genereer {number} kort antwoord vragen. 
    - Alle antwoorden in "antwoorden" moeten correct zijn
    - Elk antwoord maximaal drie woorden
    - Type moet "SA" zijn
    - Geen URL-links"""
```

#### True/False Template (`app/rag/templates/true_false.py`)

Similar structure focusing on boolean questions with single correct answer.

---

### 5. API Routes

#### Quiz Controller (`app/quizzes/routes/quiz_controller.py`)

RESTful API endpoints for quiz operations.

**POST `/quizzes/generate`**
```python
async def generate_quiz(
    subject: str = Body(...),
    multiple_choice_count: int = Body(0),
    true_false_count: int = Body(0),
    short_answer_count: int = Body(0),
    files: List[UploadFile] = File(...),
):
    """Initiates async quiz generation"""
    quiz_uuid = str(uuid.uuid4())
    # Saves files and triggers Celery task
    # Returns quiz_uuid for polling
```

**GET `/quizzes/{quiz_uuid}`**
```python
async def get_quiz(quiz_uuid: str):
    """Retrieves generated quiz"""
```

**GET `/quizzes/{quiz_uuid}/export`**
```python
async def export_quiz(quiz_uuid: str):
    """Exports quiz as CSV file"""
```

**POST `/quizzes/{quiz_uuid}/regenerate/{question_id}`**
```python
async def regenerate_question(quiz_uuid: str, question_id: str):
    """Regenerates a single question"""
```

**GET `/quizzes/{quiz_uuid}/progress`**
```python
async def get_quiz_generation_progress(quiz_uuid: str):
    """Polls generation progress"""
```

**DELETE `/quizzes/{quiz_uuid}`**
```python
async def delete_quiz(quiz_uuid: str):
    """Removes quiz from Redis"""
```

---

### 6. Background Tasks

#### Quiz Generation Task (`app/quizzes/tasks/quiz_generation_task.py`)

Celery tasks for asynchronous quiz generation.

```python
@shared_task(queue='celery')
def process_quiz_generation_task(quiz_uuid: str, subject: str, 
                                 question_counts_dict: dict, 
                                 documents: list):
    """Background task for quiz generation"""
    # 1. Retrieve content from vector store
    # 2. Generate questions via RAG
    # 3. Create quiz entity
    # 4. Save to Redis
    # 5. Update progress
```

**Progress Tracking:**
```python
def set_quiz_generation_progress(quiz_uuid: str, message: str):
    """Updates generation progress in Redis"""
    redis_client. set(f"progress:{quiz_uuid}", message)
    redis_client.expire(f"progress:{quiz_uuid}", 
                       PROGRESS_EXPIRATION_TIME_SECONDS)
```

---

## Infrastructure Layer

### Redis Configuration (`app/configs/redis_config.py`)

**Redis Client:**
```python
def get_redis_client():
    """Returns Redis client for JSON operations"""
    redis_url = os.getenv('REDIS_URL')
    parsed_url = urlparse(redis_url)
    return Redis(
        host=parsed_url.hostname,
        port=parsed_url.port,
        password=parsed_url. password,
        decode_responses=True
    )
```

**Redis Vector Store:**
```python
def get_redis_vector_store(index):
    """Returns RedisVectorStore for RAG"""
    embed_model_name = os.getenv("EMBED_MODEL_NAME")
    embeddings_model = EmbeddingsModel(embed_model_name).init_model()
    
    return RedisVectorStore(
        index_name=index,
        embeddings=embeddings_model,
        redis_url=os.getenv('REDIS_URL'),
    )
```

**TTL Configuration:**
- Quiz expiration: 2 hours
- Progress expiration: 2 hours

### Logging Configuration (`app/configs/logging_config.py`)

Centralized logging with rotating file handler.

```python
def configure_logging():
    """Sets up application logging"""
    enable_logging = os.getenv("ENABLE_LOGGING", "False").lower() == "true"
    
    if enable_logging: 
        # RotatingFileHandler with 1MB max size, 3 backups
        file_handler = RotatingFileHandler(
            os.getenv('LOG_FILE'), 
            maxBytes=10**6, 
            backupCount=3
        )
        # Console output
        stream_handler = logging.StreamHandler(sys.stdout)
        # Global exception handling
```

---

## Technology Stack

### Core Dependencies (`requirements.txt`)

```
fastapi              # Modern web framework
pydantic             # Data validation
uvicorn              # ASGI server
python-dotenv        # Environment configuration
python-multipart     # File upload handling
redis                # In-memory data store
celery               # Distributed task queue
flower               # Celery monitoring
langchain            # LLM orchestration framework
langchain_community  # Community integrations
langchain-openai     # OpenAI integration
langchain-ollama     # Ollama integration
langchain_redis      # Redis vector store
unstructured         # Document parsing
unstructured[ppt,doc,docx]  # Office formats
pypdf                # PDF parsing
```

---

## Docker Architecture

### Multi-Container Setup (`docker-compose.yml`)

**Services:**

1. **Redis** - Data persistence and vector store
   ```yaml
   redis:
     image: redis/redis-stack: 7.4. 0-v1
     ports:
       - "6379:6379"
   ```

2. **Celery Worker** - Background task processing
   ```yaml
   celery:
     build: ./docker/app
     command: celery -A app.quizzes.tasks.quiz_generation_task worker
   ```

3. **Flower** - Celery monitoring UI
   ```yaml
   flower:
     command: celery -A app.quizzes.tasks.quiz_generation_task flower
     ports: 
       - "5555:5555"
   ```

4. **FastAPI App** - Web server
   ```yaml
   app:
     build: ./docker/app
     command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
     ports: 
       - "8000:8000"
   ```

5. **Ollama** (optional) - Local LLM service
   ```yaml
   ollama:
     build: 
       context: . 
       dockerfile: ./docker/ollama/Dockerfile
   ```

---

## Configuration

### Environment Variables (`.env.example`)

```bash
# Redis Configuration
REDIS_URL=redis://localhost:6379

# Ollama Configuration
OLLAMA_BASE_URL=http://host.docker.internal:11434
MAIN_MODEL_NAME=llama3.2  # Generative model
EMBED_MODEL_NAME=nomic-embed-text  # Embeddings model

# Application Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8000
RAG_PATH=./rag_files
LOG_FILE=./app.log
ENABLE_LOGGING=True
```

---

## API Usage Examples

### Generate Quiz

**Request:**
```bash
POST /quizzes/generate
Content-Type: multipart/form-data

subject:  "Python Programming"
multiple_choice_count: 3
true_false_count: 2
short_answer_count: 1
files: [lecture_notes.pdf, slides.pptx]
```

**Response:**
```json
{
  "quiz_uuid": "550e8400-e29b-41d4-a716-446655440000",
  "message": "Quiz generation started"
}
```

### Poll Progress

**Request:**
```bash
GET /quizzes/{quiz_uuid}/progress
```

**Response:**
```json
{
  "progress": "Vragen aan het genereren...  (3/6)"
}
```

### Retrieve Quiz

**Request:**
```bash
GET /quizzes/{quiz_uuid}
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Python Programming",
  "questions": [
    {
      "type": "MC",
      "id": "q1",
      "title": "What is a list comprehension?",
      "question_text": "What is a list comprehension?",
      "points": 1,
      "difficulty": "1",
      "options": [
        ["100", "A concise way to create lists"],
        ["0", "A type of loop"],
        ["0", "A function decorator"],
        ["0", "A class method"]
      ]
    }
  ]
}
```

### Export Quiz

**Request:**
```bash
GET /quizzes/{quiz_uuid}/export
```

**Response:**
CSV file download with quiz data in LMS-compatible format.

---

## Development Workflow

### Local Setup

1. **Clone repository**
   ```bash
   git clone https://github.com/coecs-hhs/rott-backend.git
   cd rott-backend
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   touch app. log
   ```

3. **Start services**
   ```bash
   docker-compose up
   ```

4. **Access application**
   - API: http://127.0.0.1:8000
   - Swagger Docs: http://127.0.0.1:8000/docs
   - Flower (Celery): http://127.0.0.1:5555

### With Local Ollama

For better performance on Linux with CPU inference:

```bash
# Set in .env
OLLAMA_BASE_URL=http://host.docker.internal:11434

# Start with embedded Ollama
docker-compose -f docker-compose-with-ollama.yml up
```

---

## Design Patterns & Best Practices

### 1. Repository Pattern
Redis serves as the persistence layer with `Quiz. save()` encapsulating storage logic.

### 2. Factory Pattern
`question_create_service. py` implements factory methods for creating Questions from various sources.

### 3. Service Layer Pattern
Business logic is isolated in service classes, keeping controllers thin.

### 4. Dependency Injection
Configuration and clients are injected via environment variables and factory functions.

### 5. Aggregate Root Pattern
`Quiz` is the aggregate root that manages the lifecycle of `Question` entities.

### 6. Value Object Pattern
`QuestionCount` is an immutable value object representing question type counts.

### 7. Async Task Pattern
Celery handles long-running quiz generation asynchronously with progress tracking.

---

## Error Handling

### Global Exception Handler (`app/main.py`)

```python
@app.exception_handler(Exception)
async def global_exception_handler(request:  Request, exc: Exception):
    logger.error(f"Unhandled exception occurred: {exc}", exc_info=exc)
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected error occurred. "}
    )
```

### Service-Level Validation

- **Quiz not found**: Returns 404 with descriptive message
- **Invalid question counts**:  Validates at least one question type is requested
- **RAG failures**: Logged and skipped to prevent partial quiz corruption

---

## Monitoring & Observability

### Logging
- Rotating file handler (1MB files, 3 backups)
- Console output for Docker logs
- Structured logging with timestamps and levels

### Celery Monitoring
- **Flower UI**: Real-time task monitoring at http://127.0.0.1:5555
- Task success/failure tracking
- Worker health status

### Progress Tracking
- Redis-based progress updates
- Client-side polling via `/progress` endpoint
- Automatic expiration after 2 hours

---

## Security Considerations

### CORS Configuration
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure per environment
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Data Retention
- Quizzes automatically expire after 2 hours
- Uploaded files stored per quiz UUID
- Cleanup tasks remove temporary files

### Input Validation
- Pydantic models enforce data validation
- File type restrictions on uploads
- String length constraints on quiz titles

---

## Performance Optimizations

### Vector Store Caching
Documents are embedded once and stored in Redis vector store for efficient retrieval.

### Asynchronous Processing
Long-running quiz generation offloaded to Celery workers to keep API responsive.

### Redis JSON
Native JSON storage in Redis eliminates serialization overhead.

### LLM Temperature
Set to 0.3 for consistent, deterministic question generation.

---

## Testing Recommendations

### Unit Tests
- Test domain models (Quiz, Question)
- Test service layer functions
- Mock external dependencies (Redis, Ollama)

### Integration Tests
- Test API endpoints end-to-end
- Verify Celery task execution
- Test RAG pipeline with sample documents

### Example Test Structure
```python
def test_create_question():
    question_data = {
        "type":  "MC",
        "vraag": "Test question? ",
        "antwoorden": {"a": "Option 1", "b": "Option 2"},
        "correcte_antwoord": ["a"]
    }
    question = create_single(question_data)
    assert question.type == "MC"
    assert len(question.options) == 2
```

---

## Extension Points

### Adding New Question Types
1. Define prompt template in `app/rag/templates/`
2. Update `question_create_service.py` option mapping
3. Extend `Question. to_csv_format()` for export

### Custom LLM Providers
1. Implement new model wrapper in `app/rag/models/`
2. Update `GenerativeModel` initialization
3. Configure via environment variables

### Additional Export Formats
1. Create new service in `app/quizzes/services/`
2. Implement `Question` serialization method
3. Add export endpoint in controller

---

## Troubleshooting

### Common Issues

**Issue:  Models not downloading**
- First run downloads Ollama models (can take 5-10 minutes)
- Check `docker logs ollama` for progress

**Issue: Quiz generation fails**
- Verify Ollama is running:  `curl http://localhost:11434/api/tags`
- Check uploaded document formats are supported
- Review logs:  `tail -f app.log`

**Issue: Redis connection errors**
- Verify Redis is running:  `docker ps | grep redis`
- Check REDIS_URL in `.env`

**Issue: Celery tasks not executing**
- Check Celery worker logs: `docker logs celery`
- Verify Redis connection
- Monitor in Flower UI

---

## API Documentation

Full interactive API documentation available at:
- **Swagger UI**: http://127.0.0.1:8000/docs
- **ReDoc**:  http://127.0.0.1:8000/redoc

---

## Contributing

When contributing to this codebase:

1. **Follow C# conventions** adapted for Python (PascalCase for classes, camelCase for methods)
2. **Maintain separation of concerns** - keep layers independent
3. **Write descriptive Dutch prompts** for question templates
4. **Add logging** for debugging and monitoring
5. **Update this wiki** when adding new features

---

## References

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [LangChain Documentation](https://python.langchain.com/)
- [Ollama Models](https://ollama.com/library)
- [Redis Stack Documentation](https://redis.io/docs/stack/)
- [Celery Documentation](https://docs.celeryproject.org/)

---

**Last Updated**:  2025-12-14  
**Repository**: [coecs-hhs/rott-backend](https://github.com/coecs-hhs/rott-backend)