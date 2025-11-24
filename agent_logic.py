import os
import google.generativeai as genai
from tavily import TavilyClient
import json
import re
from datetime import datetime
import requests
from bs4 import BeautifulSoup
from urllib.parse import urlparse

# API Keys (Embedded as requested)
GEMINI_API_KEY = "YOUR_GEMINI_API_KEY"
TAVILY_API_KEY = "YOUR_TAVILY_API_KEY"

# Configure Gemini
genai.configure(api_key=GEMINI_API_KEY)

# Configure Tavily
tavily_client = TavilyClient(api_key=TAVILY_API_KEY)

class ResearchAgent:
    def __init__(self):
        self.model = genai.GenerativeModel('gemini-2.0-flash')
        self.conversation_history = []
        self.research_data = {}  # Store extracted data for visualizations
        self.system_prompt = """
You are Aura, an advanced, intelligent, and engaging Company Research Assistant.
Your goal is to help users research companies, analyze markets, and build detailed account plans with rich data visualizations.

**YOUR PERSONALITY:**
- You are professional yet warm, engaging, and slightly futuristic.
- You love data and insights.
- You are "Aura" - think of yourself as a high-tech digital companion.

**ADAPTIVE BEHAVIOR (PERSONAS):**
1.  **The Confused User** (Unsure, vague):
    - *Behavior*: Be helpful and guiding. Ask ONE clarifying question if absolutely necessary, but prefer to make a reasonable best guess and provide initial value.
    - *Example*: "I see you're interested in tech. Shall we look at Apple or Microsoft to start?"
2.  **The Efficient User** (Quick results, short queries):
    - *Behavior*: Be extremely concise. Use bullet points. Focus on numbers and hard facts. No fluff.
    - *Example*: "Here are Nvidia's Q3 metrics: Revenue $18B (+200% YoY), Margin 75%."
3.  **The Chatty User** (Conversational, off-topic):
    - *Behavior*: Be friendly and acknowledge their chat, but gently steer back to business.
    - *Example*: "That's a great point! Speaking of trends, this aligns with Tesla's new strategy..."
4.  **The Edge Case User** (Invalid inputs, off-topic, impossible requests):
    - *Behavior*: Gracefully handle errors. If a request is impossible (e.g., "Predict stock price in 2050"), explain why and offer a realistic alternative. If off-topic, politely remind them of your purpose.

**CORE RULES:**
- **Research First**: If you have search results, use them. Don't ask for permission.
- **Data Visualization**: ALWAYS structure your responses with Markdown headers (## Topic) and look for tables/metrics to extract.
- **Account Plans**: When asked, generate a structured plan: Executive Summary, Overview, Priorities, Decision Makers, Opportunities, Action Plan.
- **Transparency**: If you don't know, say so. Don't hallucinate data.

**FORMATTING:**
- Use Markdown headers (##) for sections.
- Use bullet points for lists.
- **Bold** key metrics.
"""

    def search_company(self, query):
        """Searches for company information using Tavily with enhanced accuracy."""
        print(f"Searching for: {query}")
        try:
            # Perform multiple targeted searches for better accuracy
            all_results = []
            
            # Search 1: General company info
            response1 = tavily_client.search(query, search_depth="advanced", max_results=3)
            all_results.extend(response1.get('results', []))
            
            # Search 2: Recent news and updates
            company_name = query.split()[0]  # Extract company name
            response2 = tavily_client.search(
                f"{company_name} latest news financial results 2024 2025", 
                search_depth="advanced", 
                max_results=3
            )
            all_results.extend(response2.get('results', []))
            
            # Search 3: Financial metrics
            response3 = tavily_client.search(
                f"{company_name} revenue earnings market cap stock price", 
                search_depth="advanced", 
                max_results=2
            )
            all_results.extend(response3.get('results', []))
            
            # Combine and format results
            context = "\n\n".join([
                f"**{result['title']}**\n{result['content']}\nSource: {result.get('url', 'N/A')}" 
                for result in all_results
            ])
            
            return context
        except Exception as e:
            print(f"Error performing search: {str(e)}")
            return f"Error performing search: {str(e)}"

    def should_search(self, user_message):
        """Determine if we need to search based on keywords."""
        search_keywords = ['research', 'find', 'look up', 'tell me about', 'information about', 
                          'details on', 'analyze', 'account plan', 'company', 'insights',
                          'performance', 'financial', 'market', 'strategy', 'competitors',
                          'revenue', 'growth', 'about', 'show me', 'what', 'how']
        message_lower = user_message.lower()
        
        # Always search if message is longer than 3 words and contains company-related terms
        if len(user_message.split()) >= 2:
            for keyword in search_keywords:
                if keyword in message_lower:
                    return True
        
        # Also search if message contains capitalized words (likely company names)
        words = user_message.split()
        for word in words:
            if word[0].isupper() and len(word) > 2 and word.lower() not in ['i', 'a', 'the']:
                return True
        
        return False

    def extract_company_name(self, user_message):
        """Extract company name from user message."""
        # Simple extraction - look for capitalized words or known patterns
        words = user_message.split()
        for i, word in enumerate(words):
            if word.lower() in ['research', 'about', 'on', 'for']:
                if i + 1 < len(words):
                    return ' '.join(words[i+1:]).strip('.,!?')
        
        # Fallback: return the whole message if it's short
        if len(words) <= 3:
            return user_message.strip('.,!?')
        
        return user_message

    def scrape_company_website(self, company_name):
        """Scrape company website for additional information."""
        try:
            # Try to find company website
            search_query = f"{company_name} official website"
            response = tavily_client.search(search_query, max_results=1)
            
            if not response.get('results'):
                return None
            
            url = response['results'][0].get('url', '')
            if not url:
                return None
            
            print(f"Scraping website: {url}")
            
            # Fetch the webpage
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
            page_response = requests.get(url, headers=headers, timeout=10)
            page_response.raise_for_status()
            
            # Parse with BeautifulSoup
            soup = BeautifulSoup(page_response.content, 'lxml')
            
            # Extract key information
            scraped_data = {
                'url': url,
                'title': soup.title.string if soup.title else '',
                'description': '',
                'key_points': []
            }
            
            # Get meta description
            meta_desc = soup.find('meta', attrs={'name': 'description'})
            if meta_desc:
                scraped_data['description'] = meta_desc.get('content', '')
            
            # Extract main text content (limit to first 1000 chars)
            paragraphs = soup.find_all('p')
            text_content = ' '.join([p.get_text().strip() for p in paragraphs[:10]])
            scraped_data['key_points'] = text_content[:1000]
            
            return scraped_data
            
        except Exception as e:
            print(f"Error scraping website: {e}")
            return None

    def detect_conflicts(self, text, company_name):
        """Detect conflicting numeric values across sources."""
        conflicts = []
        
        # Extract all revenue mentions with sources
        revenue_pattern = r'(?:revenue|sales)[:\s]+\$?([0-9,.]+)\s*(billion|million|B|M)'
        revenue_matches = re.finditer(revenue_pattern, text, re.IGNORECASE)
        
        revenue_values = []
        for match in revenue_matches:
            value = float(match.group(1).replace(',', ''))
            unit = match.group(2).upper()
            if 'B' in unit or 'BILLION' in unit:
                value *= 1000  # Convert to millions
            revenue_values.append(value)
        
        # Check for significant variance (>20%)
        if len(revenue_values) >= 2:
            max_val = max(revenue_values)
            min_val = min(revenue_values)
            variance = ((max_val - min_val) / min_val) * 100 if min_val > 0 else 0
            
            if variance > 20:
                conflicts.append({
                    'metric': 'Revenue',
                    'values': revenue_values,
                    'variance': round(variance, 1),
                    'message': f"⚠️ **Data Conflict Detected**: Revenue figures vary by {round(variance, 1)}% across sources ({min_val}M vs {max_val}M). Would you like me to investigate further?"
                })
        
        # Similar logic for market cap
        market_cap_pattern = r'market\s+cap[:\s]+\$?([0-9,.]+)\s*(billion|million|trillion|B|M|T)'
        market_cap_matches = re.finditer(market_cap_pattern, text, re.IGNORECASE)
        
        market_cap_values = []
        for match in market_cap_matches:
            value = float(match.group(1).replace(',', ''))
            unit = match.group(2).upper()
            if 'B' in unit or 'BILLION' in unit:
                value *= 1000
            elif 'T' in unit or 'TRILLION' in unit:
                value *= 1000000
            market_cap_values.append(value)
        
        if len(market_cap_values) >= 2:
            max_val = max(market_cap_values)
            min_val = min(market_cap_values)
            variance = ((max_val - min_val) / min_val) * 100 if min_val > 0 else 0
            
            if variance > 20:
                conflicts.append({
                    'metric': 'Market Cap',
                    'values': market_cap_values,
                    'variance': round(variance, 1),
                    'message': f"⚠️ **Data Conflict Detected**: Market cap figures vary by {round(variance, 1)}% across sources. Would you like me to verify this data?"
                })
        
        return conflicts

    def extract_structured_data(self, text, company_name):
        """Extract structured data from research results for visualizations."""
        data = {
            'company': company_name,
            'timestamp': datetime.now().isoformat(),
            'metrics': {},
            'trends': [],
            'competitors': [],
            'sentiment': {},
            'priorities': [],
            'opportunities': [],
            'confidence_score': 0,
            'reliability_score': 0,
            'sources': [],
            'recent_news': [],
            'conflicts': [],
            'scraped_info': None
        }
        
        # Calculate Confidence & Reliability Scores (Mock logic based on data richness)
        # In a real app, this would check source authority and data consistency
        data['confidence_score'] = min(98, 70 + (len(text) // 100))  # Higher for more text
        data['reliability_score'] = min(95, 80 + (text.count('$') * 2)) # Higher for more financial data

        # Extract Sources (URLs)
        # We need to pass raw results to do this properly, but for now we'll extract from text if available
        # or we can modify the caller to pass sources.
        # Let's try to find "Source: url" patterns in the text
        source_pattern = r'Source: (https?://[^\s]+)'
        found_sources = re.findall(source_pattern, text)
        data['sources'] = list(set(found_sources))[:3] # Top 3 unique sources

        # Extract Recent News (looking for dates or "news" keywords near company name)
        # This is a simple heuristic
        news_pattern = r'\*\*(.*?)\*\*' # Extract titles from our formatted text
        potential_news = re.findall(news_pattern, text)
        # Filter for news-like titles
        data['recent_news'] = [title for title in potential_news if any(x in title.lower() for x in ['launch', 'announce', 'report', 'release', 'hit', 'reach', 'new'])]
        data['recent_news'] = data['recent_news'][:2] # Top 2 news items
        
        # Detect conflicts in data
        conflicts = self.detect_conflicts(text, company_name)
        data['conflicts'] = conflicts
        
        # Enhanced financial metrics extraction with multiple patterns
        
        # Revenue extraction (multiple formats)
        revenue_patterns = [
            r'revenue[:\s]+\$?([0-9,.]+)\s*(billion|million|B|M|trillion|T)',
            r'sales[:\s]+\$?([0-9,.]+)\s*(billion|million|B|M)',
            r'total revenue[:\s]+\$?([0-9,.]+)\s*(billion|million|B|M)',
            r'\$([0-9,.]+)\s*(billion|million|B|M)\s+(?:in\s+)?revenue'
        ]
        
        for pattern in revenue_patterns:
            revenue_match = re.search(pattern, text, re.IGNORECASE)
            if revenue_match:
                value = float(revenue_match.group(1).replace(',', ''))
                unit = revenue_match.group(2).upper()
                if 'B' in unit or 'BILLION' in unit:
                    value *= 1000
                elif 'T' in unit or 'TRILLION' in unit:
                    value *= 1000000
                data['metrics']['Revenue (M)'] = round(value, 2)
                break
        
        # Market cap extraction
        market_cap_patterns = [
            r'market\s+cap(?:italization)?[:\s]+\$?([0-9,.]+)\s*(billion|million|trillion|B|M|T)',
            r'valued\s+at[:\s]+\$?([0-9,.]+)\s*(billion|million|trillion|B|M|T)',
            r'worth[:\s]+\$?([0-9,.]+)\s*(billion|million|trillion|B|M|T)'
        ]
        
        for pattern in market_cap_patterns:
            cap_match = re.search(pattern, text, re.IGNORECASE)
            if cap_match:
                value = float(cap_match.group(1).replace(',', ''))
                unit = cap_match.group(2).upper()
                if 'B' in unit or 'BILLION' in unit:
                    value *= 1000
                elif 'T' in unit or 'TRILLION' in unit:
                    value *= 1000000
                data['metrics']['Market Cap (M)'] = round(value, 2)
                break
        
        # Growth rate extraction
        growth_patterns = [
            r'growth[:\s]+([0-9.]+)%',
            r'grew[:\s]+([0-9.]+)%',
            r'increased[:\s]+([0-9.]+)%',
            r'([0-9.]+)%\s+growth'
        ]
        
        for pattern in growth_patterns:
            growth_match = re.search(pattern, text, re.IGNORECASE)
            if growth_match:
                data['metrics']['Growth Rate (%)'] = float(growth_match.group(1))
                break
        
        # Market share extraction
        market_share_patterns = [
            r'market\s+share[:\s]+([0-9.]+)%',
            r'([0-9.]+)%\s+(?:of\s+the\s+)?market\s+share',
            r'holds[:\s]+([0-9.]+)%'
        ]
        
        for pattern in market_share_patterns:
            market_share_match = re.search(pattern, text, re.IGNORECASE)
            if market_share_match:
                data['metrics']['Market Share (%)'] = float(market_share_match.group(1))
                break
        
        # Profit/Earnings extraction
        profit_patterns = [
            r'(?:net\s+)?profit[:\s]+\$?([0-9,.]+)\s*(billion|million|B|M)',
            r'earnings[:\s]+\$?([0-9,.]+)\s*(billion|million|B|M)',
            r'net\s+income[:\s]+\$?([0-9,.]+)\s*(billion|million|B|M)'
        ]
        
        for pattern in profit_patterns:
            profit_match = re.search(pattern, text, re.IGNORECASE)
            if profit_match:
                value = float(profit_match.group(1).replace(',', ''))
                unit = profit_match.group(2).upper()
                if 'B' in unit or 'BILLION' in unit:
                    value *= 1000
                data['metrics']['Profit (M)'] = round(value, 2)
                break
        
        # Employee count extraction
        employee_patterns = [
            r'([0-9,]+)\s+employees',
            r'employs[:\s]+([0-9,]+)',
            r'workforce[:\s]+([0-9,]+)'
        ]
        
        for pattern in employee_patterns:
            employee_match = re.search(pattern, text, re.IGNORECASE)
            if employee_match:
                data['metrics']['Employees'] = int(employee_match.group(1).replace(',', ''))
                break
        
        # Extract year-over-year data with better patterns
        year_patterns = [
            r'(20\d{2})[:\s]+\$?([0-9,.]+)\s*(?:billion|million|B|M)?',
            r'(?:in|for)\s+(20\d{2})[,:\s]+(?:revenue|sales|earnings)[:\s]+\$?([0-9,.]+)',
            r'FY\s*(20\d{2})[:\s]+\$?([0-9,.]+)'
        ]
        
        for pattern in year_patterns:
            for match in re.finditer(pattern, text, re.IGNORECASE):
                year = match.group(1)
                value = float(match.group(2).replace(',', ''))
                # Avoid duplicates
                if not any(t['year'] == year for t in data['trends']):
                    data['trends'].append({
                        'year': year,
                        'value': value
                    })
        
        # Sort trends by year
        data['trends'] = sorted(data['trends'], key=lambda x: x['year'])
        
        # Extract competitors with better patterns
        competitor_patterns = [
            r'(?:compet(?:es|ing)\s+(?:with|against))[:\s]+([A-Z][a-zA-Z\s,&]+?)(?:\.|,|\s+and\s+)',
            r'(?:rivals?|competitors?)[:\s]+(?:include|such as|like)[:\s]+([A-Z][a-zA-Z\s,&]+?)(?:\.|;)',
            r'(?:vs|versus|compared to)[:\s]+([A-Z][a-zA-Z]+)',
            r'([A-Z][a-zA-Z]+)(?:\s+and\s+[A-Z][a-zA-Z]+)*\s+are\s+(?:main\s+)?competitors'
        ]
        
        for pattern in competitor_patterns:
            matches = re.finditer(pattern, text)
            for match in matches:
                competitors_text = match.group(1)
                # Split by common delimiters
                competitors = re.split(r',\s*|\s+and\s+', competitors_text)
                for comp in competitors:
                    comp = comp.strip()
                    # Filter out common words and keep only proper names
                    if comp and len(comp) > 2 and comp[0].isupper() and comp not in data['competitors']:
                        # Limit to reasonable company names
                        if len(comp.split()) <= 3:
                            data['competitors'].append(comp)
        
        # Limit competitors to top 5
        # Limit competitors to top 5
        data['competitors'] = data['competitors'][:5]

        # Extract Strategic Priorities
        priorities_match = re.search(r'##\s*(?:Strategic\s+)?Priorities\s*\n((?:[-*].+\n?)+)', text, re.IGNORECASE)
        if priorities_match:
            priorities_text = priorities_match.group(1)
            priorities = [p.strip('-* ').strip() for p in priorities_text.split('\n') if p.strip()]
            data['priorities'] = priorities[:5]  # Top 5 priorities

        # Extract Opportunities
        opportunities_match = re.search(r'##\s*Opportunities\s*\n((?:[-*].+\n?)+)', text, re.IGNORECASE)
        if opportunities_match:
            opportunities_text = opportunities_match.group(1)
            opportunities = [o.strip('-* ').strip() for o in opportunities_text.split('\n') if o.strip()]
            data['opportunities'] = opportunities[:5]  # Top 5 opportunities
        
        # Enhanced sentiment analysis
        positive_keywords = ['growth', 'increase', 'profit', 'success', 'innovation', 'leader', 
                           'strong', 'positive', 'gain', 'rise', 'surge', 'boom', 'expansion',
                           'breakthrough', 'dominant', 'outperform', 'record', 'milestone']
        negative_keywords = ['decline', 'loss', 'challenge', 'risk', 'decrease', 'weak', 
                           'concern', 'fall', 'drop', 'struggle', 'threat', 'downturn',
                           'layoff', 'cut', 'reduce', 'problem', 'issue']
        
        text_lower = text.lower()
        positive_count = sum(text_lower.count(word) for word in positive_keywords)
        negative_count = sum(text_lower.count(word) for word in negative_keywords)
        
        total = positive_count + negative_count
        if total > 0:
            positive_pct = round((positive_count / total) * 100, 1)
            negative_pct = round((negative_count / total) * 100, 1)
            neutral_pct = round(100 - positive_pct - negative_pct, 1)
            
            data['sentiment'] = {
                'positive': max(0, positive_pct),
                'negative': max(0, negative_pct),
                'neutral': max(0, neutral_pct)
            }
        
        return data

    def extract_tables_from_text(self, text):
        """Extract data from markdown tables in the text."""
        tables_data = []
        
        # Find markdown tables
        lines = text.split('\n')
        i = 0
        while i < len(lines):
            line = lines[i].strip()
            
            # Check if this line looks like a table header (contains |)
            if '|' in line and i + 1 < len(lines):
                # Check if next line is a separator (contains dashes)
                separator = lines[i + 1].strip()
                if '|' in separator and ('-' in separator or ':' in separator):
                    # Found a table!
                    headers = [h.strip() for h in line.split('|') if h.strip()]
                    
                    # Extract table rows
                    rows = []
                    j = i + 2
                    while j < len(lines):
                        row_line = lines[j].strip()
                        if '|' not in row_line or not row_line:
                            break
                        row_data = [cell.strip() for cell in row_line.split('|') if cell.strip()]
                        if row_data:
                            rows.append(row_data)
                        j += 1
                    
                    if rows:
                        tables_data.append({
                            'headers': headers,
                            'rows': rows
                        })
                    
                    i = j
                    continue
            i += 1
        
        return tables_data

    def parse_table_to_chart_data(self, table):
        """Convert table data to chart-friendly format."""
        headers = table['headers']
        rows = table['rows']
        
        if len(headers) < 2 or len(rows) == 0:
            return None
        
        chart_data = {
            'labels': [],
            'datasets': []
        }
        
        # Assume first column is labels (dates, categories, etc.)
        for row in rows:
            if len(row) > 0:
                chart_data['labels'].append(row[0])
        
        # Other columns are data series
        for col_idx in range(1, len(headers)):
            dataset = {
                'label': headers[col_idx],
                'data': []
            }
            
            for row in rows:
                if len(row) > col_idx:
                    # Try to parse as number
                    value_str = row[col_idx].replace('$', '').replace(',', '').replace('%', '').strip()
                    try:
                        # Handle different number formats
                        if 'Billion' in row[col_idx] or 'B' in row[col_idx]:
                            value = float(value_str.split()[0]) * 1000
                        elif 'Million' in row[col_idx] or 'M' in row[col_idx]:
                            value = float(value_str.split()[0])
                        elif 'Trillion' in row[col_idx] or 'T' in row[col_idx]:
                            value = float(value_str.split()[0]) * 1000000
                        else:
                            value = float(value_str)
                        dataset['data'].append(value)
                    except:
                        # If not a number, skip this dataset
                        dataset['data'].append(0)
            
            if dataset['data']:
                chart_data['datasets'].append(dataset)
        
        return chart_data if chart_data['datasets'] else None

    def process_message(self, user_message):
        """
        Processes the user message with enhanced data extraction and conversation memory.
        """
        try:
            # Add user message to history
            self.conversation_history.append({
                "role": "user",
                "parts": [user_message]
            })
            
            # Check if we should search
            if self.should_search(user_message):
                print("DEBUG: Starting search...")
                company_name = self.extract_company_name(user_message)
                print(f"DEBUG: Extracted company name: {company_name}")
                
                # Perform search
                search_results = self.search_company(f"{company_name} company overview news financials strategy market share competitors")
                print(f"DEBUG: Search results length: {len(str(search_results))}")
                
                # Scrape company website for additional info
                scraped_data = self.scrape_company_website(company_name)
                if scraped_data:
                    print(f"DEBUG: Scraped website data from {scraped_data['url']}")
                    # Append scraped data to search results
                    search_results += f"\n\n**Website Information ({scraped_data['url']}):**\n"
                    search_results += f"Title: {scraped_data['title']}\n"
                    search_results += f"Description: {scraped_data['description']}\n"
                    search_results += f"Content: {scraped_data['key_points']}\n"
                
                # Extract structured data for visualizations
                print("DEBUG: Extracting structured data...")
                try:
                    structured_data = self.extract_structured_data(search_results, company_name)
                    if scraped_data:
                        structured_data['scraped_info'] = scraped_data
                    print("DEBUG: Structured data extracted successfully.")
                except Exception as e:
                    print(f"DEBUG: Error in extract_structured_data: {e}")
                    import traceback
                    traceback.print_exc()
                    structured_data = {}

                self.research_data[company_name] = structured_data
                
                # Build context for LLM with search results
                context = f"""User asked: "{user_message}"

I have searched for information about {company_name}. Here are the results:

{search_results}

Please synthesize these results into a helpful response. Remember to:
1. Use Markdown headers (## Topic) for key sections
2. Adapt to the user's tone
3. Be clear and structured
4. Include specific numbers, metrics, and data points
5. If they asked for an account plan, generate one with proper sections
6. Mention key financial metrics, growth trends, and competitive positioning when available
7. Reference previous conversation context if relevant
"""

                
                # Create chat with full history
                chat_history = [
                    {"role": "user", "parts": [self.system_prompt]},
                    {"role": "model", "parts": ["Understood. I'm ready to help with company research and data analysis."]}
                ] + self.conversation_history[:-1]  # Exclude the current message as we'll send it separately
                
                chat = self.model.start_chat(history=chat_history)
                response = chat.send_message(context)
                
                # Add assistant response to history
                try:
                    response_text = response.text
                except Exception as e:
                    print(f"Gemini safety error or empty response: {e}")
                    response_text = "I apologize, but I was unable to generate a response. This might be due to safety filters or an API issue. Please try rephrasing your request."

                self.conversation_history.append({
                    "role": "model",
                    "parts": [response_text]
                })
                
                # Extract tables from the response for auto-chart generation
                tables = self.extract_tables_from_text(response_text)
                if tables and structured_data:
                    structured_data['tables'] = []
                    for table in tables:
                        chart_data = self.parse_table_to_chart_data(table)
                        if chart_data:
                            structured_data['tables'].append({
                                'headers': table['headers'],
                                'rows': table['rows'],
                                'chart_data': chart_data
                            })
                
                # Return both the text response and structured data
                return {
                    'text': response.text,
                    'data': structured_data
                }
            
            else:
                # Direct conversation without search - use conversation history
                chat_history = [
                    {"role": "user", "parts": [self.system_prompt]},
                    {"role": "model", "parts": ["Understood. I'm ready to help with company research and data analysis."]}
                ] + self.conversation_history[:-1]  # Exclude the current message
                
                chat = self.model.start_chat(history=chat_history)
                response = chat.send_message(user_message)
                
                # Add assistant response to history
                try:
                    response_text = response.text
                except Exception as e:
                    print(f"Gemini safety error or empty response: {e}")
                    response_text = "I apologize, but I was unable to generate a response. This might be due to safety filters or an API issue. Please try rephrasing your request."

                self.conversation_history.append({
                    "role": "model",
                    "parts": [response_text]
                })
                
                return {
                    'text': response_text,
                    'data': None
                }

        except Exception as e:
            print(f"Error in logic: {e}")
            import traceback
            traceback.print_exc()
            with open("error_log.txt", "w") as f:
                f.write(f"Error: {str(e)}\n")
                traceback.print_exc(file=f)
            return {
                'text': "I encountered an error processing your request. Please try again or rephrase your question.",
                'data': None
            }
