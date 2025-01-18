const addNotification = document.querySelector(".add-notification");
const listOfNotifications = document.getElementById("notifications-list");

const checkbox = document.getElementById("check");
const initialNotificationSettings = document.querySelector(".initial-notification-settings");

const blockWebsiteCheckbox = document.getElementById("check");
const activateAfterInput = document.getElementById("activate-after");
let blockDurationInput = null;

const mainContainer = document.querySelector(".main-container");

const backButton = document.querySelector(".back-button")

renderSavedNotifications()

backButton.addEventListener("click", () => {
    window.location.href = "./popup.html";
});

async function renderSavedNotifications() {
    listOfNotifications.innerHTML = "";
    try {
        const result = await chrome.storage.local.get(["websites", "websiteSettingsUrl"]);
        let websites = result.websites || [];
        let websiteSettingsUrl = result.websiteSettingsUrl;
        let websiteIndex = websites.findIndex(website => website.url === websiteSettingsUrl);
        websites[websiteIndex].settings.notifications.forEach((notification => {
            addNotificationToDOM(notification.id, notification.blockWebsite, notification.after, notification.blockDuration)
        }));
    } catch (error) {
        console.error('Error rendering notifications:', error);
    }
}

checkbox.addEventListener("click", () => {
    const existingDurationContainer = document.querySelector(".block-duration-container");
    if (checkbox.checked == true) {
        if (!existingDurationContainer) {
            const blockDurationContainer = document.createElement("div");
            blockDurationContainer.classList.add("block-duration-container");
            blockDurationInput = document.createElement("input");
            blockDurationInput.setAttribute("id", "block-duration-input");
            blockDurationInput.setAttribute("type", "number");
            blockDurationInput.setAttribute("name", "duration");
            blockDurationInput.setAttribute("min", "1");
            blockDurationInput.setAttribute("max", "1440");
            blockDurationInput.setAttribute("value", "1");
            blockDurationInput.addEventListener("change", (e) => {
                if (e.target.value < 1) {
                    e.target.value = "1";
                }
            });

            const blockDurationText = document.createElement("label");
            blockDurationText.classList.add("block-duration-text");
            blockDurationText.setAttribute("for", "block-duration-input");
            blockDurationText.textContent = "Block the website for (mins):"

            blockDurationContainer.appendChild(blockDurationText);
            blockDurationContainer.appendChild(blockDurationInput);
            initialNotificationSettings.appendChild(blockDurationContainer);
        }
    } else {
        if (existingDurationContainer && existingDurationContainer.parentNode === initialNotificationSettings) {
            initialNotificationSettings.removeChild(existingDurationContainer);
        }
    }
})

addNotification.addEventListener("click", async () => {
    try {
        const result = await chrome.storage.local.get(["websites", "websiteSettingsUrl"]);
        let websites = result.websites || [];
        let websiteSettingsUrl = result.websiteSettingsUrl;
        let websiteIndex = websites.findIndex(website => website.url === websiteSettingsUrl);

        let blockWebsite = blockWebsiteCheckbox.checked;
        let activateAfter = activateAfterInput.value;
        let blockDuration;
        if (blockDurationInput !== null) {
            blockDuration = blockWebsite ? parseInt(blockDurationInput.value) : "0";
        } else {
            blockDuration = "0";
        }
        let id = "";
        for (let i = 0; i < 8; i++) {
            let randomNumber = Math.floor(Math.random() * 10)
            id += randomNumber
        }
        
        if (validateNotificationTiming(activateAfter, websites[websiteIndex].settings.notifications) === "Already scheduled") {
            alert("There already is a notification scheduled for this time")
        } else if (validateNotificationTiming(activateAfter, websites[websiteIndex].settings.notifications) === "Valid") {
            addNotificationToDOM(id, blockWebsite, activateAfter, blockDuration);
            await addDefaultNotification(id, blockWebsite, activateAfter, blockDuration);
        }   
    } catch (error) {
        console.error('Error adding notification:', error);
    }
});

