"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const element_ready_1 = __importDefault(require("element-ready"));
const electron_log_1 = __importDefault(require("electron-log"));
const INTERVAL = 1000;
let count;
function getUnreadCount() {
    // Find the number next to the inbox label
    const navigation = document.querySelector('div[role=navigation] [href*="#inbox"]');
    if (navigation) {
        const label = navigation.parentElement.parentElement.querySelector('.bsU');
        // Return the unread count (0 by default)
        if (label) {
            return Number(label.innerText.match(/\d/));
        }
    }
    return 0;
}
function updateUnreadCount() {
    const newCount = getUnreadCount();
    // Only fire the event when necessary
    if (count !== newCount) {
        electron_1.ipcRenderer.send('unread-count', newCount);
        count = newCount;
    }
}
function attachButtonListeners() {
    // For windows that won't include the selectors we are expecting,
    //   don't wait for them appear as they never will
    if (!window.location.search.includes('&search=inbox')) {
        return;
    }
    const selectors = [
        'lR',
        'nX' // Delete
    ];
    selectors.forEach(async (selector) => {
        try {
            const buttonReady = element_ready_1.default(`body.xE .G-atb .${selector}`);
            const readyTimeout = setTimeout(() => {
                buttonReady.cancel(`Detect button "${selector}" timed out`);
            }, 10000);
            const button = await buttonReady;
            clearTimeout(readyTimeout);
            button.addEventListener('click', () => window.close());
        }
        catch (error) {
            electron_log_1.default.error(error);
        }
    });
}
window.addEventListener('load', () => {
    // Set the initial unread count
    updateUnreadCount();
    // Listen to changes to the document title
    const title = document.querySelector('title');
    if (title) {
        const observer = new MutationObserver(updateUnreadCount);
        observer.observe(title, { childList: true });
    }
    // Check the unread count on an interval timer for instances where
    //   the title doesn't change
    setInterval(updateUnreadCount, INTERVAL);
    // Attaching the button listeners to the buttons
    //   that should close the new window
    attachButtonListeners();
});
// Toggle the minimal mode class when a message is
//   received from the main process
electron_1.ipcRenderer.on('set-minimal-mode', (_, enabled) => {
    document.body.classList[enabled ? 'add' : 'remove']('minimal-mode');
});
//# sourceMappingURL=preload.js.map