# Distraction Dodger
Do your job and do it right by dodging the distractions constantly thrown at you 🥷🏿

## What and Why
I created this project because it is something that I will use myself, which I think is a very important purpose for building projects. The goal of this extension is to help the user control how they spend their time and get them back on track if they get distracted. 
I have to admit, I usually open up YouTube to watch some videos while eating dinner, but often... well, you can probably guess—maybe some of you also have such problems (I watch YouTube for longer than I planned). That's exactly why I came up with this project: to help me control that through reminders and by setting an amount of time I can spend on a website during a day.

## How - The Story
It's by far the biggest project I have ever created, and most importantly, the only useful one. I have never played around with Chrome extensions before, so this was like a new universe to me. 
I would be lying if I said developing **Distraction Dodger** was easy and predictable. In fact, it was the opposite—I faced issues connected to the different world in which Chrome extensions live (sending messages between components of the extension, saving to storage, content scripts, etc.), which was really different from creating websites. 
I had to ditch a big portion of the code and start from scratch because I couldn't overcome some errors (I struggled with them for probably like a week). I also had to completely change the way notifications are presented. Long story short: I first tried redirecting to a website that would dynamically display the desired notification, but problems occurred when I started working on more than one notification active simultaneously. So, I had to switch approaches. 
I decided to display notifications through a content script, and that worked! I saved these 3 files: `notification.html`, `notification.js`, and `notification.css`, so you can "touch" the story if you don't believe me. Because of all that, developing this extension took **A LOT** more time than I thought it would.

## Setup
Here's a link to a demo video where I showcase the extension in action and explain how to set it up: 
But basically:
1. Click the green "Code" button in the Distraction Dodger GitHub repository.
2. Either download a ZIP folder or clone the repo to your local machine.
3. **For Google Chrome**:
   - Once you have the code for the extension in a folder on your machine, in the browser, click the "extensions" button on the top right corner that looks like a puzzle piece. Then click "Manage extensions" at the bottom of the popup.
   - You should land on the "Extensions" page. First, enable "Developer mode" in the top right corner, and then click "Load unpacked." Select the folder where you have the code for the Distraction Dodger extension, and *voilà*, you should now have the extension in your browser.

## How Does It Work
Here's a link to a demo video where I showcase the extension in action and explain how to set it up: 
But basically:
- In the popup, you can manage the websites that the extension tracks (the "distracting" websites you don't want to spend too much time on). You can add a website in 3 ways. Let's take `youtube.com` as an example; here's what you can enter to properly select it as a website to be tracked:
  1. youtube.com
  2. https://youtube.com
  3. https://www.youtube.com
  If you just copy the URL of a website that you are on and paste it, that should work.  
  (*Please add only website domains, not subdomains or paths to specific tabs on a website.*)
- You can delete websites or edit notifications for a website. Each website comes with 2 pre-defined notifications by default. A notification will be displayed on the website according to its settings.
- You can delete notifications, create new ones, or edit existing ones. Each notification has these settings that you can change:
  1. **blockWebsite** - If turned on, the notification will persistently be displayed on a website so you can't use it for *blockDuration* (amount of time in minutes). You will only be able to close it after that duration. If turned off, you can ignore the notification (close it).
  2. **activateAfter** - The amount of time spent on a website before the notification is triggered (in minutes). Note that there will be a timer showing you how much time you have spent on a website. When the website is blocked, the timer won't count.
  3. **blockDuration** - Amount of time for which a website should be blocked (the notification will persistently display). Always 0 if blockWebsite isn't enabled.
  4. **Notification Text** - The text that will appear on your notification.
  5. **Image URL** - A link to an image that should be displayed on the notification. It can also be a GIF. Find a link online or something.
  6. **Sound Effect URL** - A link to a sound that will trigger when the notification is displayed. It should start playing automatically, but it doesn't work for some websites. In that scenario, you can control the audio with the controls (play, pause, and reset). It must be a *direct link* to the sound, not a preview page that has the sound in it. Dropbox worked for me, for example. You might have to modify the link you get, though, to make it a direct one.
  7. **Text Color** - The color of the text on the notification.
  8. **Main Color** - Changes the color of some elements of the notification. You can play around with it and see what it changes.
  9. **Secondary Color** - Changes the color of some elements of the notification (different ones than Main Color). You can play around with it and see what it changes.
  10. **Background Color** - Changes the background color of the notification.
  **At the top, there is a preview of the notification so you can see the visual changes**.
- When you are on a website that is tracked by the extension, a timer will appear in the top left corner. It shows you how much time you spent on a website.
- When the time you spent on a website meets the `activateAfter` value of a notification for this website, the notification will be displayed. The notification won't disappear until you click the "ignore" button. Otherwise, it will persist even if you open the website in a different tab.

## Final Words
It's been a whole lot of a journey, but I hope it will pay off, both in new knowledge, experience, and skills I got but also in **your votes** and **Doubloons** 😊. 
I want to thank people from Hack Club for organizing this awesome program. I will probably keep making improvements to this extension so it can be used daily by people (not that that's not possible now 😉). But RIGHT NOW, I need a break from it 😁.
