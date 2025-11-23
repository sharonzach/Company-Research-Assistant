# 🏗️ Aura - Architecture & Design Document

## 📑 Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Component Details](#component-details)
4. [Data Flow](#data-flow)
5. [AI Agent Logic](#ai-agent-logic)
6. [Frontend Architecture](#frontend-architecture)
7. [Backend Architecture](#backend-architecture)
8. [API Integration](#api-integration)
9. [Design Patterns](#design-patterns)
10. [Security Considerations](#security-considerations)
11. [Performance Optimization](#performance-optimization)
12. [Future Enhancements](#future-enhancements)

---

## 🎯 System Overview

Aura is a **conversational AI research assistant** built on a modern **client-server architecture** with real-time web research capabilities. The system combines advanced language models, web search APIs, and interactive visualizations to deliver comprehensive company intelligence.

### Core Objectives

1. **Intelligent Research**: Aggregate and synthesize information from multiple sources
2. **Adaptive Interaction**: Adjust responses based on user behavior and context
3. **Visual Analytics**: Present data through interactive charts and dashboards
4. **Seamless UX**: Provide voice interaction, auto-play audio, and smooth animations
5. **Transparency**: Display confidence scores and source rankings

---

## 🏛️ Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ Chat Window  │  │ Voice Input  │  │ Live Insights Panel  │  │
│  │  - Messages  │  │  - Speech    │  │  - Charts            │  │
│  │  - Actions   │  │  - Audio Out │  │  - Trust Scores      │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND (main.js)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ Event        │  │ Chart.js     │  │ Speech API           │  │
│  │ Handlers     │  │ Rendering    │  │ Integration          │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND API (FastAPI)                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                     app.py                                │  │
│  │  - /chat endpoint                                         │  │
│  │  - Session management                                     │  │
│  │  - Static file serving                                    │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                 AI AGENT LOGIC (agent_logic.py)                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ Research     │  │ Data         │  │ Persona              │  │
│  │ Agent        │  │ Extraction   │  │ Adaptation           │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL APIS                                │
│  ┌──────────────────────┐  ┌──────────────────────────────┐    │
│  │  Google Gemini 2.0   │  │     Tavily Search API        │    │
│  │  - Text Generation   │  │  - Web Research              │    │
│  │  - Conversation      │  │  - Multi-source Aggregation  │    │
│  └──────────────────────┘  └──────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🧩 Component Details

### 1. Frontend Layer

#### **HTML (index.html)**
- Single-page application structure
- Semantic HTML5 elements
- Accessibility-friendly markup
- Quick Facts popup container
- Live insights sidebar

#### **CSS (style.css)**
- **CSS Variables** for theming
- **Dark neon theme** with purple/blue gradients
- **Glassmorphism** effects with backdrop-filter
- **Animations**:
  - `popupFadeIn` - Quick Facts scale animation
  - `slideIn` - Insight card entrance
  - `cardGlow` - Pulsing glow effect
  - `floatChip` - Suggestion chip floating
  - `flashPulse` - News flash pulsing
- **Responsive design** with flexbox and grid

#### **JavaScript (main.js)**
Key modules:
- **Event Management**: User input, button clicks, voice commands
- **Message Handling**: `addMessage()`, `sendMessage()`
- **Chart Generation**: `generateAdvancedCharts()`, `createMetricsChart()`, etc.
- **Audio Control**: `speakText()`, pause/resume logic
- **Export Functions**: `exportAsPDF()`, `exportAsMarkdown()`
- **Quick Facts**: `showQuickFact()`, `hideQuickFact()`

### 2. Backend Layer

#### **FastAPI Application (app.py)**
```python
@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    # Session management
    # Agent initialization
    # Message processing
    # Response formatting
```

**Features**:
- RESTful API design
- Session-based conversation memory
- CORS enabled for development
- Static file serving
- Template rendering

#### **AI Agent Logic (agent_logic.py)**

**ResearchAgent Class**:
```python
class ResearchAgent:
    def __init__(self):
        self.model = genai.GenerativeModel('gemini-2.0-flash')
        self.conversation_history = []
        self.research_data = {}
        self.system_prompt = "..."
```

**Key Methods**:
- `search_company()` - Multi-source web research
- `extract_structured_data()` - Parse metrics, trends, competitors
- `should_search()` - Determine if web search is needed
- `extract_company_name()` - Extract entity from query
- `process_message()` - Main orchestration method

### 3. External APIs

#### **Google Gemini 2.0 Flash**
- **Purpose**: Natural language understanding and generation
- **Model**: `gemini-2.0-flash`
- **Features**:
  - Conversation history support
  - System prompt customization
  - Structured output formatting

#### **Tavily Search API**
- **Purpose**: Real-time web research
- **Search Depth**: Advanced
- **Features**:
  - Multi-query aggregation
  - Source ranking
  - Content extraction

---

## 🔄 Data Flow

### Request Flow

```
1. User Input
   ↓
2. Frontend Validation
   ↓
3. Quick Facts Display
   ↓
4. POST /chat Request
   ↓
5. Session Check/Creation
   ↓
6. Agent.process_message()
   ↓
7. should_search() Decision
   ├─ YES → Tavily API Call
   │         ↓
   │    extract_structured_data()
   │         ↓
   │    Gemini API Call (with context)
   │
   └─ NO → Gemini API Call (direct)
   ↓
8. Response Formatting
   ↓
9. JSON Response to Frontend
   ↓
10. UI Update
    ├─ Message Display
    ├─ Chart Rendering
    ├─ Audio Playback
    └─ Quick Facts Hide
```

### Data Structures

#### **Chat Request**
```json
{
  "message": "Research Tesla's financials",
  "session_id": "uuid-string"
}
```

#### **Chat Response**
```json
{
  "response": "markdown-formatted-text",
  "session_id": "uuid-string",
  "data": {
    "company": "Tesla",
    "timestamp": "2025-11-23T18:00:00",
    "metrics": {
      "Revenue (M)": 96773,
      "Market Cap (M)": 1200000
    },
    "trends": [...],
    "competitors": ["Ford", "GM", "Rivian"],
    "sentiment": {
      "positive": 65,
      "negative": 20,
      "neutral": 15
    },
    "confidence_score": 92,
    "reliability_score": 88,
    "sources": ["url1", "url2", "url3"],
    "recent_news": ["Tesla hits 2M deliveries"]
  }
}
```

---

## 🤖 AI Agent Logic

### Persona Adaptation System

The agent automatically detects and adapts to four user personas:

#### 1. **The Confused User**
**Detection**: Short queries, vague language, question marks
**Behavior**:
- Patient, step-by-step explanations
- Simplified language
- Offers examples and suggestions

#### 2. **The Efficient User**
**Detection**: Direct commands, specific metrics requested
**Behavior**:
- Concise, data-focused responses
- Bullet points and tables
- Minimal fluff

#### 3. **The Chatty User**
**Detection**: Long messages, casual tone, emojis
**Behavior**:
- Friendly, conversational style
- Acknowledges their enthusiasm
- Gently steers back to business

#### 4. **The Edge Case User**
**Detection**: Invalid inputs, off-topic requests, impossible queries
**Behavior**:
- Graceful error handling
- Explains limitations
- Offers realistic alternatives

### System Prompt Engineering

```python
system_prompt = """
You are Aura, an expert AI research assistant...

**PERSONA ADAPTATION:**
1. The Confused User: Be patient, use simple language...
2. The Efficient User: Be concise, data-focused...
3. The Chatty User: Be friendly, steer back to business...
4. The Edge Case User: Handle gracefully, explain limitations...

**CORE RULES:**
- Research First: Use search results without asking
- Data Visualization: Structure with Markdown headers
- Account Plans: Generate structured plans
- Transparency: Don't hallucinate data

**FORMATTING:**
- Use Markdown headers (##)
- Bold key metrics
- Bullet points for lists
"""
```

### Data Extraction Pipeline

```python
def extract_structured_data(text, company_name):
    # 1. Initialize data structure
    data = {
        'company': company_name,
        'metrics': {},
        'trends': [],
        'competitors': [],
        'sentiment': {},
        'confidence_score': 0,
        'reliability_score': 0,
        'sources': [],
        'recent_news': []
    }
    
    # 2. Calculate confidence scores
    data['confidence_score'] = min(98, 70 + (len(text) // 100))
    data['reliability_score'] = min(95, 80 + (text.count('$') * 2))
    
    # 3. Extract sources (URLs)
    source_pattern = r'Source: (https?://[^\s]+)'
    data['sources'] = re.findall(source_pattern, text)[:3]
    
    # 4. Extract recent news
    news_pattern = r'\*\*(.*?)\*\*'
    potential_news = re.findall(news_pattern, text)
    data['recent_news'] = [title for title in potential_news 
                           if any(x in title.lower() for x in 
                           ['launch', 'announce', 'report', 'hit'])]
    
    # 5. Extract financial metrics (regex patterns)
    # Revenue, Market Cap, Profit, Employee Count, etc.
    
    # 6. Extract competitors
    # 7. Sentiment analysis
    # 8. Extract priorities and opportunities
    
    return data
```

---

## 🎨 Frontend Architecture

### State Management

```javascript
// Global state
let sessionId = localStorage.getItem('aura_session_id');
let currentUtterance = null;
let isSpeaking = false;
let isAutoPlayEnabled = true;
```

### Chart Rendering System

```javascript
function generateAdvancedCharts(data) {
    // 1. News Flash (if available)
    if (data.recent_news) {
        createNewsFlash(data.recent_news);
    }
    
    // 2. Trust & Confidence Card
    if (data.confidence_score) {
        createTrustCard(data);
    }
    
    // 3. Metrics Chart (Bar)
    if (data.metrics) {
        createMetricsChart(data.metrics);
    }
    
    // 4. Sentiment Chart (Doughnut)
    if (data.sentiment) {
        createSentimentChart(data.sentiment);
    }
    
    // 5. Trends Chart (Line)
    if (data.trends) {
        createTrendsChart(data.trends);
    }
    
    // 6. Strategic Priorities & Opportunities
    // 7. Competitive Landscape
}
```

### Audio System

```javascript
function speakText(text, button, autoplay = false) {
    // 1. Handle pause/resume if already speaking
    if (isSpeaking && !autoplay) {
        if (speechSynthesis.speaking && !speechSynthesis.paused) {
            speechSynthesis.pause();
            button.innerHTML = '<i class="fa-solid fa-play"></i> Resume';
            return;
        } else if (speechSynthesis.paused) {
            speechSynthesis.resume();
            button.innerHTML = '<i class="fa-solid fa-pause"></i> Pause';
            return;
        }
    }
    
    // 2. Cancel any previous speech
    speechSynthesis.cancel();
    
    // 3. Create new utterance
    const cleanText = text.replace(/[*#_`]/g, '')
                          .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
    currentUtterance = new SpeechSynthesisUtterance(cleanText);
    
    // 4. Set voice preferences
    const voices = speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => 
        v.name.includes('Google US English'));
    if (preferredVoice) currentUtterance.voice = preferredVoice;
    
    // 5. Event handlers
    currentUtterance.onstart = () => { /* ... */ };
    currentUtterance.onend = () => { /* ... */ };
    currentUtterance.onerror = () => { /* ... */ };
    
    // 6. Speak
    speechSynthesis.speak(currentUtterance);
}
```

---

## 🔧 Backend Architecture

### Session Management

```python
sessions = {}  # In-memory session store

@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    session_id = request.session_id
    
    # Create new session if needed
    if not session_id or session_id not in sessions:
        session_id = str(uuid.uuid4())
        sessions[session_id] = ResearchAgent()
    
    agent = sessions[session_id]
    result = agent.process_message(request.message)
    
    return {
        "response": result['text'],
        "session_id": session_id,
        "data": result['data']
    }
```

### Error Handling

```python
try:
    result = agent.process_message(request.message)
    return {
        "response": result['text'],
        "session_id": session_id,
        "data": result['data']
    }
except Exception as e:
    print(f"Error processing message: {e}")
    raise HTTPException(status_code=500, detail=str(e))
```

---

## 🔌 API Integration

### Gemini API Integration

```python
import google.generativeai as genai

genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-2.0-flash')

# Chat with history
chat = model.start_chat(history=conversation_history)
response = chat.send_message(context)
```

### Tavily API Integration

```python
from tavily import TavilyClient

tavily_client = TavilyClient(api_key=TAVILY_API_KEY)

# Multi-query search
response1 = tavily_client.search(
    query, 
    search_depth="advanced", 
    max_results=3
)
response2 = tavily_client.search(
    f"{company_name} latest news", 
    search_depth="advanced", 
    max_results=3
)

# Combine results
all_results = response1['results'] + response2['results']
```

---

## 🎨 Design Patterns

### 1. **Singleton Pattern**
- `ResearchAgent` instances are stored per session
- Ensures conversation continuity

### 2. **Factory Pattern**
- Chart creation functions (`createMetricsChart`, `createSentimentChart`)
- Dynamically generate chart configurations

### 3. **Observer Pattern**
- Event listeners for user interactions
- Real-time UI updates based on state changes

### 4. **Strategy Pattern**
- Persona adaptation system
- Different response strategies based on user type

### 5. **Template Method Pattern**
- `process_message()` orchestrates the research flow
- Subcomponents handle specific tasks

---

## 🔒 Security Considerations

### Current Implementation
⚠️ **Development Mode** - API keys are hardcoded

### Production Recommendations

1. **Environment Variables**
```python
import os
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")
```

2. **Secret Management**
- Use AWS Secrets Manager, Azure Key Vault, or similar
- Rotate keys regularly

3. **Rate Limiting**
```python
from slowapi import Limiter
limiter = Limiter(key_func=get_remote_address)

@app.post("/chat")
@limiter.limit("10/minute")
async def chat_endpoint(request: ChatRequest):
    # ...
```

4. **Input Validation**
```python
from pydantic import BaseModel, validator

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    
    @validator('message')
    def message_not_empty(cls, v):
        if not v.strip():
            raise ValueError('Message cannot be empty')
        return v
```

5. **HTTPS Only**
- Deploy with SSL/TLS certificates
- Use secure cookies for sessions

---

## ⚡ Performance Optimization

### Frontend Optimizations

1. **Debouncing**
```javascript
// Debounce chart rendering
const debouncedRender = debounce(generateAdvancedCharts, 300);
```

2. **Lazy Loading**
- Charts render only when data is available
- Images load on demand

3. **Caching**
```javascript
// Cache session ID
localStorage.setItem('aura_session_id', sessionId);
```

### Backend Optimizations

1. **Async Operations**
```python
async def chat_endpoint(request: ChatRequest):
    # Non-blocking I/O
```

2. **Connection Pooling**
- Reuse API connections
- Implement connection limits

3. **Response Compression**
```python
from fastapi.middleware.gzip import GZipMiddleware
app.add_middleware(GZipMiddleware, minimum_size=1000)
```

4. **Caching Strategy**
```python
from functools import lru_cache

@lru_cache(maxsize=100)
def get_company_data(company_name):
    # Cache frequently requested companies
```

---

## 🚀 Future Enhancements

### Planned Features

1. **Multi-Language Support**
   - Detect user language
   - Translate responses

2. **Advanced Analytics**
   - Competitor comparison matrices
   - Industry trend analysis
   - Predictive insights

3. **Collaboration Features**
   - Share research sessions
   - Team workspaces
   - Comment threads

4. **Integration Ecosystem**
   - CRM integration (Salesforce, HubSpot)
   - Slack/Teams notifications
   - Calendar scheduling

5. **Enhanced Visualizations**
   - Interactive 3D charts
   - Network graphs for relationships
   - Timeline visualizations

6. **Mobile App**
   - Native iOS/Android apps
   - Offline mode
   - Push notifications

7. **Advanced AI Features**
   - Multi-modal input (images, documents)
   - Automated report generation
   - Predictive lead scoring

---

## 📊 Technical Specifications

### Performance Metrics

- **Response Time**: < 3 seconds (average)
- **Chart Rendering**: < 500ms
- **Audio Latency**: < 100ms
- **Session Persistence**: 24 hours

### Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Edge 90+
- ✅ Safari 14+

### API Rate Limits

- **Gemini**: 60 requests/minute
- **Tavily**: 100 searches/day (free tier)

---

## 🧪 Testing Strategy

### Unit Tests
```python
def test_extract_company_name():
    agent = ResearchAgent()
    result = agent.extract_company_name("Research Tesla")
    assert result == "Tesla"
```

### Integration Tests
```python
@pytest.mark.asyncio
async def test_chat_endpoint():
    response = await client.post("/chat", json={
        "message": "Research Tesla"
    })
    assert response.status_code == 200
    assert "response" in response.json()
```

### E2E Tests
- Selenium/Playwright for browser automation
- Test complete user flows
- Voice interaction testing

---

## 📚 References

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Google Gemini API](https://ai.google.dev/)
- [Tavily API Docs](https://docs.tavily.com/)
- [Chart.js Documentation](https://www.chartjs.org/)
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)

---


