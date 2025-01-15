const textElement = document.querySelector(".text");
const imageElement = document.querySelector(".image");
const timerElement = document.querySelector(".timer");
const ignoreElement = document.querySelector(".ignore");
const audioElement = document.querySelector(".audio");

chrome.storage.local.get(["foundNotification", "blockStartTime"], result => {
    const foundNotification = result.foundNotification;
    let blockStartTime = result.blockStartTime;

    document.body.style.backgroundColor = foundNotification.backgroundColor;
    
    textElement.textContent = foundNotification.text;
    textElement.style.color = foundNotification.textColor;

    imageElement.src = foundNotification.image;

    ignoreElement.style.color = foundNotification.mainColor;
    ignoreElement.style.backgroundColor = foundNotification.secondaryColor;
    ignoreElement.style.borderColor = foundNotification.mainColor;
    ignoreElement.addEventListener("click", () => {
        chrome.storage.local.get("previousUrl", result => {
            window.location.href = result.previousUrl; 
        });
    });

    timerElement.style.color = foundNotification.mainColor;
    timerElement.style.backgroundColor = foundNotification.secondaryColor;

    audioElement.src = foundNotification.soundEffect;
    audioElement.play().catch(error => {
        console.error('Error playing audio:', error);
    });

    if (foundNotification.blockWebsite === false) {
        timerElement.remove();
    } else {
        ignoreElement.style.display = "none";

        if (!blockStartTime) {
            blockStartTime = Date.now();
            chrome.storage.local.set({blockStartTime});
        }

        const elapsedTime = Math.floor((Date.now() - blockStartTime) / 1000)
        let timeLeft = foundNotification.blockDuration * 60 - elapsedTime;

        const timer = setInterval(() => {
            timerElement.textContent = formatTime(timeLeft);
            timeLeft--;
            if (timeLeft < 0) {
                clearInterval(timer);
                timerElement.remove();
                ignoreElement.style.display = "block";
                chrome.storage.local.remove("blockStartTime")
            }
        }, 1000)
    }
})

function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `Time left: ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}