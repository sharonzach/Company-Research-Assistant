document.addEventListener('DOMContentLoaded', () => {
    const chatContainer = document.getElementById('chat-container');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const typingIndicator = document.getElementById('typing-indicator');
    const newChatBtn = document.getElementById('new-chat-btn');
    const voiceBtn = document.getElementById('voice-btn');
    const audioToggleBtn = document.getElementById('audio-toggle-btn');

    let sessionId = localStorage.getItem('aura_session_id');
    let currentUtterance = null;
    let isSpeaking = false;
    let recognition = null;
    let isListening = false;
    let isAutoPlayEnabled = true; // Default to true as per request

    // Load chat history from localStorage
    function loadChatHistory() {
        const savedHistory = localStorage.getItem('aura_chat_history');
        if (savedHistory) {
            try {
                const messages = JSON.parse(savedHistory);
                messages.forEach(msg => {
                    addMessage(msg.text, msg.sender, msg.data, false); // false = don't save again
                });
                console.log(`Loaded ${messages.length} messages from history`);
            } catch (e) {
                console.error('Error loading chat history:', e);
            }
        }
    }

    // Save chat history to localStorage
    function saveChatHistory() {
        const messages = [];
        const messageElements = chatContainer.querySelectorAll('.message');
        messageElements.forEach(msgEl => {
            const isUser = msgEl.classList.contains('user-message');
            const content = msgEl.querySelector('.content');
            if (content) {
                messages.push({
                    text: content.textContent || content.innerText,
                    sender: isUser ? 'user' : 'bot',
                    data: null // We'll store data separately if needed
                });
            }
        });
        localStorage.setItem('aura_chat_history', JSON.stringify(messages));
    }

    // Load history on page load
    loadChatHistory();

    // Initialize Speech Recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            isListening = true;
            voiceBtn.innerHTML = '<i class="fa-solid fa-microphone-slash"></i>';
            voiceBtn.style.color = '#e74c3c';
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            userInput.value = transcript;
            userInput.style.height = 'auto';
            userInput.style.height = (userInput.scrollHeight) + 'px';
        };

        recognition.onend = () => {
            isListening = false;
            voiceBtn.innerHTML = '<i class="fa-solid fa-microphone"></i>';
            voiceBtn.style.color = '';
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            isListening = false;
            voiceBtn.innerHTML = '<i class="fa-solid fa-microphone"></i>';
            voiceBtn.style.color = '';
        };
    }

    // Voice input button
    voiceBtn.addEventListener('click', () => {
        if (!recognition) {
            alert('Speech recognition is not supported in this browser.');
            return;
        }

        if (isListening) {
            recognition.stop();
        } else {
            recognition.start();
        }
    });

    // Audio Toggle Button
    if (audioToggleBtn) {
        audioToggleBtn.addEventListener('click', () => {
            isAutoPlayEnabled = !isAutoPlayEnabled;
            if (isAutoPlayEnabled) {
                audioToggleBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
                audioToggleBtn.style.color = 'var(--accent)';
            } else {
                audioToggleBtn.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
                audioToggleBtn.style.color = 'var(--text-secondary)';
            }
        });
        // Set initial state
        audioToggleBtn.style.color = 'var(--accent)';
    }

    // Auto-resize textarea
    userInput.addEventListener('input', function () {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
        if (this.value === '') this.style.height = 'auto';
    });

    // Send message on Enter (but Shift+Enter for new line)
    userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    sendBtn.addEventListener('click', sendMessage);

    newChatBtn.addEventListener('click', () => {
        // Clear session and chat history
        localStorage.removeItem('aura_session_id');
        localStorage.removeItem('aura_chat_history');
        location.reload();
    });

    // Handle suggestion chip clicks
    document.querySelectorAll('.suggestion-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const query = chip.getAttribute('data-query');
            userInput.value = query;
            sendMessage();
        });
    });

    // Quick Facts data
    const quickFacts = [
        "The global AI market is expected to reach $1.8 trillion by 2030",
        "Over 90% of Fortune 500 companies use AI in some capacity",
        "Tesla's market cap reached $1 trillion in 2021",
        "The average company uses 110 different SaaS applications",
        "Cloud computing market grows at 17% annually",
        "Microsoft Azure has 200+ data centers worldwide",
        "Apple's App Store has over 1.8 million apps",
        "Nvidia's GPUs power 90% of AI workloads",
        "Amazon Web Services controls 32% of cloud market",
        "Google processes 8.5 billion searches per day"
    ];

    function showQuickFact() {
        const popup = document.getElementById('quick-facts-popup');
        const message = document.getElementById('quick-facts-message');

        // Pick 3 unique random facts
        const shuffled = quickFacts.sort(() => 0.5 - Math.random());
        const selectedFacts = shuffled.slice(0, 3);

        let currentIndex = 0;

        // Function to display current fact
        function displayFact(index) {
            const fact = selectedFacts[index];

            let html = '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">';
            html += '<div class="quick-facts-title">💡 Did you know?</div>';
            html += '<button onclick="document.getElementById(\'quick-facts-popup\').style.display=\'none\'" style="background:none; border:none; color:white; cursor:pointer; font-size:1.2rem;"><i class="fa-solid fa-xmark"></i></button>';
            html += '</div>';

            // Single fact card with slide animation
            html += `<div class="fact-card" style="
                background: rgba(255,255,255,0.05);
                padding: 20px;
                border-radius: 12px;
                border: 1px solid rgba(255,255,255,0.1);
                min-height: 80px;
                display: flex;
                align-items: center;
                animation: slideIn 0.5s ease;
            ">
                <div style="font-size: 1rem; line-height: 1.6;">${fact}</div>
            </div>`;

            // Pagination dots
            html += '<div style="display: flex; justify-content: center; gap: 8px; margin-top: 15px;">';
            selectedFacts.forEach((_, i) => {
                const active = i === index ? 'background: var(--accent);' : 'background: rgba(255,255,255,0.3);';
                html += `<div style="width: 8px; height: 8px; border-radius: 50%; ${active} transition: all 0.3s;"></div>`;
            });
            html += '</div>';

            // Progress bar
            html += '<div class="progress-container" style="margin-top: 15px; height: 4px; background: rgba(255,255,255,0.2); border-radius: 2px; overflow: hidden;">';
            html += '<div class="progress-bar" style="height: 100%; background: var(--accent); width: 0%; transition: width 0.1s linear;"></div>';
            html += '</div>';

            message.innerHTML = html;
        }

        // Display first fact
        displayFact(currentIndex);
        popup.style.display = 'block';

        // Auto-rotate through facts
        const rotateInterval = setInterval(() => {
            currentIndex = (currentIndex + 1) % selectedFacts.length;
            displayFact(currentIndex);
        }, 4000); // Change fact every 4 seconds

        // Animate progress bar
        const progressBar = message.querySelector('.progress-bar');
        let width = 0;
        const progressInterval = setInterval(() => {
            if (!progressBar) {
                clearInterval(progressInterval);
                return;
            }
            if (width >= 100) {
                width = 0; // Reset for next fact
            } else {
                width += 2.5; // 100% in 4 seconds (2.5 * 40 = 100)
                progressBar.style.width = width + '%';
            }
        }, 100);

        // Store intervals to clear them later
        popup.dataset.rotateIntervalId = rotateInterval;
        popup.dataset.progressIntervalId = progressInterval;
    }
    function hideQuickFact() {
        const popup = document.getElementById('quick-facts-popup');
        if (popup) {
            popup.style.display = 'none';
            // Clear both intervals
            if (popup.dataset.rotateIntervalId) {
                clearInterval(popup.dataset.rotateIntervalId);
            }
            if (popup.dataset.progressIntervalId) {
                clearInterval(popup.dataset.progressIntervalId);
            }
        }
    }

    async function sendMessage() {
        const text = userInput.value.trim();
        if (!text) return;

        // Add user message
        addMessage(text, 'user');
        userInput.value = '';
        userInput.style.height = 'auto';

        // Show typing indicator and quick fact
        // Show typing indicator if it exists
        if (typingIndicator) {
            typingIndicator.classList.add('active');
        }

        try {
            showQuickFact();
        } catch (e) {
            console.error("Error showing quick fact:", e);
        }



        try {
            const payload = { message: text };
            if (sessionId) {
                payload.session_id = sessionId;
            }

            console.log("Sending message:", payload);

            const response = await fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            const data = await response.json();

            sessionId = data.session_id;
            localStorage.setItem('aura_session_id', sessionId);

            addMessage(data.response, 'bot', data.data);
        } catch (error) {
            console.error("Chat error:", error);
            addMessage('Error: ' + error.message + '. Please try again.', 'bot');
        } finally {
            // Hide typing indicator and quick fact
            if (typingIndicator) typingIndicator.classList.remove('active');

            // Clear progress interval
            const popup = document.getElementById('quick-facts-popup');
            if (popup && popup.dataset.intervalId) {
                clearInterval(popup.dataset.intervalId);
            }
            hideQuickFact();
        }
    }

    function addMessage(text, sender, structuredData = null, shouldSave = true) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;

        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'avatar';
        avatarDiv.innerHTML = sender === 'user' ? '<i class="fa-solid fa-user"></i>' : '<i class="fa-solid fa-robot"></i>';

        const contentDiv = document.createElement('div');
        contentDiv.className = 'content';

        // Parse Markdown for bot, plain text for user
        if (sender === 'bot') {
            contentDiv.innerHTML = marked.parse(text);
            updateSidebar(text, structuredData);

            // Add action buttons
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'message-actions';
            actionsDiv.style.cssText = 'margin-top: 10px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 8px; display: flex; gap: 10px;';

            // Speak button (will show pause when autoplaying)
            const speakBtn = document.createElement('button');
            speakBtn.className = 'icon-btn speak-control-btn';
            speakBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i> Listen';
            speakBtn.style.cssText = 'font-size: 0.8rem; color: var(--text-secondary);';
            speakBtn.onclick = () => speakText(text, speakBtn);

            // Copy button
            const copyBtn = document.createElement('button');
            copyBtn.className = 'icon-btn';
            copyBtn.innerHTML = '<i class="fa-solid fa-copy"></i> Copy';
            copyBtn.style.cssText = 'font-size: 0.8rem; color: var(--text-secondary);';
            copyBtn.onclick = () => {
                navigator.clipboard.writeText(text);
                copyBtn.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
                setTimeout(() => {
                    copyBtn.innerHTML = '<i class="fa-solid fa-copy"></i> Copy';
                }, 2000);
            };

            // Export button (Markdown)
            const exportBtn = document.createElement('button');
            exportBtn.className = 'icon-btn';
            exportBtn.innerHTML = '<i class="fa-solid fa-download"></i> Export MD';
            exportBtn.style.cssText = 'font-size: 0.8rem; color: var(--text-secondary);';
            exportBtn.onclick = () => exportAsMarkdown(text, structuredData);

            // PDF Export button
            const pdfExportBtn = document.createElement('button');
            pdfExportBtn.className = 'icon-btn';
            pdfExportBtn.innerHTML = '<i class="fa-solid fa-file-pdf"></i> Export PDF';
            pdfExportBtn.style.cssText = 'font-size: 0.8rem; color: var(--text-secondary);';
            pdfExportBtn.onclick = () => exportAsPDF(text, structuredData);

            // Edit Plan button (for account plans)
            if (text.toLowerCase().includes('account plan') || text.toLowerCase().includes('executive summary')) {
                const editBtn = document.createElement('button');
                editBtn.className = 'icon-btn';
                editBtn.innerHTML = '<i class="fa-solid fa-edit"></i> Edit Plan';
                editBtn.style.cssText = 'font-size: 0.8rem; color: var(--text-secondary);';
                editBtn.onclick = () => enableInlineEditing(contentDiv, editBtn);
                actionsDiv.appendChild(editBtn);
            }

            actionsDiv.appendChild(speakBtn);
            actionsDiv.appendChild(copyBtn);
            actionsDiv.appendChild(exportBtn);
            actionsDiv.appendChild(pdfExportBtn);
            contentDiv.appendChild(actionsDiv);

            // Autoplay audio for bot responses if enabled
            if (isAutoPlayEnabled && shouldSave) { // Only autoplay for new messages
                setTimeout(() => {
                    speakText(text, speakBtn, true);
                }, 500);
            }

        } else {
            contentDiv.textContent = text;
        }

        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(contentDiv);

        chatContainer.appendChild(messageDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;

        // Save chat history after adding message
        if (shouldSave) {
            saveChatHistory();
        }
    }

    // PDF export function
    function exportAsPDF(text, data) {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        // Title
        pdf.setFontSize(20);
        pdf.setTextColor(108, 92, 231);
        pdf.text('Aura Research Report', 20, 20);
        // Timestamp
        pdf.setFontSize(10);
        pdf.setTextColor(100, 100, 100);
        const timestamp = new Date().toLocaleString();
        pdf.text(`Generated: ${timestamp}`, 20, 30);
        // Text content
        pdf.setFontSize(12);
        pdf.setTextColor(0, 0, 0);
        const lines = pdf.splitTextToSize(text, 180);
        pdf.text(lines, 20, 40);
        // Capture insights panel as image
        const insightsPanel = document.getElementById('insights-panel');
        if (insightsPanel && !insightsPanel.querySelector('.empty-state')) {
            html2canvas(insightsPanel, { backgroundColor: '#0f1115', scale: 2 }).then(canvas => {
                const imgData = canvas.toDataURL('image/png');
                pdf.addPage();
                pdf.setFontSize(16);
                pdf.setTextColor(108, 92, 231);
                pdf.text('Visual Insights', 20, 20);
                pdf.addImage(imgData, 'PNG', 10, 30, 190, 0);
                const filename = `aura-research-${Date.now()}.pdf`;
                pdf.save(filename);
            }).catch(err => {
                console.error('PDF export error:', err);
                const filename = `aura-research-${Date.now()}.pdf`;
                pdf.save(filename);
            });
        } else {
            const filename = `aura-research-${Date.now()}.pdf`;
            pdf.save(filename);
        }
    }

    function exportAsMarkdown(text, data) {
        const timestamp = new Date().toISOString().split('T')[0];
        let content = `# Research Report - ${timestamp}\n\n${text}\n\n`;

        if (data) {
            content += `\n## Data Summary\n\n`;
            if (data.company) content += `**Company:** ${data.company}\n\n`;

            if (data.metrics && Object.keys(data.metrics).length > 0) {
                content += `### Metrics\n`;
                for (const [key, value] of Object.entries(data.metrics)) {
                    content += `- ${key}: ${value}\n`;
                }
                content += `\n`;
            }

            if (data.competitors && data.competitors.length > 0) {
                content += `### Competitors\n`;
                data.competitors.forEach(comp => {
                    content += `- ${comp}\n`;
                });
            }
        }

        const blob = new Blob([content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `research-${timestamp}.md`;
        a.click();
        URL.revokeObjectURL(url);
    }

    function speakText(text, button, autoplay = false) {
        if ('speechSynthesis' in window) {
            // If currently speaking, handle pause/resume
            if (isSpeaking && currentUtterance && !autoplay) {
                if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
                    // Currently speaking, so pause it
                    window.speechSynthesis.pause();
                    button.innerHTML = '<i class="fa-solid fa-play"></i> Resume';
                    return;
                } else if (window.speechSynthesis.paused) {
                    // Currently paused, so resume it
                    window.speechSynthesis.resume();
                    button.innerHTML = '<i class="fa-solid fa-pause"></i> Pause';
                    return;
                }
            }

            // Stop any previous speech
            if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
                window.speechSynthesis.cancel();
            }

            // Wait a bit for cancel to complete
            setTimeout(() => {
                isSpeaking = false;
                currentUtterance = null;

                // Strip markdown for reading
                const cleanText = text.replace(/[*#_`]/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

                currentUtterance = new SpeechSynthesisUtterance(cleanText);
                currentUtterance.rate = 1.0;
                currentUtterance.pitch = 1.0;

                // Try to find a good voice
                const voices = window.speechSynthesis.getVoices();
                const preferredVoice = voices.find(voice => voice.name.includes('Google US English') || voice.name.includes('Samantha') || voice.name.includes('Microsoft David'));
                if (preferredVoice) currentUtterance.voice = preferredVoice;

                // Event handlers
                currentUtterance.onstart = () => {
                    isSpeaking = true;
                    button.innerHTML = '<i class="fa-solid fa-pause"></i> Pause';
                };

                currentUtterance.onend = () => {
                    isSpeaking = false;
                    currentUtterance = null;
                    button.innerHTML = '<i class="fa-solid fa-volume-high"></i> Listen';
                };

                currentUtterance.onerror = (event) => {
                    console.error('Speech synthesis error:', event);
                    isSpeaking = false;
                    currentUtterance = null;
                    button.innerHTML = '<i class="fa-solid fa-volume-high"></i> Listen';
                };

                currentUtterance.onpause = () => {
                    button.innerHTML = '<i class="fa-solid fa-play"></i> Resume';
                };

                currentUtterance.onresume = () => {
                    button.innerHTML = '<i class="fa-solid fa-pause"></i> Pause';
                };

                window.speechSynthesis.speak(currentUtterance);
            }, 100);
        } else {
            if (!autoplay) {
                alert("Text-to-speech is not supported in this browser.");
            }
        }
    }

    function updateSidebar(text, structuredData) {
        const insightsPanel = document.getElementById('insights-panel');

        // Clear empty state if it exists
        if (insightsPanel.querySelector('.empty-state')) {
            insightsPanel.innerHTML = '';
        }

        // Extract and display key topics
        const lines = text.split('\n');
        const headers = lines.filter(line => line.startsWith('##') || line.startsWith('###'));

        if (headers.length > 0) {
            const card = createInsightCard('KEY TOPICS', 'list', headers.map(h => h.replace(/#/g, '').trim()));
            insightsPanel.prepend(card);
        }

        // Generate charts from structured data
        if (structuredData) {
            // Auto-generate charts from tables
            if (structuredData.tables && structuredData.tables.length > 0) {
                structuredData.tables.forEach((table, index) => {
                    createTableChart(table, index);
                });
            }

            generateAdvancedCharts(structuredData);
        } else {
            // Fallback to text-based chart generation
            generateChartsFromText(text);
        }
    }

    function createInsightCard(title, type, data) {
        const card = document.createElement('div');
        card.className = 'insight-card';
        card.style.cssText = 'background: linear-gradient(135deg, rgba(108, 92, 231, 0.1), rgba(108, 92, 231, 0.05)); padding: 15px; border-radius: 12px; margin-bottom: 12px; border: 1px solid rgba(108, 92, 231, 0.3); backdrop-filter: blur(10px);';

        const titleDiv = document.createElement('div');
        titleDiv.style.cssText = 'font-weight: 600; margin-bottom: 10px; color: var(--accent); font-size: 0.85rem; display: flex; align-items: center; gap: 8px;';
        titleDiv.innerHTML = `<i class="fa-solid fa-chart-line"></i> ${title}`;
        card.appendChild(titleDiv);

        if (type === 'list') {
            const list = document.createElement('ul');
            list.style.cssText = 'list-style: none; padding: 0; font-size: 0.85rem; color: var(--text-secondary);';
            data.forEach(item => {
                const li = document.createElement('li');
                li.textContent = item;
                li.style.cssText = 'margin-bottom: 6px; padding-left: 15px; position: relative;';
                li.innerHTML = `<span style="position: absolute; left: 0; color: var(--accent);">▸</span> ${item}`;
                list.appendChild(li);
            });
            card.appendChild(list);
        }

        return card;
    }

    function generateAdvancedCharts(data) {
        const insightsPanel = document.getElementById('insights-panel');

        // 0. Conflicts Warning (Highest Priority)
        if (data.conflicts && data.conflicts.length > 0) {
            const conflictCard = document.createElement('div');
            conflictCard.className = 'insight-card';
            conflictCard.style.cssText = 'background: linear-gradient(135deg, rgba(231, 76, 60, 0.2), rgba(231, 76, 60, 0.1)); padding: 15px; border-radius: 12px; margin-bottom: 12px; border: 1px solid rgba(231, 76, 60, 0.5); backdrop-filter: blur(10px);';

            let html = `<div style="font-weight: 600; margin-bottom: 10px; color: #e74c3c; font-size: 0.85rem; display: flex; align-items: center; gap: 8px;">
                <i class="fa-solid fa-triangle-exclamation"></i> DATA CONFLICTS DETECTED
            </div>`;

            data.conflicts.forEach(conflict => {
                html += `<div style="background: rgba(0,0,0,0.2); padding: 10px; border-radius: 8px; margin-bottom: 8px;">
                    <div style="font-size: 0.85rem; margin-bottom: 5px;">${conflict.message}</div>
                    <div style="font-size: 0.75rem; color: var(--text-secondary);">
                        Values found: ${conflict.values.join(', ')} | Variance: ${conflict.variance}%
                    </div>
                </div>`;
            });

            conflictCard.innerHTML = html;
            insightsPanel.prepend(conflictCard);
        }

        // 1. News Flash (Top Priority)
        if (data.recent_news && data.recent_news.length > 0) {
            const newsCard = document.createElement('div');
            newsCard.className = 'news-flash';
            newsCard.innerHTML = `<div style="font-weight:bold; margin-bottom:5px;"><i class="fa-solid fa-bolt"></i> LATEST NEWS</div>`;
            data.recent_news.forEach(news => {
                newsCard.innerHTML += `<div style="font-size:0.85rem; margin-bottom:4px;">• ${news}</div>`;
            });
            insightsPanel.prepend(newsCard);
        }

        // 2. Trust & Confidence Card
        if (data.confidence_score) {
            const trustCard = document.createElement('div');
            trustCard.className = 'insight-card';
            trustCard.style.cssText = 'background: linear-gradient(135deg, rgba(108, 92, 231, 0.1), rgba(108, 92, 231, 0.05)); padding: 15px; border-radius: 12px; margin-bottom: 12px; border: 1px solid rgba(108, 92, 231, 0.3); backdrop-filter: blur(10px);';

            let trustLevel = 'medium';
            let trustColor = '#f1c40f';
            if (data.confidence_score > 80) { trustLevel = 'high'; trustColor = '#58d68d'; }

            let html = `<div style="font-weight: 600; margin-bottom: 10px; color: var(--accent); font-size: 0.85rem; display: flex; align-items: center; gap: 8px;">
                <i class="fa-solid fa-shield-halved"></i> TRUST SCORE
            </div>`;

            html += `<div class="trust-badge trust-${trustLevel}">
                <i class="fa-solid fa-check-circle"></i> ${data.confidence_score}% Confidence
            </div>`;

            html += `<div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 8px;">
                Reliability Score: <span style="color:${trustColor}">${data.reliability_score}/100</span>
            </div>`;

            if (data.sources && data.sources.length > 0) {
                html += `<div style="margin-top: 12px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 8px;">
                    <div style="font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 6px;">TOP SOURCES</div>`;
                data.sources.forEach(source => {
                    // Extract domain
                    let domain = source.replace('https://', '').replace('http://', '').split('/')[0];
                    html += `<div class="source-rank-item">
                        <div class="source-rank-icon"><i class="fa-solid fa-link"></i></div>
                        <a href="${source}" target="_blank" style="color: var(--text-primary); text-decoration: none; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${domain}</a>
                    </div>`;
                });
                html += `</div>`;
            }

            trustCard.innerHTML = html;
            insightsPanel.prepend(trustCard);
        }

        // Metrics Chart (Bar Chart)
        if (data.metrics && Object.keys(data.metrics).length > 0) {
            createMetricsChart(data.metrics);
        }

        // Sentiment Chart (Doughnut)
        if (data.sentiment && Object.keys(data.sentiment).length > 0) {
            createSentimentChart(data.sentiment);
        }

        // Trends Chart (Line Chart)
        if (data.trends && data.trends.length >= 2) {
            createTrendsChart(data.trends);
        }

        // Strategic Priorities Card
        if (data.priorities && data.priorities.length > 0) {
            const card = createInsightCard('STRATEGIC PRIORITIES', 'list', data.priorities);
            insightsPanel.prepend(card);
        }

        // Opportunities Card
        if (data.opportunities && data.opportunities.length > 0) {
            const card = createInsightCard('KEY OPPORTUNITIES', 'list', data.opportunities);
            insightsPanel.prepend(card);
        }

        // Competitors Chart (Radar - placeholder with company name)
        if (data.competitors && data.competitors.length > 0) {
            const card = createInsightCard('COMPETITIVE LANDSCAPE', 'list', data.competitors);
            insightsPanel.prepend(card);
        }
    }

    function createMetricsChart(metrics) {
        const insightsPanel = document.getElementById('insights-panel');
        const chartCard = document.createElement('div');
        chartCard.className = 'insight-card';
        chartCard.style.cssText = 'background: linear-gradient(135deg, rgba(108, 92, 231, 0.1), rgba(108, 92, 231, 0.05)); padding: 15px; border-radius: 12px; margin-bottom: 12px; border: 1px solid rgba(108, 92, 231, 0.3);';

        const chartTitle = document.createElement('div');
        chartTitle.style.cssText = 'font-weight: 600; margin-bottom: 12px; color: var(--accent); font-size: 0.85rem; display: flex; align-items: center; gap: 8px;';
        chartTitle.innerHTML = '<i class="fa-solid fa-chart-bar"></i> KEY METRICS';
        chartCard.appendChild(chartTitle);

        const canvas = document.createElement('canvas');
        canvas.id = 'metrics-chart-' + Date.now();
        canvas.style.maxHeight = '220px';
        chartCard.appendChild(canvas);

        insightsPanel.prepend(chartCard);

        const labels = Object.keys(metrics).map(k => k.replace('_', ' ').toUpperCase());
        const values = Object.values(metrics);

        new Chart(canvas, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Value',
                    data: values,
                    backgroundColor: [
                        'rgba(108, 92, 231, 0.8)',
                        'rgba(99, 179, 237, 0.8)',
                        'rgba(88, 214, 141, 0.8)',
                        'rgba(250, 177, 160, 0.8)'
                    ],
                    borderColor: [
                        'rgba(108, 92, 231, 1)',
                        'rgba(99, 179, 237, 1)',
                        'rgba(88, 214, 141, 1)',
                        'rgba(250, 177, 160, 1)'
                    ],
                    borderWidth: 2,
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255,255,255,0.08)',
                            drawBorder: false
                        },
                        ticks: {
                            color: '#a0a0a0',
                            font: {
                                size: 11
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#a0a0a0',
                            font: {
                                size: 11
                            }
                        }
                    }
                }
            }
        });
    }

    function createSentimentChart(sentiment) {
        const insightsPanel = document.getElementById('insights-panel');
        const chartCard = document.createElement('div');
        chartCard.className = 'insight-card';
        chartCard.style.cssText = 'background: linear-gradient(135deg, rgba(108, 92, 231, 0.1), rgba(108, 92, 231, 0.05)); padding: 15px; border-radius: 12px; margin-bottom: 12px; border: 1px solid rgba(108, 92, 231, 0.3);';

        const chartTitle = document.createElement('div');
        chartTitle.style.cssText = 'font-weight: 600; margin-bottom: 12px; color: var(--accent); font-size: 0.85rem; display: flex; align-items: center; gap: 8px;';
        chartTitle.innerHTML = '<i class="fa-solid fa-heart-pulse"></i> SENTIMENT ANALYSIS';
        chartCard.appendChild(chartTitle);

        const canvas = document.createElement('canvas');
        canvas.id = 'sentiment-chart-' + Date.now();
        canvas.style.maxHeight = '200px';
        chartCard.appendChild(canvas);

        insightsPanel.prepend(chartCard);

        new Chart(canvas, {
            type: 'doughnut',
            data: {
                labels: ['Positive', 'Negative', 'Neutral'],
                datasets: [{
                    data: [
                        sentiment.positive || 0,
                        sentiment.negative || 0,
                        sentiment.neutral || 0
                    ],
                    backgroundColor: [
                        'rgba(88, 214, 141, 0.8)',
                        'rgba(250, 177, 160, 0.8)',
                        'rgba(99, 179, 237, 0.8)'
                    ],
                    borderColor: [
                        'rgba(88, 214, 141, 1)',
                        'rgba(250, 177, 160, 1)',
                        'rgba(99, 179, 237, 1)'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#a0a0a0',
                            font: {
                                size: 11
                            },
                            padding: 10
                        }
                    }
                }
            }
        });
    }

    function createTrendsChart(trends) {
        const insightsPanel = document.getElementById('insights-panel');
        const chartCard = document.createElement('div');
        chartCard.className = 'insight-card';
        chartCard.style.cssText = 'background: linear-gradient(135deg, rgba(108, 92, 231, 0.1), rgba(108, 92, 231, 0.05)); padding: 15px; border-radius: 12px; margin-bottom: 12px; border: 1px solid rgba(108, 92, 231, 0.3);';

        const chartTitle = document.createElement('div');
        chartTitle.style.cssText = 'font-weight: 600; margin-bottom: 12px; color: var(--accent); font-size: 0.85rem; display: flex; align-items: center; gap: 8px;';
        chartTitle.innerHTML = '<i class="fa-solid fa-arrow-trend-up"></i> MARKET TRENDS';
        chartCard.appendChild(chartTitle);

        const canvas = document.createElement('canvas');
        canvas.id = 'trends-chart-' + Date.now();
        canvas.style.maxHeight = '220px';
        chartCard.appendChild(canvas);

        insightsPanel.prepend(chartCard);

        const labels = trends.map(t => t.period || t.year || t.quarter);
        const values = trends.map(t => t.value || t.revenue || t.growth);

        new Chart(canvas, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Trend',
                    data: values,
                    borderColor: '#6c5ce7',
                    backgroundColor: 'rgba(108, 92, 231, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#fff',
                    pointBorderColor: '#6c5ce7',
                    pointRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        grid: {
                            color: 'rgba(255,255,255,0.08)',
                            drawBorder: false
                        },
                        ticks: {
                            color: '#a0a0a0',
                            font: {
                                size: 11
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#a0a0a0',
                            font: {
                                size: 11
                            }
                        }
                    }
                }
            }
        });
    }

    function createTableChart(table, index) {
        const insightsPanel = document.getElementById('insights-panel');
        const chartCard = document.createElement('div');
        chartCard.className = 'insight-card';
        chartCard.style.cssText = 'background: linear-gradient(135deg, rgba(108, 92, 231, 0.1), rgba(108, 92, 231, 0.05)); padding: 15px; border-radius: 12px; margin-bottom: 12px; border: 1px solid rgba(108, 92, 231, 0.3);';

        const chartTitle = document.createElement('div');
        chartTitle.style.cssText = 'font-weight: 600; margin-bottom: 12px; color: var(--accent); font-size: 0.85rem; display: flex; align-items: center; gap: 8px;';
        chartTitle.innerHTML = `<i class="fa-solid fa-table"></i> ${table.title || 'Data Analysis'}`;
        chartCard.appendChild(chartTitle);

        const canvas = document.createElement('canvas');
        canvas.id = 'table-chart-' + index + '-' + Date.now();
        canvas.style.maxHeight = '220px';
        chartCard.appendChild(canvas);

        insightsPanel.prepend(chartCard);

        // Determine chart type based on data
        // If multiple columns, maybe bar chart. If time-series, line chart.
        // For simplicity, default to bar chart for now.
        // For simplicity, default to bar chart for now.
        if (!table.rows || !Array.isArray(table.rows)) {
            console.warn('Table rows missing or invalid:', table);
            return;
        }
        const labels = table.rows.map(row => row[0]); // First column as labels
        const datasets = [];

        // Try to parse subsequent columns as data
        for (let i = 1; i < table.headers.length; i++) {
            const data = table.rows.map(row => {
                const val = parseFloat(row[i].replace(/[^0-9.-]/g, ''));
                return isNaN(val) ? 0 : val;
            });

            datasets.push({
                label: table.headers[i],
                data: data,
                backgroundColor: i === 1 ? 'rgba(108, 92, 231, 0.7)' : 'rgba(99, 179, 237, 0.7)',
                borderColor: i === 1 ? 'rgba(108, 92, 231, 1)' : 'rgba(99, 179, 237, 1)',
                borderWidth: 1
            });
        }

        new Chart(canvas, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255,255,255,0.08)'
                        },
                        ticks: {
                            color: '#a0a0a0'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#a0a0a0'
                        }
                    }
                }
            }
        });
    }

    function generateChartsFromText(text) {
        // Simple regex-based extraction for fallback
        // Look for "Revenue: $X" or "Growth: Y%" patterns
        const metrics = {};
        const revenueMatch = text.match(/revenue.*?\$([\d.]+)\s*(billion|million|B|M)/i);
        if (revenueMatch) {
            metrics['Revenue'] = parseFloat(revenueMatch[1]);
        }

        const growthMatch = text.match(/growth.*?([\d.]+)%/i);
        if (growthMatch) {
            metrics['Growth %'] = parseFloat(growthMatch[1]);
        }

        if (Object.keys(metrics).length > 0) {
            createMetricsChart(metrics);
        }
    }

    // Inline Editing for Account Plans
    function enableInlineEditing(contentDiv, editBtn) {
        const isEditing = contentDiv.contentEditable === 'true';

        if (isEditing) {
            // Save changes
            contentDiv.contentEditable = 'false';
            contentDiv.style.border = 'none';
            contentDiv.style.padding = '0';
            editBtn.innerHTML = '<i class="fa-solid fa-edit"></i> Edit Plan';
            editBtn.style.color = 'var(--text-secondary)';

            // Show save confirmation
            const saveMsg = document.createElement('div');
            saveMsg.style.cssText = 'position: fixed; top: 20px; right: 20px; background: rgba(88, 214, 141, 0.9); color: white; padding: 12px 20px; border-radius: 8px; z-index: 1000; animation: fadeIn 0.3s ease;';
            saveMsg.innerHTML = '<i class="fa-solid fa-check"></i> Changes saved!';
            document.body.appendChild(saveMsg);

            setTimeout(() => {
                saveMsg.style.opacity = '0';
                saveMsg.style.transition = 'opacity 0.3s';
                setTimeout(() => saveMsg.remove(), 300);
            }, 2000);

        } else {
            // Enable editing
            contentDiv.contentEditable = 'true';
            contentDiv.style.border = '2px dashed var(--accent)';
            contentDiv.style.padding = '10px';
            contentDiv.style.borderRadius = '8px';
            editBtn.innerHTML = '<i class="fa-solid fa-save"></i> Save Changes';
            editBtn.style.color = '#58d68d';

            // Focus on the content
            contentDiv.focus();

            // Show editing hint
            const hint = document.createElement('div');
            hint.style.cssText = 'position: fixed; top: 20px; right: 20px; background: rgba(108, 92, 231, 0.9); color: white; padding: 12px 20px; border-radius: 8px; z-index: 1000; animation: fadeIn 0.3s ease;';
            hint.innerHTML = '<i class="fa-solid fa-info-circle"></i> Click anywhere in the text to edit. Click "Save Changes" when done.';
            document.body.appendChild(hint);

            setTimeout(() => {
                hint.style.opacity = '0';
                hint.style.transition = 'opacity 0.3s';
                setTimeout(() => hint.remove(), 300);
            }, 4000);
        }
    }

});
