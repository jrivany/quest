class ScriptBuilder {
    constructor(voice) {
        this.script = [];
        this.voice = voice;
    }

    async perform() {
        for (const step of script) {
            await step();
        }
        this.script = [];  
    }

    say(text) {
        this.script.push(
            () => new Promise(resolver => {
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.rate = 0.7;
                utterance.onend = resolver;
                utterance.voice = this.voice;
                speechSynthesis.speak(utterance);
            })
        );
    }

    pause(ms=1000) {
        this.script.push(
            () => new Promise(resolver => setTimeout(resolver, ms))
        );
    }
}

async function readScript(playerCount, voice) {
    const script = new ScriptBuilder(voice);
    script.say('Everybody close your eyes and place your fists out in front of you.');
    script.say('Minions of mordred except the blind hunter, open your eyes so that you may know each other');
    if (playerCount > 4) {
        const evilEyes = Math.floor((playerCount - 1) / 2);
        script.say('There should be ' + evilEyes + ' sets of eyes open.');
    }
    if (playerCount < 6) {
        script.say('Blind hunter, raise your thumb so that evil may know you.');
    }
    script.pause();
    script.say('Everybody close your eyes.');
    script.say('Cleric: open your eyes and observe the leader.');
    script.say('Leader: if you are evil, raise your thumb.');
    script.pause();
    script.say('Cleric: close your eyes. Leader: lower your thumb if it is up.');
    script.pause(2000);
    script.say('Let\'s begin!');
    await script.perform();
}

function populateVoiceList() {
    const voiceMap = {};
    if (typeof speechSynthesis === "undefined") {
        return voiceMap;
    }

    const voices = speechSynthesis.getVoices();

    for (const voice of voices) {
        const option = document.createElement("option");
        const key =  `${voice.name} (${voice.lang})`;
        voiceMap[key] = voice;
        option.textContent = key;

        if (voice.default) {
            option.textContent += " — DEFAULT";
        }

        option.value = key;
        document.getElementById("voice-select").appendChild(option);
    }
    return voiceMap;
}

window.addEventListener('DOMContentLoaded', function() {
    const voices = populateVoiceList();
    const buttonEl = document.getElementById('start-button');
    buttonEl.addEventListener('click', () => {
        const playerCountEl = document.getElementById('player-count');
        const playerCount = parseInt(playerCountEl.options[playerCountEl.selectedIndex].value);
        const voiceSelectEl = document.getElementById('voice-select');
        const voice = voices[voiceSelect.options[voiceSelectEl.selectedIndex].value];
        readScript(playerCount, voice);
    });
});
