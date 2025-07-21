function say(text) {
    return function () {
        return new Promise(resolver => {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.7;
            utterance.onend = resolver;
            speechSynthesis.speak(utterance);
        });
    }
}

function pause(ms=5000) {
    return function () {
        return new Promise(resolver => setTimeout(resolver, ms));
    }
}

async function start() {
    const playerCount = 6;
    const script = [];
    script.push(say('Everybody close your eyes and place your fists out in front of you.'));
    script.push(say('Minions of mordred except the blind hunter, open your eyes so that you may know each other'));
    if (playerCount < 6) {
        script.push(say('Blind hunter, raise your thumb so that evil may know you.'));
    }
    script.push(pause());
    script.push(say('Everybody close your eyes.'));
    script.push(say('Cleric: open your eyes and observe the leader.'));
    script.push(say('Leader: if you are evil, raise your thumb.'));
    script.push(pause());
    script.push(say('Cleric: close your eyes. Leader: lower your thumb if it is up.'));
    script.push(pause(2000));

    for (const step of script) {
        await step();
    }
}

window.addEventListener('DOMContentLoaded', function() {
    const buttonEl = document.getElementById('start-button');
    buttonEl.addEventListener('click', start);
});