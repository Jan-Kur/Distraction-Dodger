let timerElement = null;

function initializeTimer() {
    if (!timerElement) {
        timerElement = document.createElement("div");
        timerElement.classList.add("timer");
        timerElement.style.display = 'none';
        document.body.appendChild(timerElement);
    }
    return timerElement;
}

function initializeExtension() {
    initializeTimer();
    const currentDomain = window.location.hostname.replace('www.', '');
    chrome.storage.local.get(`notification_${currentDomain}`, result => {
        const message = result[`notification_${currentDomain}`];
        if (message !== undefined) {
            displayNotification(message);
        }
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeExtension);
} else {
    initializeExtension();
}

chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "UPDATE_TIME") {
        if (!timerElement) {
            timerElement = initializeTimer();
        }
        timerElement.textContent = formatTime(message.timeSpent);
        timerElement.style.display = 'block';
    } else if (message.action === "SHOW_NOTIFICATION") {
        const storageKey = `notification_${message.domain}`;
        chrome.storage.local.set({[storageKey]: message});

        displayNotification(message);
    }
});

function displayNotification(message) {
    if (!document.body) {
        setTimeout(() => displayNotification(message), 100);
        return;
    }

    const existingNotification = document.querySelector('.notification-container');
    if (existingNotification) {
        document.body.removeChild(existingNotification);
    }

    const notification = message.notification;

    chrome.runtime.sendMessage({
        action: "PAUSE_TIMER",
        domain: message.domain,
    });

    document.body.classList.add("notification-active");

    const notificationContainer = document.createElement("div");
    notificationContainer.classList.add("notification-container");
    notificationContainer.style.backgroundColor = notification.backgroundColor;

    const audio = document.createElement("audio");
    audio.classList.add("audio");
    audio.setAttribute("controls", "");
    audio.src = notification.soundEffect;
    audio.setAttribute("autoplay", "");

    const text = document.createElement("div");
    text.classList.add("text");
    text.textContent = notification.text;
    text.style.color = notification.textColor;

    const image = document.createElement("img");
    image.classList.add("image");
    image.src = notification.image;

    const timer = document.createElement("div");
    timer.classList.add("notification-timer");
    timer.style.color = notification.mainColor;
    timer.style.backgroundColor = notification.secondaryColor;

    const ignoreButton = document.createElement("button");
    ignoreButton.classList.add("ignore-button");
    ignoreButton.textContent = "Ignore";
    ignoreButton.style.color = notification.mainColor;
    ignoreButton.style.backgroundColor = notification.secondaryColor;
    ignoreButton.style.borderColor = notification.mainColor;
    ignoreButton.addEventListener("click", () => {
        document.body.classList.remove("notification-active");
        document.body.removeChild(notificationContainer);

        const currentDomain = message.domain;
        chrome.storage.local.remove(`notification_${currentDomain}`);

        chrome.runtime.sendMessage({
            action: "RESUME_TIMER",
            domain: message.domain,
        });
    });

    notificationContainer.appendChild(audio);
    notificationContainer.appendChild(text);
    notificationContainer.appendChild(image);
    notificationContainer.appendChild(timer);
    notificationContainer.appendChild(ignoreButton);
    document.body.appendChild(notificationContainer);

    if (notification.blockWebsite === false) {
        timer.remove()
    } else {
        chrome.storage.local.get(`${message.domain}_blockStartTime`, result => {
            let blockStartTime = result[`${message.domain}_blockStartTime`];

            ignoreButton.style.display = "none";
            
            if (!blockStartTime) {
                blockStartTime = Date.now();
                chrome.storage.local.set({[`${message.domain}_blockStartTime`]: blockStartTime});
            }

            const elapsedTime = Math.floor((Date.now() - blockStartTime) / 1000);
            let timeLeft = notification.blockDuration * 60 - elapsedTime;

            const timeLeftTimer = setInterval(() => {
                timer.textContent = formatTimeLeft(timeLeft);
                timeLeft--;
                if (timeLeft < 0) {
                    clearInterval(timeLeftTimer);
                    timer.remove();
                    ignoreButton.style.display = "block";
                    chrome.storage.local.remove(`${message.domain}_blockStartTime`)
                }
            }, 1000);
        });
    }
}

function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600) % 24;
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${padZero(hours)}:${padZero(minutes)}:${padZero(secs)}`;
}

function padZero(number) {
    return number < 10 ? `0${number}` : number;
}

function formatTimeLeft(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `Time left: ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}