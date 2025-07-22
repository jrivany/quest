class ScriptBuilder {
    constructor(voice, speed=0.7) {
        this.script = [];
        this.voice = voice;
        this.speed = speed;
    }

    async perform() {
        for (const step of this.script) {
            await step();
        }
        this.script = [];  
    }

    say(text) {
        this.script.push(
            () => new Promise(resolver => {
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.rate = this.speed;
                utterance.onend = resolver;
                if (this.voice) {
                    utterance.voice = this.voice;
                }
                speechSynthesis.speak(utterance);
            })
        );
    }

    pause(ms=5000) {
        this.script.push(
            () => new Promise(resolver => setTimeout(resolver, ms))
        );
    }
}



async function readScript(playerCount, script) {
    script.say('Everyone close your eyes and place your fists out in front of you.');
    script.pause(500);
    const blindHunterKnown = playerCount < 6;
    if (blindHunterKnown) {
        script.say('Blind Hunter, raise your thumb so that evil may know you.');
        script.pause(500);
    }
    script.say('Minions of Mordred - except the Blind Hunter - open your eyes and look around so that you know all agents of Evil');
    script.pause(500);
    if (playerCount > 4) {
        const evilEyes = Math.floor((playerCount - 1) / 2);
        script.say('There should be ' + evilEyes + ' sets of eyes open.');
    }
    script.pause();
    script.say('Minions of Mordred, close your eyes.');
    if (blindHunterKnown) {
        script.pause(500);
        script.say('Blind Hunter, re-form your hand into a fist.');
    }
    script.pause(1500);
    script.say('Leader, extend your thumb if you are Evil.');
    script.pause(500);
    script.say('Cleric, open your eyes and observe the leader.');
    script.pause(2500);
    script.say('Cleric, close your eyes.');
    script.pause(500);
    script.say('Leader, re-form your hand into a fist.');
    script.pause(1500);
    script.say('Everyone open your eyes!');
    await script.perform();
}

function populateVoiceList() {
    const voiceMap = {};
    if (typeof speechSynthesis === "undefined") {
        return voiceMap;
    }

    const voices = speechSynthesis.getVoices();
    const voiceSelect = document.getElementById("voice-select");
    const voiceStatus = document.getElementById("voice-status");
    
    // Clear existing options
    voiceSelect.innerHTML = "";

    if (voices.length === 0) {
        const option = document.createElement("option");
        option.textContent = "No voices available";
        option.value = "";
        voiceSelect.appendChild(option);
        voiceStatus.innerHTML = '<span style="color: #ff4444;">⚠️ No voices found</span>';
        return voiceMap;
    }

    // Add default option
    const defaultOption = document.createElement("option");
    defaultOption.textContent = "Select a voice...";
    defaultOption.value = "";
    voiceSelect.appendChild(defaultOption);

    for (const voice of voices) {
        const option = document.createElement("option");
        const key = `${voice.name} (${voice.lang})`;
        voiceMap[key] = voice;
        option.textContent = key;

        if (voice.default) {
            option.textContent += " — DEFAULT";
            option.selected = "selected";
        }

        option.value = key;
        voiceSelect.appendChild(option);
    }
    
    voiceStatus.innerHTML = `<span style="color: #28a745;">✅ ${voices.length} voices loaded</span>`;
    
    return voiceMap;
}

window.addEventListener('DOMContentLoaded', function() {
    let voices = {};
    const startButton = document.getElementById('start-button');
    const voiceSelect = document.getElementById("voice-select");
    const questForm = document.getElementById('quest-form');
    const themeToggle = document.getElementById('theme-toggle');
    
    // Theme management
    function getSystemTheme() {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    
    function getStoredTheme() {
        return localStorage.getItem('theme') || 'system';
    }
    
    function setTheme(theme) {
        if (theme === 'system') {
            document.documentElement.removeAttribute('data-theme');
            localStorage.removeItem('theme');
        } else {
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
        }
        updateThemeToggle();
    }
    
    function updateThemeToggle() {
        const currentTheme = getStoredTheme();
        const effectiveTheme = currentTheme === 'system' ? getSystemTheme() : currentTheme;
        
        if (currentTheme === 'system') {
            themeToggle.textContent = '🌓'; // Auto
            themeToggle.title = 'Theme: Auto (follows system)';
        } else if (effectiveTheme === 'dark') {
            themeToggle.textContent = '☀️'; // Light mode icon when in dark mode
            themeToggle.title = 'Switch to light mode';
        } else {
            themeToggle.textContent = '🌙'; // Dark mode icon when in light mode
            themeToggle.title = 'Switch to dark mode';
        }
    }
    
    function cycleTheme() {
        const currentTheme = getStoredTheme();
        if (currentTheme === 'system' || currentTheme === 'light') {
            setTheme('dark');
        } else if (currentTheme === 'dark') {
            setTheme('light');
        }
    }
    
    // Initialize theme
    const storedTheme = getStoredTheme();
    if (storedTheme !== 'system') {
        setTheme(storedTheme);
    } else {
        updateThemeToggle();
    }
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (getStoredTheme() === 'system') {
            updateThemeToggle();
        }
    });
    
    // Theme toggle event
    themeToggle.addEventListener('click', cycleTheme);
    
    function updateVoices() {
        voices = populateVoiceList();
    }
    
    function updateButtonState() {
        // Button is always enabled - users can start without selecting a voice
        startButton.disabled = false;
    }
    
    // Initial population
    updateVoices();
    updateButtonState(); // Enable the button initially
    
    // Listen for voices to be loaded
    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = updateVoices;
    }
    
    // Update button state when voice selection changes (though it stays enabled)
    voiceSelect.addEventListener('change', updateButtonState);
    
    // Handle form submission
    questForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const playerCountEl = document.getElementById('player-count');
        const playerCount = parseInt(playerCountEl.options[playerCountEl.selectedIndex].value);
        
        const selectedVoiceItem = voiceSelect.options[voiceSelect.selectedIndex];
        let voice;
        if (selectedVoiceItem && selectedVoiceItem.value) {
            voice = voices[selectedVoiceItem.value];
        }

        let speed;
        const speedSelectEl = document.getElementById('voice-speed-select');
        const selectedSpeedItem = speedSelectEl.options[speedSelectEl.selectedIndex];
        if (selectedSpeedItem) {
            speed = parseFloat(selectedSpeedItem.value);
        }
        
        // Disable button during execution
        startButton.disabled = true;
        startButton.textContent = "🎭 Running Quest Opening...";
        
        const script = new ScriptBuilder(voice, speed);
        readScript(playerCount, script).then(() => {
            // Re-enable button after completion
            startButton.disabled = false;
            startButton.textContent = "🎲 Start Quest Opening";
        }).catch(() => {
            // Re-enable button on error
            startButton.disabled = false;
            startButton.textContent = "🎲 Start Quest Opening";
        });
    });
});
