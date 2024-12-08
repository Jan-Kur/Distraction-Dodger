renderSavedWebsites()

const additionButton = document.getElementById("addition-button");
const listOfWebsites = document.getElementById("websites-list");
const userInput = document.getElementById("link-input");

let websites = []

function renderSavedWebsites() {
    chrome.storage.sync.get("websites", (result) => {
        websites = result.websites || []
        if (websites.length !== 0) {
            websites.forEach(website => {
                addWebsiteToList(website.url)
            });
        } 
    })
}

userInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        additionButton.click();
    }
});

additionButton.addEventListener("click", () => {
    let url = userInput.value.trim();
    if (isValidUrl(url)) {
        addWebsiteToList(url);
        userInput.value = "";
    } else {
        alert("Please enter a valid URL");
    }

    function isValidUrl(url) {
        try {
            const parsedUrl = new URL(url);
            if (!["http:", "https:"].includes(parsedUrl.protocol)) {
                return false;
            }
            return true;
        } catch (err) {
            return false;
        }
    }
});

function addWebsiteToList(url) {
    const websiteContainer = document.createElement("div");
    websiteContainer.classList.add("website-container");

    const websiteUrl = document.createElement("div");
    websiteUrl.textContent = formatUrl(url);
    websiteUrl.classList.add("website-url");

    const websiteIcon = document.createElement("img");
    const domain = new URL(url).hostname;
    websiteIcon.src = `https://www.google.com/s2/favicons?domain=${domain}&sz=256`;
    websiteIcon.alt = `${domain} icon`;
    websiteIcon.classList.add("website-icon");

    const editionButton = document.createElement("button");
    editionButton.classList.add("edition-button");
    editionButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed"><path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/></svg>`;
    editionButton.addEventListener("click", () => {

    })

    const deletionButton = document.createElement("button");
    deletionButton.classList.add("deletion-button");
    deletionButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg>`;
    deletionButton.addEventListener("click", () => {
        listOfWebsites.removeChild(websiteContainer)
    })

    websiteContainer.appendChild(websiteIcon);
    websiteContainer.appendChild(websiteUrl);
    websiteContainer.appendChild(editionButton);
    websiteContainer.appendChild(deletionButton);
    listOfWebsites.appendChild(websiteContainer);

    addDefaultWebsite(url)
}

function formatUrl(url) {
    const parsedUrl = new URL(url);
    const formattedUrl = parsedUrl.hostname + parsedUrl.pathname;
    return formattedUrl;
}

function addDefaultWebsite(url) {
    chrome.storage.sync.get(["websites"], (result) => {
        let websites = result.websites || [];
        
        let website = {
            url,
            settings: {
                notifications: [
                    {
                        type: "notification",
                        after: 15,
                        duration: 0,
                        text: "Get back to work!",
                        image: "https://i.pinimg.com/originals/d2/1e/6a/d21e6a3c2d9f900fa007f218c05c0894.gif",
                        soundEffect: "https://drive.google.com/uc?export=download&id=1zFKf2t2sK75OEqEI8FaVbW6oJ17_HKuA",
                        textColor: "#e8eaed",
                        mainColor: "#7fffd4",
                        secondaryColor: "#222",
                        backgroundColor: "#1c1c1c",
                    },
                    {
                        type: "limit",
                        after: 30,
                        duration: 60,
                        text: "Get back to work!",
                        image: "https://i.pinimg.com/originals/d2/1e/6a/d21e6a3c2d9f900fa007f218c05c0894.gif",
                        soundEffect: "https://drive.google.com/uc?export=download&id=1zFKf2t2sK75OEqEI8FaVbW6oJ17_HKuA",
                        textColor: "#e8eaed",
                        mainColor: "#7fffd4",
                        secondaryColor: "#222",
                        backgroundColor: "#1c1c1c",
                    },
                ],
            },
        };
        websites.push(website);
        chrome.storage.sync.set({ websites: websites });
    });
}


