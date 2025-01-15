chrome.runtime.onInstalled.addListener(async () => {
    for (const cs of chrome.runtime.getManifest().content_scripts) {
      for (const tab of await chrome.tabs.query({url: cs.matches})) {
        if (tab.url.match(/(chrome|chrome-extension):\/\//gi)) {
          continue;
        }
        
        chrome.scripting.executeScript({
          target: {tabId: tab.id, allFrames: cs.all_frames},
          files: cs.js,
          injectImmediately: true
        });
        
        if (cs.css && cs.css.length > 0) {
          chrome.scripting.insertCSS({
            target: {tabId: tab.id, allFrames: cs.all_frames},
            files: cs.css
          });
        }
      }
    }
  });

let activeDomain = null;
let websiteTimes = {};
let lastReset = 0;


setInterval(async () => {
    try {
        const result = await chrome.storage.local.get(["websites", "websiteTimes", "lastReset"]);
        const websites = result.websites || [];
        websiteTimes = result.websiteTimes || {};
        lastReset = result.lastReset || Date.now();

        if ((Date.now() - lastReset) >= 24 * 60 * 60 * 1000) {
            websites.forEach(website => {
                websiteTimes[website.url] = {
                    timeSpent: 0,
                    isRunning: false,
                    timer: null,
                };
            });
            lastReset = Date.now();
            await chrome.storage.local.set({lastReset, websiteTimes});
        }
    } catch (error) {
        console.error('Error in reset interval:', error);
    }
}, 60 * 60 * 1000);

(async () => {
    try {
        const result = await chrome.storage.local.get(["websites", "websiteTimes"]);
        const websites = result.websites || [];
        websiteTimes = result.websiteTimes || {};

        websites.forEach(website => {
            if (!websiteTimes[website.url]) {
                websiteTimes[website.url] = {
                    timeSpent: 0,
                    isRunning: false,
                    timer: null,
                };
            }
        });
        await chrome.storage.local.set({websiteTimes});
    } catch (error) {
        console.error('Error initializing websites:', error);
    }
})();

chrome.tabs.onActivated.addListener(async (activeInfo) => {
    try {
        const tab = await chrome.tabs.get(activeInfo.tabId);
        await handleTabChange(tab);
    } catch (error) {
        console.error('Error in tab activation:', error);
    }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.url && tab.active) {
        handleTabChange(tab).catch(error => {
            console.error('Error in tab update:', error);
        });
    }
});

async function handleTabChange(tab) {
    try {
        const result = await chrome.storage.local.get("websiteTimes");
        websiteTimes = result.websiteTimes || {};

        const tabDomain = extractDomain(tab.url);
        
        const notificationKey = `notification_${tabDomain}`;
        const notificationResult = await chrome.storage.local.get(notificationKey);
        const hasActiveNotification = notificationResult[notificationKey] !== undefined;

        if (isTabUrlMatching(tabDomain, websiteTimes)) {
            if (activeDomain !== null) {
                if (activeDomain === tabDomain) {
                    if (hasActiveNotification) {
                        await stopTimer(tabDomain);
                    }
                    return;
                } else {
                    await stopTimer(activeDomain);
                    activeDomain = null;
                }
            }
            if (!hasActiveNotification) {
                await startTimer(tabDomain);
                activeDomain = tabDomain;
            }
        } else {
            if (activeDomain !== null) {
                await stopTimer(activeDomain);
            }
            activeDomain = null;
        }
    } catch (error) {
        console.error('Error in handleTabChange:', error);
    }
}

function extractDomain(url) {
    try {
        const urlDomain = new URL(url).hostname.replace('www.', '');
        return urlDomain
    } catch {
        return null
    }
}

function isTabUrlMatching(urlDomain, domainObject) {
      return Object.keys(domainObject).some(key => 
        key.replace('www.', '') === urlDomain
      );
}

async function startTimer(domain) {
    try {
        const result = await chrome.storage.local.get("websiteTimes");
        websiteTimes = result.websiteTimes || {};

        if (!websiteTimes[domain].isRunning) {
            websiteTimes[domain].timer = setInterval(async () => {
                try {
                    const latestResult = await chrome.storage.local.get("websites");
                    const currentWebsites = latestResult.websites || [];
                    const currentWebsiteIndex = currentWebsites.findIndex(website => website.url === domain);
                    
                    let foundNotification = currentWebsites[currentWebsiteIndex].settings.notifications.find(
                        notification => notification.after * 60 === websiteTimes[domain].timeSpent
                    );
                    
                    if (foundNotification) {
                            showNotification(foundNotification, domain);
                        }
                            
                    const tabs = await chrome.tabs.query({active: true, currentWindow: true});
                    const activeTab = tabs[0];
                    
                    if (activeTab && extractDomain(activeTab.url) === domain) {
                        try {
                            await chrome.tabs.sendMessage(activeTab.id, {
                                action: "UPDATE_TIME",
                                timeSpent: websiteTimes[domain].timeSpent,
                            });
                        } catch (error) {
                            try {
                                await chrome.scripting.executeScript({
                                    target: { tabId: activeTab.id },
                                    files: ['content-script.js']
                                });
                                await chrome.tabs.sendMessage(activeTab.id, {
                                    action: "UPDATE_TIME",
                                    timeSpent: websiteTimes[domain].timeSpent,
                                });
                            } catch (injectionError) {
                                console.error('Error injecting content script:', injectionError);
                            }
                        }
                    }

                    websiteTimes[domain].timeSpent++;
                    console.log(websiteTimes[domain].timeSpent);

                    chrome.storage.local.set({websiteTimes});
                } catch (error) {
                    console.error('Error in timer interval:', error);
                }
            }, 1000);

            websiteTimes[domain].isRunning = true;
            activeDomain = domain;
            await chrome.storage.local.set({websiteTimes});
        }
    } catch (error) {
        console.error('Error in startTimer:', error);
    }
}

async function stopTimer(domain) {
    try {
        const result = await chrome.storage.local.get("websiteTimes");
        websiteTimes = result.websiteTimes || {};

        if (websiteTimes[domain].isRunning) {
            clearInterval(websiteTimes[domain].timer);
            websiteTimes[domain].isRunning = false;
            await chrome.storage.local.set({websiteTimes});
        }
    } catch (error) {
        console.error('Error in stopTimer:', error);
    }
}

async function showNotification(notification, domain) {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    try {
        await chrome.tabs.sendMessage(tabs[0].id, {
            action: "SHOW_NOTIFICATION",
            domain: domain,
            notification: notification,
        });
    } catch (error) {
        try {
            await chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                files: ['content-script.js']
            });
            await chrome.tabs.sendMessage(tabs[0].id, {
                action: "SHOW_NOTIFICATION",
                domain: domain,
                notification: notification,
            });
        } catch (injectionError) {
            console.error('Error injecting content script:', injectionError);
        }
    }
}

chrome.runtime.onMessage.addListener(message => {
    if (message.action === "PAUSE_TIMER") {
        stopTimer(message.domain);
    } else if (message.action === "RESUME_TIMER") {
        startTimer(message.domain);
    }
})