function addNotificationToDOM(id, blockWebsite, activateAfter, blockDuration) {
    const notificationContainer = document.createElement("div");
    notificationContainer.classList.add("notification-container");

    const blockWebsiteDiv = document.createElement("div");
    blockWebsiteDiv.textContent = blockWebsite;
    blockWebsiteDiv.classList.add("block-website-div");

    const activateAfterDiv = document.createElement("div");
    activateAfterDiv.textContent = activateAfter;
    activateAfterDiv.classList.add("activate-after-div");

    const blockDurationDiv = document.createElement("div");
    blockDurationDiv.textContent = blockDuration;
    blockDurationDiv.classList.add("block-duration-div");

    const editionButton = document.createElement("button");
    editionButton.classList.add("edition-button");
    editionButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed"><path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/></svg>`;
    editionButton.addEventListener("click", () => {
        let notificationID = id;
        chrome.storage.local.set({notificationID});
        chrome.storage.local.get(["websites", "websiteSettingsUrl"], (result) => {
            let websites = result.websites || [];
            let websiteSettingsUrl = result.websiteSettingsUrl;
            let websiteIndex = websites.findIndex(website => website.url === websiteSettingsUrl);
            let notifications = websites[websiteIndex].settings.notifications.filter(notification => notification.id === id);
            let thisNotification = notifications[0];
            
            if (document.querySelector(".settings-container") !== null) {
                document.querySelector(".quit-container").click()
            };

            const settingsContainer = document.createElement("div");
            settingsContainer.classList.add("settings-container");
    
            const imageOfNotification = document.createElement("div");
            imageOfNotification.classList.add("image-of-notification");

            const imageAudio = document.createElement("audio");
            imageAudio.classList.add("image-audio");
            imageAudio.setAttribute("autoplay", "");

            const audioButtonsContainer = document.createElement("div");
            audioButtonsContainer.classList.add("audio-buttons-container");

            const playButton = document.createElement("button");
            playButton.classList.add("play-button");
            playButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M320-200v-560l440 280-440 280Z"/></svg>`;
            playButton.addEventListener("click", () => {
                if (imageAudio.paused) {
                    imageAudio.play();
                }
            });
        
            const pauseButton = document.createElement("button");
            pauseButton.classList.add("pause-button");
            pauseButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M560-200v-560h160v560H560Zm-320 0v-560h160v560H240Z"/></svg>`;
            pauseButton.addEventListener("click", () => {
                if (!imageAudio.paused) {
                    imageAudio.pause();
                }
            });

            const resetButton = document.createElement("button");
            resetButton.classList.add("reset-button");
            resetButton.textContent = "Reset";
            resetButton.addEventListener("click", () => {
                imageAudio.currentTime = 0;
            });

            const imageText = document.createElement("div");
            imageText.classList.add("image-text")

            const imageImage = document.createElement("img");
            imageImage.classList.add("image-image");

            const imageTimer = document.createElement("div");
            imageTimer.classList.add("image-timer");
            imageTimer.textContent = "Time left: 00:05:11";

            const imageIgnore = document.createElement("button");
            imageIgnore.classList.add("image-ignore");
            imageIgnore.textContent = "Ignore";

            audioButtonsContainer.appendChild(playButton);
            audioButtonsContainer.appendChild(pauseButton);
            audioButtonsContainer.appendChild(resetButton);

            imageOfNotification.appendChild(imageAudio);
            imageOfNotification.appendChild(audioButtonsContainer);
            imageOfNotification.appendChild(imageText);
            imageOfNotification.appendChild(imageImage);
            imageOfNotification.appendChild(imageTimer);
            imageOfNotification.appendChild(imageIgnore);

            const editNotificationSettings = document.createElement("div");
            editNotificationSettings.classList.add("edit-notification-settings");

            const toggleContainer = document.createElement("div");
            toggleContainer.classList.add("toggle-container");
            const toggleLabel = document.createElement("label");
            toggleLabel.setAttribute("for", "edit-check");
            toggleLabel.classList.add("toggle-text");
            toggleLabel.textContent = "Limit website usage:";
            const toggleCheckbox = document.createElement("input");
            toggleCheckbox.setAttribute("type", "checkbox");
            toggleCheckbox.setAttribute("id", "edit-check");
            toggleCheckbox.checked = thisNotification.blockWebsite;

            toggleCheckbox.addEventListener("change", async () => {
                if (toggleCheckbox.checked) {
                    imageIgnore.style.display = "none";
                    imageTimer.style.display = "block";
                } else {
                    imageTimer.style.display = "none";
                    imageIgnore.style.display = "block";
                }

                try {
                    thisNotification.blockWebsite = toggleCheckbox.checked;
                if (!toggleCheckbox.checked) {
                    const existingDurationContainer = editNotificationSettings.querySelector(".block-duration-container");
                    if (existingDurationContainer && existingDurationContainer.parentNode === editNotificationSettings) {
                        editNotificationSettings.removeChild(existingDurationContainer);
                    }
                    thisNotification.blockDuration = "0";
                    blockDurationDiv.textContent = "0";
                } else {
                    thisNotification.blockDuration = "1";
                    blockDurationDiv.textContent = "1";
                    const blockDurationContainer = document.createElement("div");
                    blockDurationContainer.classList.add("block-duration-container");

                    blockDurationInput = document.createElement("input");
                    blockDurationInput.setAttribute("id", "block-duration-input");
                    blockDurationInput.setAttribute("type", "number");
                    blockDurationInput.setAttribute("name", "duration");
                    blockDurationInput.setAttribute("min", "1");
                    blockDurationInput.setAttribute("max", "1440");
                    blockDurationInput.setAttribute("value", "1");
                    blockDurationInput.addEventListener("change", (e) => {
                        if (e.target.value < 1) {
                            e.target.value = "1";
                        }
                        thisNotification.blockDuration = e.target.value;
                        chrome.storage.local.set({websites});
                        blockDurationDiv.textContent = e.target.value;
                    });

                    const blockDurationText = document.createElement("label");
                    blockDurationText.classList.add("block-duration-text");
                    blockDurationText.setAttribute("for", "block-duration-input");
                    blockDurationText.textContent = "Block the website for (mins):"

                    blockDurationContainer.appendChild(blockDurationText);
                    blockDurationContainer.appendChild(blockDurationInput);
                    editNotificationSettings.appendChild(blockDurationContainer);

                }
                chrome.storage.local.set({websites});
                blockWebsiteDiv.textContent = toggleCheckbox.checked;
                } catch (error) {
                    console.error("Error updating notification:", error);
                }
            });

            const toggleButton = document.createElement("label");
            toggleButton.setAttribute("for", "edit-check");
            toggleButton.classList.add("toggle-button");

            toggleContainer.appendChild(toggleLabel);
            toggleContainer.appendChild(toggleCheckbox);
            toggleContainer.appendChild(toggleButton);

            const activateAfterContainer = document.createElement("div");
            activateAfterContainer.classList.add("activate-after-container");
            const activateAfterLabel = document.createElement("label");
            activateAfterLabel.classList.add("activate-after-text");
            activateAfterLabel.textContent = "Minutes before activation:";
            const activateAfterInput = document.createElement("input");
            activateAfterInput.setAttribute("type", "number");
            activateAfterInput.setAttribute("id", "activate-after");
            activateAfterInput.setAttribute("min", "1");
            activateAfterInput.setAttribute("max", "600");
            activateAfterInput.value = thisNotification.after;
            activateAfterInput.addEventListener("change", async () => {
                try {
                    const oldValue = thisNotification.after;
                    thisNotification.after = activateAfterInput.value;
                    
                    const foundNotification = await chrome.storage.local.get("foundNotification");
                    if (foundNotification && foundNotification.id === id && 
                        parseInt(activateAfterInput.value) > oldValue) {
                        await chrome.declarativeNetRequest.updateDynamicRules({
                            removeRuleIds: [1]
                        });
                    }
                    chrome.storage.local.set({websites});
                    activateAfterDiv.textContent = activateAfterInput.value;
                } catch (error) {
                    console.error("Error updating notification timing:", error);
                }
            });

            activateAfterContainer.appendChild(activateAfterLabel);
            activateAfterContainer.appendChild(activateAfterInput);

            editNotificationSettings.appendChild(toggleContainer);
            editNotificationSettings.appendChild(activateAfterContainer);
            if (toggleCheckbox.checked) {
                const blockDurationContainer = document.createElement("div");
                blockDurationContainer.classList.add("block-duration-container");

                blockDurationInput = document.createElement("input");
                blockDurationInput.setAttribute("id", "block-duration-input");
                blockDurationInput.setAttribute("type", "number");
                blockDurationInput.setAttribute("name", "duration");
                blockDurationInput.setAttribute("min", "1");
                blockDurationInput.setAttribute("max", "1440");
                blockDurationInput.setAttribute("value", thisNotification.blockDuration);
                blockDurationInput.addEventListener("change", () => {
                    thisNotification.blockDuration = blockDurationInput.value;
                    chrome.storage.local.set({websites});
                    blockDurationDiv.textContent = blockDurationInput.value;
                });

                const blockDurationText = document.createElement("label");
                blockDurationText.classList.add("block-duration-text");
                blockDurationText.setAttribute("for", "block-duration-input");
                blockDurationText.textContent = "Block the website for (mins):"

                blockDurationContainer.appendChild(blockDurationText);
                blockDurationContainer.appendChild(blockDurationInput);
                editNotificationSettings.appendChild(blockDurationContainer);

            }

            const textContainer = document.createElement("div");
            textContainer.classList.add("text-container");
            const textLabel = document.createElement("label");
            textLabel.setAttribute("for", "text-input");
            textLabel.textContent = "Notification text:";
            const textInput = document.createElement("input");
            textInput.setAttribute("id", "text-input");
            textInput.setAttribute("type", "text");
            textInput.classList.add("text-input");
            textInput.value = thisNotification.text;
            textInput.addEventListener("change", () => {
                thisNotification.text = textInput.value;
                imageText.textContent = textInput.value;
                chrome.storage.local.set({websites});
            });
            textContainer.appendChild(textLabel);
            textContainer.appendChild(textInput);
    
            const imageContainer = document.createElement("div");
            imageContainer.classList.add("image-container");
            const imageLabel = document.createElement("label");
            imageLabel.setAttribute("for", "image-input");
            imageLabel.textContent = "Image URL:";
            const imageInput = document.createElement("input");
            imageInput.setAttribute("id", "image-input");
            imageInput.setAttribute("type", "url");
            imageInput.classList.add("image-input");
            imageInput.pattern = "https?://.+\.(jpg|jpeg|png|gif|webp|svg)$";
            imageInput.value = thisNotification.image;
            imageInput.addEventListener("change", () => {
                thisNotification.image = imageInput.value;
                imageImage.src = imageInput.value;
                chrome.storage.local.set({websites});
            });
            imageContainer.appendChild(imageLabel);
            imageContainer.appendChild(imageInput);
    
            const soundContainer = document.createElement("div");
            soundContainer.classList.add("sound-container");
            const soundLabel = document.createElement("label");
            soundLabel.setAttribute("for", "sound-input");
            soundLabel.textContent = "Sound effect URL:";
            const soundInput = document.createElement("input");
            soundInput.setAttribute("id", "sound-input");
            soundInput.setAttribute("type", "url");
            soundInput.classList.add("sound-input");
            soundInput.value = thisNotification.soundEffect;
            soundInput.addEventListener("change", () => {
                thisNotification.soundEffect = soundInput.value;
                imageAudio.src = soundInput.value;
                chrome.storage.local.set({websites});
            });
            soundContainer.appendChild(soundLabel);
            soundContainer.appendChild(soundInput);
    
            const textColorContainer = document.createElement("div");
            textColorContainer.classList.add("text-color-container");
            const textColorLabel = document.createElement("label");
            textColorLabel.setAttribute("for", "text-color-input");
            textColorLabel.textContent = "Text color:";
            const textColorInput = document.createElement("input");
            textColorInput.setAttribute("id", "text-color-input");
            textColorInput.setAttribute("type", "color");
            textColorInput.classList.add("text-color-input");
            textColorInput.value = thisNotification.textColor;
            textColorInput.addEventListener("change", () => {
                thisNotification.textColor = textColorInput.value;
                imageText.style.color = textColorInput.value;
                chrome.storage.local.set({websites});
            });
            textColorContainer.appendChild(textColorLabel);
            textColorContainer.appendChild(textColorInput);
    
            const mainColorContainer = document.createElement("div");
            mainColorContainer.classList.add("main-color-container");
            const mainColorLabel = document.createElement("label");
            mainColorLabel.setAttribute("for", "main-color-input");
            mainColorLabel.textContent = "Main color:";
            const mainColorInput = document.createElement("input");
            mainColorInput.setAttribute("id", "main-color-input");
            mainColorInput.setAttribute("type", "color");
            mainColorInput.classList.add("main-color-input");
            mainColorInput.value = thisNotification.mainColor;
            mainColorInput.addEventListener("change", () => {
                thisNotification.mainColor = mainColorInput.value;
                imageTimer.style.color = mainColorInput.value;
                imageIgnore.style.color = mainColorInput.value;
                imageIgnore.style.borderColor = mainColorInput.value;
                playButton.style.color = mainColorInput.value;
                playButton.style.borderColor = mainColorInput.value;
                pauseButton.style.color = mainColorInput.value;
                pauseButton.style.borderColor = mainColorInput.value;
                resetButton.style.color = mainColorInput.value;
                resetButton.style.borderColor = mainColorInput.value;
                chrome.storage.local.set({websites});
            });
            mainColorContainer.appendChild(mainColorLabel);
            mainColorContainer.appendChild(mainColorInput);
    
            const secondaryColorContainer = document.createElement("div");
            secondaryColorContainer.classList.add("secondary-color-container");
            const secondaryColorLabel = document.createElement("label");
            secondaryColorLabel.setAttribute("for", "secondary-color-input");
            secondaryColorLabel.textContent = "Secondary color:";
            const secondaryColorInput = document.createElement("input");
            secondaryColorInput.setAttribute("id", "secondary-color-input");
            secondaryColorInput.setAttribute("type", "color");
            secondaryColorInput.classList.add("secondary-color-input");
            secondaryColorInput.value = thisNotification.secondaryColor;
            secondaryColorInput.addEventListener("change", () => {
                thisNotification.secondaryColor = secondaryColorInput.value;
                imageTimer.style.backgroundColor = secondaryColorInput.value;
                imageIgnore.style.backgroundColor = secondaryColorInput.value;
                playButton.style.backgroundColor = secondaryColorInput.value;
                pauseButton.style.backgroundColor = secondaryColorInput.value;
                resetButton.style.backgroundColor = secondaryColorInput.value;
                chrome.storage.local.set({websites});
            });
            secondaryColorContainer.appendChild(secondaryColorLabel);
            secondaryColorContainer.appendChild(secondaryColorInput);
    
            const backgroundColorContainer = document.createElement("div");
            backgroundColorContainer.classList.add("background-color-container");
            const backgroundColorLabel = document.createElement("label");
            backgroundColorLabel.setAttribute("for", "background-color-input");
            backgroundColorLabel.textContent = "Background color:";
            const backgroundColorInput = document.createElement("input");
            backgroundColorInput.setAttribute("id", "background-color-input");
            backgroundColorInput.setAttribute("type", "color");
            backgroundColorInput.classList.add("background-color-input");
            backgroundColorInput.value = thisNotification.backgroundColor;
            backgroundColorInput.addEventListener("change", () => {
                thisNotification.backgroundColor = backgroundColorInput.value;
                imageOfNotification.style.backgroundColor = backgroundColorInput.value;
                chrome.storage.local.set({websites});
            });
            backgroundColorContainer.appendChild(backgroundColorLabel);
            backgroundColorContainer.appendChild(backgroundColorInput);

            const quitContainer = document.createElement("div");
            quitContainer.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/></svg>` 
            quitContainer.classList.add("quit-container");
            quitContainer.addEventListener("click", () => {
                mainContainer.removeChild(settingsContainer);
            })
            
            imageAudio.src = soundInput.value;
            imageText.textContent = textInput.value;
            imageText.style.color = textColorInput.value;
            imageImage.src = imageInput.value;
            imageTimer.style.backgroundColor = secondaryColorInput.value;
            imageTimer.style.color = mainColorInput.value;
            imageIgnore.style.backgroundColor = secondaryColorInput.value;
            imageIgnore.style.color = mainColorInput.value;
            imageIgnore.style.borderColor = mainColorInput.value;
            imageOfNotification.style.backgroundColor = backgroundColorInput.value;
            playButton.style.backgroundColor = secondaryColorInput.value;
            playButton.style.color = mainColorInput.value;
            playButton.style.borderColor = mainColorInput.value;
            pauseButton.style.backgroundColor = secondaryColorInput.value;
            pauseButton.style.color = mainColorInput.value;
            pauseButton.style.borderColor = mainColorInput.value;
            resetButton.style.backgroundColor = secondaryColorInput.value;
            resetButton.style.color = mainColorInput.value;
            resetButton.style.borderColor = mainColorInput.value;

            if (toggleCheckbox.checked) {
                imageIgnore.style.display = "none";
            } else {
                imageTimer.style.display = "none"
            }

            settingsContainer.appendChild(imageOfNotification);
            settingsContainer.appendChild(editNotificationSettings);
            settingsContainer.appendChild(textContainer);
            settingsContainer.appendChild(imageContainer);
            settingsContainer.appendChild(soundContainer);
            settingsContainer.appendChild(textColorContainer);
            settingsContainer.appendChild(mainColorContainer);
            settingsContainer.appendChild(secondaryColorContainer);
            settingsContainer.appendChild(backgroundColorContainer);
            settingsContainer.appendChild(quitContainer);
    
            mainContainer.appendChild(settingsContainer);
        });
    });

    const deletionButton = document.createElement("button");
    deletionButton.classList.add("deletion-button");
    deletionButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg>`;
    deletionButton.addEventListener("click", async () => {
        try {
            const result = await chrome.storage.local.get(["websites", "websiteSettingsUrl"]);
            let websites = result.websites || [];
            let websiteSettingsUrl = result.websiteSettingsUrl;
            let websiteIndex = websites.findIndex(website => website.url === websiteSettingsUrl);
    
            websites[websiteIndex].settings.notifications = 
                websites[websiteIndex].settings.notifications.filter(notification => notification.id !== id);
    
            await chrome.storage.local.set({ websites });
            listOfNotifications.removeChild(notificationContainer);
        } catch (error) {
            console.error("Error deleting notification:", error);
        }
    });

    notificationContainer.appendChild(blockWebsiteDiv);
    notificationContainer.appendChild(activateAfterDiv);
    notificationContainer.appendChild(blockDurationDiv);
    notificationContainer.appendChild(editionButton);
    notificationContainer.appendChild(deletionButton);
    

    listOfNotifications.appendChild(notificationContainer);
}

async function addDefaultNotification(id, blockWebsite, activateAfter, blockDuration) {
    try {
        const result = await chrome.storage.local.get(["websites", "websiteSettingsUrl"]);
        let websites = result.websites || [];
        let websiteSettingsUrl = result.websiteSettingsUrl;
        let websiteIndex = websites.findIndex(website => website.url === websiteSettingsUrl);

        const notification = {
            id: id,
            blockWebsite: blockWebsite,
            after: activateAfter,
            blockDuration: blockWebsite ? Math.max(1, blockDuration) : "0",
            text: "Get back to work!",
            image: "https://i.pinimg.com/originals/d2/1e/6a/d21e6a3c2d9f900fa007f218c05c0894.gif",
            soundEffect: "https://www.dropbox.com/scl/fi/xv1y75n08varlgshd7vfw/oversimplified-alarm-clock-113180-1.mp3?rlkey=z86kgprv9ez6lu76hslx3dbur&raw=1",
            textColor: "#e8eaed",
            mainColor: "#7fffd4",
            secondaryColor: "#222",
            backgroundColor: "#1c1c1c",
        };
        websites[websiteIndex].settings.notifications.push(notification);
        await chrome.storage.local.set({ websites });
    } catch (error) {
        console.error('Error adding notification:', error);
    }
}

function validateNotificationTiming(newActivateAfter, existingNotifications) {
    const newStart = parseInt(newActivateAfter);
    
    if (existingNotifications.some(n => parseInt(n.after) === newStart)) {
        return "Already scheduled";
    }

    return "Valid";
}
