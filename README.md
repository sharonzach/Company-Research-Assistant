# 🚀 Aura - AI-Powered Company Research Assistant

> **An intelligent conversational AI agent that researches companies, synthesizes information from multiple sources, and generates comprehensive account plans with stunning visualizations.**

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Python](https://img.shields.io/badge/python-3.8+-green.svg)
![License](https://img.shields.io/badge/license-MIT-orange.svg)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [API Keys](#api-keys)
- [Demo Video](#demo-video)
- [Contributing](#contributing)

---

## 🎯 Overview

**Aura** is a next-generation AI research assistant designed to help sales teams, analysts, and business professionals quickly gather comprehensive intelligence about companies. It combines the power of **Google's Gemini 2.0 Flash** for natural language understanding and **Tavily API** for real-time web research to deliver accurate, structured insights.

### What Makes Aura Special?

- 🎨 **Beautiful Dark Neon UI** - Modern, engaging interface with glassmorphism and smooth animations
- 🧠 **Adaptive Persona System** - Automatically adjusts responses based on user behavior (Confused, Efficient, Chatty, Edge Case)
- 📊 **Live Insights Dashboard** - Real-time charts, metrics, and visualizations
- 🔊 **Voice Interaction** - Speech-to-text input and text-to-speech output with pause/resume controls
- 📰 **Live News Injection** - Automatically highlights recent company news and milestones
- 🎯 **Confidence Scoring** - Displays trust scores and source rankings for transparency
- 📄 **Export Capabilities** - Download insights as Markdown or PDF
- 💾 **Conversation Memory** - Maintains context across sessions

---

## ✨ Key Features

### 🔍 Intelligent Research
- **Multi-Source Search**: Aggregates data from multiple authoritative sources
- **Structured Data Extraction**: Automatically extracts financial metrics, competitors, trends, and sentiment
- **Account Plan Generation**: Creates comprehensive account plans with executive summaries, priorities, and action items

### 📊 Visual Analytics
- **Dynamic Charts**: Bar charts for metrics, doughnut charts for sentiment, line charts for trends
- **Trust Score Badge**: Displays confidence percentage and reliability scores
- **Source Ranking**: Shows top 3 most trustworthy sources with clickable links
- **News Flash Cards**: Highlights recent achievements and announcements

### 🎙️ Voice & Audio
- **Speech Recognition**: Click the microphone to speak your queries
- **Auto-Play Responses**: Bot responses are automatically read aloud
- **Pause/Resume Controls**: Full control over audio playback
- **Audio Toggle**: Enable/disable auto-play from the header

### 💡 User Experience
- **Quick Facts Popup**: Displays interesting facts while processing requests
- **Suggestion Chips**: Quick-start queries for common research tasks
- **Responsive Design**: Works seamlessly on desktop and tablet
- **Dark Theme**: Eye-friendly neon-accented dark mode

---

## 🛠️ Technology Stack

### Backend
- **Python 3.8+**
- **FastAPI** - High-performance web framework
- **Google Generative AI (Gemini 2.0 Flash)** - Advanced language model
- **Tavily API** - Real-time web search and research

### Frontend
- **HTML5 / CSS3 / JavaScript (ES6+)**
- **Chart.js** - Data visualization
- **Marked.js** - Markdown parsing
- **jsPDF & html2canvas** - PDF export
- **Web Speech API** - Voice recognition and synthesis
- **Font Awesome** - Icons

### Styling
- **Custom CSS** with CSS Variables
- **Glassmorphism** effects
- **Neon glow** animations
- **Smooth transitions** and micro-interactions

---

## 📦 Installation

### Prerequisites
- Python 3.8 or higher
- pip (Python package manager)
- Modern web browser (Chrome, Firefox, Edge)

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd "EIGHTFOLD AI"
```

### Step 2: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 3: Configure API Keys
Edit `agent_logic.py` and add your API keys:
```python
GEMINI_API_KEY = "your-gemini-api-key-here"
TAVILY_API_KEY = "your-tavily-api-key-here"
```

### Step 4: Run the Application
```bash
python app.py
```

Or use the provided batch file:
```bash
run.bat
```

### Step 5: Open in Browser
Navigate to: `http://localhost:8000`

---

## ⚙️ Configuration

### API Keys

#### Google Gemini API
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy and paste into `agent_logic.py`

#### Tavily API
1. Visit [Tavily](https://tavily.com/)
2. Sign up for a free account
3. Get your API key from the dashboard
4. Copy and paste into `agent_logic.py`

### Environment Variables (Optional)
For production, use environment variables instead of hardcoding:
```python
import os
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")
```

---

## 🎮 Usage

### Basic Research Query
1. Type or speak: **"Research Tesla's financial performance"**
2. Watch the "Did You Know?" popup while Aura processes
3. View the comprehensive response with:
   - Financial metrics
   - Market analysis
   - Competitive landscape
   - Recent news

### Generate Account Plan
1. Ask: **"Create an account plan for Microsoft"**
2. Receive a structured plan with:
   - Executive Summary
   - Company Overview
   - Strategic Priorities
   - Key Decision Makers
   - Opportunities
   - Action Plan

### Voice Interaction
1. Click the **microphone icon** in the input area
2. Speak your query
3. Click again to stop recording
4. The query will be automatically submitted

### Export Results
- **Markdown**: Click "Export MD" on any bot response
- **PDF**: Click "Export PDF" to download a formatted report with charts

### Audio Controls
- **Auto-Play Toggle**: Click the volume icon in the header
- **Pause/Resume**: Use the controls on each message
- **Listen**: Click to hear any response again

---

## 📁 Project Structure

```
EIGHTFOLD AI/
│
├── app.py                 # FastAPI application entry point
├── agent_logic.py         # Core AI agent logic and research functions
├── requirements.txt       # Python dependencies
├── run.bat               # Windows startup script
│
├── templates/
│   └── index.html        # Main HTML template
│
├── static/
│   ├── css/
│   │   └── style.css     # All styling (dark theme, animations, layouts)
│   │
│   └── js/
│       └── main.js       # Frontend logic (UI, charts, audio, exports)
│
├── README.md             # This file
└── ArchitectureDesign.md # Detailed system architecture
```

---

## 🔑 API Keys

**Important**: The current implementation has API keys embedded in `agent_logic.py`. For production deployment:

1. **Never commit API keys** to version control
2. Use environment variables or secret management services
3. Implement rate limiting and usage monitoring
4. Consider using API key rotation

---

## 🎥 Demo Video

A demo video showcasing Aura's capabilities with different user personas is available in the repository. The video demonstrates:

- ✅ Confused User: Patient, step-by-step guidance
- ✅ Efficient User: Quick, data-focused responses
- ✅ Chatty User: Friendly, conversational interactions
- ✅ Edge Case User: Graceful error handling

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- **Google Gemini** for the powerful language model
- **Tavily** for real-time web research capabilities
- **Chart.js** for beautiful data visualizations
- **Font Awesome** for the icon library

---

## 📧 Contact

For questions, suggestions, or support, please open an issue in the repository.

---

**Built with ❤️ for intelligent business research**
