document.addEventListener("DOMContentLoaded", () => {
    // 1. Initialize Icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // --- GLOBAL NAVBAR LOGIC ---
    const userToken = localStorage.getItem('userToken');
    const profileItem = document.getElementById('profile-item');
    const loginItem = document.getElementById('login-item');

    if (userToken) {
        if (profileItem) profileItem.classList.remove('hidden');
        if (loginItem) loginItem.classList.add('hidden');
    }

    // --- THEME TOGGLE LOGIC ---
    const themeBtn = document.getElementById('theme-toggle');
    const body = document.body;

    const savedTheme = localStorage.getItem('farmsafe-theme');
    if (savedTheme === 'dark') {
        body.classList.add('dark-theme');
        updateThemeIcon(true);
    }

    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            body.classList.toggle('dark-theme');
            const isDark = body.classList.contains('dark-theme');
            localStorage.setItem('farmsafe-theme', isDark ? 'dark' : 'light');
            updateThemeIcon(isDark);
        });
    }

    function updateThemeIcon(isDark) {
        if (themeBtn) {
            themeBtn.innerHTML = isDark ? '<i data-lucide="sun"></i>' : '<i data-lucide="moon"></i>';
            lucide.createIcons();
        }
    }

    // Set Time
    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    document.getElementById('last-update').innerText = `Last Synced: ${timeString}`;

    // --- MULTIPLE MARK DONE BUTTONS LOGIC ---
    const markDoneBtns = document.querySelectorAll('.mark-done-btn');
    markDoneBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            this.innerHTML = '<i data-lucide="check-check"></i> Completed';
            this.classList.add('completed');
            lucide.createIcons();
        });
    });

    // --- AI CHATBOT LOGIC ---
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    const chatWindow = document.getElementById('chat-window');

    // Advanced Agronomy AI Knowledge Base
    const botResponses = [
        { keywords: ['lockout', 'ph', 'phosphorus', 'sulfur'], reply: "Nutrient lockout happens when soil pH is too high or low, making nutrients invisible to roots. Your pH is 7.5 (alkaline). Applying 15kg of elemental sulfur will slowly lower the pH back to 6.5, unlocking the Phosphorus already in your soil." },
        { keywords: ['gdd', 'thermal', 'degree', 'flowering'], reply: "GDD (Growing Degree Days) measures accumulated heat. It is a much more accurate way to predict crop stages than calendars. At 900 GDD, your crop will start flowering. You are at 850 right now, so expect blooms in about 3-4 days based on current temperatures!" },
        { keywords: ['topsoil', 'root', 'depth', 'moisture', 'dry'], reply: "Topsoil naturally dries out faster due to wind and sun. However, your deep roots (15-30cm) are sitting in 75% moisture. If you water now, the roots will get lazy and stay near the surface. Withholding water forces them to grow deeper, making your plants drought-resistant." },
        { keywords: ['spray', 'wind', 'timeline', 'chemical'], reply: "The red blocks on your timeline indicate wind speeds over 15km/h or incoming rain. Spraying now means chemicals will drift away or wash off. The green block at 8:00 AM tomorrow shows the perfect combination of low wind, moderate temp, and dry leaves." },
        { keywords: ['aphid', 'bug', 'pest', 'insect'], reply: "Aphid activity is rising due to the new foliage. Yellow sticky traps will help monitor the population size. If you see more than 10 aphids per leaf, apply the 2% Neem oil spray during the safe spraying window tomorrow morning." }
    ];

    function appendMessage(text, sender) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `chat-message ${sender}`;
        
        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        bubble.innerText = text;
        
        const time = document.createElement('span');
        time.className = 'time-stamp';
        time.innerText = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        msgDiv.appendChild(bubble);
        msgDiv.appendChild(time);
        
        chatWindow.appendChild(msgDiv);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    function showTypingIndicator() {
        const msgDiv = document.createElement('div');
        msgDiv.className = 'chat-message bot typing-msg';
        msgDiv.innerHTML = `
            <div class="typing-indicator">
                <div class="dot"></div><div class="dot"></div><div class="dot"></div>
            </div>
        `;
        chatWindow.appendChild(msgDiv);
        chatWindow.scrollTop = chatWindow.scrollHeight;
        return msgDiv;
    }

    function handleUserInput() {
        const text = chatInput.value.trim();
        if (!text) return;

        // Add User Message
        appendMessage(text, 'user');
        chatInput.value = '';

        // Show Typing Indicator
        const typingEl = showTypingIndicator();

        // Process Bot Reply
        setTimeout(() => {
            typingEl.remove();

            const lowerText = text.toLowerCase();
            let foundReply = "I am an AI Agronomist, but I'm not sure about that specific query. Could you rephrase, or would you like me to connect you to a human agricultural extension officer?";

            for (let item of botResponses) {
                if (item.keywords.some(kw => lowerText.includes(kw))) {
                    foundReply = item.reply;
                    break;
                }
            }

            appendMessage(foundReply, 'bot');
        }, 1200);
    }

    sendBtn.addEventListener('click', handleUserInput);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleUserInput();
    });

    // Mic button logic
    const micBtn = document.querySelector('.mic-btn');
    if (micBtn) {
        micBtn.addEventListener('click', () => {
            alert("Voice input module is ready for backend integration!");
        });
    }
});