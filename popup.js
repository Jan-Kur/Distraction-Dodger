const additionButton = document.querySelector("#addition-button");
const listOfWebsites = document.getElementById("websites-list");
const userInput = document.getElementById("link-input");

let websites = [];

let websiteSettingsUrl =""

document.addEventListener('DOMContentLoaded', () => {
    renderSavedWebsites();
});

async function renderSavedWebsites() {
    listOfWebsites.innerHTML = '';

    try {
        const result = await chrome.storage.local.get("websites");
        websites = result.websites || [];

        if (websites.length > 0) {
            websites.forEach(website => {
                addWebsiteToDOM(website.url);
            });
        }
    } catch (error) {
        console.error('Error rendering websites:', error);
    }
}

userInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        additionButton.click();
    }
});

additionButton.addEventListener("click", async () => {
    const url = userInput.value.trim();
    const Domain = validateAndExtractDomain(url);

    if (Domain) {
        try {
            const result = await chrome.storage.local.get("websites");
            let websites = result.websites || [];

            if (websites.some(website => website.url === Domain)) {
                alert("This website already exists.");
                return;
            }

            await createDefaultWebsite(Domain);
            addWebsiteToDOM(Domain);
            userInput.value = '';
        } catch (error) {
            console.error('Error adding website:', error);
        }
    } else {
        alert("Please enter a valid URL with just the root domain (e.g., example.com). Subdomains and paths are not allowed.");
    }
});

function validateAndExtractDomain(input) {
    try {
        const parsedUrl = new URL(input.startsWith('http') ? input : `https://${input}`);

        if (parsedUrl.pathname !== '/' || parsedUrl.search || parsedUrl.hash) {
            throw new Error();
        }

        let domain = parsedUrl.hostname;
        if (domain.startsWith('www.')) {
            domain = domain.slice(4);
        }

        const parts = domain.split('.');
        if (parts.length !== 2 || !parts[0] || !parts[1]) {
            throw new Error();
        }

        return domain;
    } catch {
        return null;
    }
}

function addWebsiteToDOM(rootDomain) {
    const websiteContainer = document.createElement("div");
    websiteContainer.classList.add("website-container");

    const websiteUrl = document.createElement("div");
    websiteUrl.textContent = rootDomain;
    websiteUrl.classList.add("website-url");

    const websiteIcon = document.createElement("img");
    websiteIcon.src = `https://www.google.com/s2/favicons?domain=${rootDomain}&sz=256`;
    websiteIcon.alt = `${rootDomain} icon`;
    websiteIcon.classList.add("website-icon");

    const editionButton = document.createElement("button");
    editionButton.classList.add("edition-button");
    editionButton.innerHTML = `<a href="./website-settings.html"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed"><path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/></svg></a>`;
    editionButton.addEventListener("click", () => {
        websiteSettingsUrl = rootDomain;
        chrome.storage.local.set({websiteSettingsUrl});
    });

    const deletionButton = document.createElement("button");
    deletionButton.classList.add("deletion-button");
    deletionButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg>`;
    deletionButton.addEventListener("click", async () => {
        try {
            const result = await chrome.storage.local.get(["websites", "websiteTimes"]);
            let websites = result.websites || [];
            let websiteTimes = result.websiteTimes || {};
            
            if (websiteTimes[rootDomain].timer) {
                clearInterval(websiteTimes[rootDomain].timer);
                delete websiteTimes[rootDomain];
            }
            
            websites = websites.filter(website => website.url !== rootDomain);
            
            await unblockWebsite(rootDomain);
    
            await chrome.storage.local.set({ websites, websiteTimes });
            listOfWebsites.removeChild(websiteContainer);
        } catch (error) {
            console.error("Error deleting website:", error);
        }
    });

    websiteContainer.appendChild(websiteIcon);
    websiteContainer.appendChild(websiteUrl);
    websiteContainer.appendChild(editionButton);
    websiteContainer.appendChild(deletionButton);

    listOfWebsites.appendChild(websiteContainer)
}

async function createDefaultWebsite(url) {
    try {
        const result = await chrome.storage.local.get(["websites", "websiteTimes"]);
        let websites = result.websites || [];
        let websiteTimes = result.websiteTimes || {};

        const generateRandomID = () => {
            let id = "";
            for (let i = 0; i < 8; i++) {
                id += Math.floor(Math.random() * 10);
            }
            return id;
        };

        const newWebsite = {
            url,
            settings: {
                notifications: [
                    {   
                        id: generateRandomID(),
                        blockWebsite: false,
                        after: 15,
                        blockDuration: 0,
                        text: "Get back to work!",
                        image: "https://i.pinimg.com/originals/d2/1e/6a/d21e6a3c2d9f900fa007f218c05c0894.gif",
                        soundEffect: "https://drive.google.com/uc?export=download&id=1zFKf2t2sK75OEqEI8FaVbW6oJ17_HKuA",
                        textColor: "#e8eaed",
                        mainColor: "#7fffd4",
                        secondaryColor: "#222",
                        backgroundColor: "#1c1c1c",
                    },
                    {   
                        id: generateRandomID(),
                        blockWebsite: true,
                        after: 30,
                        blockDuration: 60,
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

        websites.push(newWebsite);
        websiteTimes[url] = {
            timeSpent: 0,
            isRunning: false,
            timer: null,
        }
        await chrome.storage.local.set({ websites, websiteTimes });
        console.log("New website added to websites: ", websites);
    } catch (error) {
        console.error('Error creating website:', error);
    }
}

function generateRuleId(domain) {
    let hash = 0;
    for (let i = 0; i < domain.length; i++) {
        hash = ((hash << 5) - hash) + domain.charCodeAt(i);
        hash = hash & hash;
    }
    return Math.abs(hash);
}

async function unblockWebsite(domain) {
    const ruleId = generateRuleId(domain);
    await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: [ruleId]
    });
}