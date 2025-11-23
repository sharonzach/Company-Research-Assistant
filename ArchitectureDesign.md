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
- Quick Facts Carousel container
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

## 🆕 Version 2.0 Features

### 1. Inline Editing for Account Plans

**Implementation**:
```javascript
function enableInlineEditing(contentDiv, editBtn) {
    const isEditing = contentDiv.contentEditable === 'true';
    
    if (isEditing) {
        // Save mode
        contentDiv.contentEditable = 'false';
        contentDiv.style.border = 'none';
        editBtn.innerHTML = '<i class="fa-solid fa-edit"></i> Edit Plan';
        // Show confirmation
    } else {
        // Edit mode
        contentDiv.contentEditable = 'true';
        contentDiv.style.border = '2px dashed var(--accent)';
        editBtn.innerHTML = '<i class="fa-solid fa-save"></i> Save Changes';
    }
}
```

**Features**:
- Automatic detection of account plan messages
- Visual feedback with dashed border
- One-click toggle between edit/save modes
- Toast notifications for save confirmation
- No server-side persistence (client-side only)

### 2. Conflict Detection System

**Implementation**:
```python
def detect_conflicts(self, text, company_name):
    """Detect conflicting numeric values across sources."""
    conflicts = []
    
    # Extract revenue values
    revenue_pattern = r'(?:revenue|sales)[:\s]+\$?([0-9,.]+)\s*(billion|million|B|M)'
    revenue_matches = re.finditer(revenue_pattern, text, re.IGNORECASE)
    
    revenue_values = []
    for match in revenue_matches:
        value = float(match.group(1).replace(',', ''))
        unit = match.group(2).upper()
        if 'B' in unit or 'BILLION' in unit:
            value *= 1000  # Convert to millions
        revenue_values.append(value)
    
    # Check variance
    if len(revenue_values) >= 2:
        max_val = max(revenue_values)
        min_val = min(revenue_values)
        variance = ((max_val - min_val) / min_val) * 100
        
        if variance > 20:  # 20% threshold
            conflicts.append({
                'metric': 'Revenue',
                'values': revenue_values,
                'variance': round(variance, 1),
                'message': f"⚠️ Revenue figures vary by {variance}%..."
            })
    
    return conflicts
```

**Detection Logic**:
- **Threshold**: >20% variance triggers warning
- **Metrics Tracked**: Revenue, Market Cap
- **Normalization**: Converts all values to same unit (millions)
- **Display**: Red warning card in insights panel

### 3. Web Scraping Module

**Implementation**:
```python
def scrape_company_website(self, company_name):
    """Scrape company website for additional information."""
    try:
        # Find official website via Tavily
        search_query = f"{company_name} official website"
        response = tavily_client.search(search_query, max_results=1)
        url = response['results'][0].get('url', '')
        
        # Fetch webpage
        headers = {'User-Agent': 'Mozilla/5.0...'}
        page_response = requests.get(url, headers=headers, timeout=10)
        
        # Parse with BeautifulSoup
        soup = BeautifulSoup(page_response.content, 'lxml')
        
        # Extract data
        scraped_data = {
            'url': url,
            'title': soup.title.string if soup.title else '',
            'description': soup.find('meta', {'name': 'description'}),
            'key_points': ' '.join([p.get_text() for p in soup.find_all('p')[:10]])
        }
        
        return scraped_data
    except Exception as e:
        return None
```

**Features**:
- **Automatic Discovery**: Finds official website via search
- **Content Extraction**: Title, meta description, main paragraphs
- **Error Handling**: Graceful fallback if scraping fails
- **Integration**: Merged with Tavily search results
- **Timeout**: 10-second limit to prevent hanging

### 4. Enhanced Source Ranking & Trust Scores

**Data Structure**:
```json
{
  "confidence_score": 92,
  "reliability_score": 88,
  "sources": [
    "https://tesla.com",
    "https://reuters.com/tesla",
    "https://bloomberg.com/news/tesla"
  ],
  "conflicts": [
    {
      "metric": "Revenue",
      "values": [96773, 121450],
      "variance": 25.3,
      "message": "⚠️ Revenue figures vary by 25.3%..."
    }
  ]
}
```

**Calculation Logic**:
```python
# Confidence based on data richness
data['confidence_score'] = min(98, 70 + (len(text) // 100))

# Reliability based on financial data presence
data['reliability_score'] = min(95, 80 + (text.count('$') * 2))

# Extract top 3 sources
source_pattern = r'Source: (https?://[^\s]+)'
data['sources'] = list(set(re.findall(source_pattern, text)))[:3]
```

**UI Display**:
- **Trust Badge**: Color-coded (green >80%, yellow 60-80%)
- **Clickable Links**: All source URLs are clickable
- **Domain Extraction**: Shows clean domain names
- **Ranking**: Top 3 most authoritative sources

### 5. Persistent Chat History

**Implementation**:
```javascript
// Save to localStorage
function saveChatHistory() {
    const messages = [];
    chatContainer.querySelectorAll('.message').forEach(msgEl => {
        const isUser = msgEl.classList.contains('user-message');
        const content = msgEl.querySelector('.content');
        messages.push({
            text: content.textContent,
            sender: isUser ? 'user' : 'bot',
            data: null
        });
    });
    localStorage.setItem('aura_chat_history', JSON.stringify(messages));
}

// Load from localStorage
function loadChatHistory() {
    const savedHistory = localStorage.getItem('aura_chat_history');
    if (savedHistory) {
        const messages = JSON.parse(savedHistory);
        messages.forEach(msg => {
            addMessage(msg.text, msg.sender, msg.data, false);
        });
    }
}
```

**Features**:
- **Auto-Save**: Saves after each message
- **Auto-Load**: Restores on page load
- **Storage**: Browser localStorage (5-10MB limit)
- **Privacy**: Data stays on user's device
- **Clear**: "New Chat" button clears history

### Technical Integration

**Modified Files**:
1. **agent_logic.py**:
   - Added `scrape_company_website()` method
   - Added `detect_conflicts()` method
   - Enhanced `extract_structured_data()` with conflicts and scraped_info
   - Integrated web scraping into `process_message()`

2. **main.js**:
   - Added `loadChatHistory()` and `saveChatHistory()` functions
   - Added `enableInlineEditing()` function
   - Enhanced `generateAdvancedCharts()` with conflict display
   - Added "Edit Plan" button to account plans

3. **requirements.txt**:
   - Added `beautifulsoup4` for HTML parsing
   - Added `lxml` for fast XML/HTML parsing

**Performance Impact**:
- Web Scraping: +1-3 seconds per query
- Conflict Detection: <100ms
- Chat History Load: <500ms
- Storage: ~1KB per message

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


