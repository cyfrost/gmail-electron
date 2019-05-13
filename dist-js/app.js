"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const electron_1 = require("electron");
const electron_updater_1 = require("electron-updater");
const electron_util_1 = require("electron-util");
const electron_log_1 = __importDefault(require("electron-log"));
const electron_dl_1 = __importDefault(require("electron-dl"));
const electron_context_menu_1 = __importDefault(require("electron-context-menu"));
const config_1 = __importDefault(require("./config"));
const debug_1 = require("./debug");
const menu_1 = __importDefault(require("./menu"));
const minimal_mode_1 = require("./minimal-mode");
const helpers_1 = require("./helpers");
// Initialize the debug mode handler when starting the app
debug_1.init();
electron_dl_1.default({ showBadge: false });
electron_context_menu_1.default({ showCopyImageAddress: true, showSaveImageAs: true });
if (!electron_util_1.is.development) {
    electron_log_1.default.transports.file.level = 'info';
    electron_updater_1.autoUpdater.logger = electron_log_1.default;
    const UPDATE_CHECK_INTERVAL = 60000 * 60 * 3; // 3 Hours
    setInterval(() => {
        electron_updater_1.autoUpdater.checkForUpdates();
    }, UPDATE_CHECK_INTERVAL);
    electron_updater_1.autoUpdater.checkForUpdates();
}
electron_1.app.setAppUserModelId('io.cheung.gmail-desktop');
let mainWindow;
let replyToWindow;
let isQuitting = false;
let tray;
if (!electron_1.app.requestSingleInstanceLock()) {
    electron_1.app.quit();
}
electron_1.app.on('second-instance', () => {
    if (mainWindow) {
        if (mainWindow.isMinimized()) {
            mainWindow.restore();
        }
        mainWindow.show();
    }
});
function createWindow() {
    const lastWindowState = config_1.default.get('lastWindowState');
    mainWindow = new electron_1.BrowserWindow({
        title: electron_1.app.getName(),
        titleBarStyle: config_1.default.get('customStyles') ? 'hiddenInset' : 'default',
        width: lastWindowState.bounds.width,
        height: lastWindowState.bounds.height,
        x: lastWindowState.bounds.x,
        y: lastWindowState.bounds.y,
        webPreferences: {
            nodeIntegration: false,
            nativeWindowOpen: true,
            preload: path_1.default.join(__dirname, 'preload')
        }
    });
    if (lastWindowState.fullscreen && !mainWindow.isFullScreen()) {
        mainWindow.setFullScreen(lastWindowState.fullscreen);
    }
    if (lastWindowState.maximized && !mainWindow.isMaximized()) {
        mainWindow.maximize();
    }
    mainWindow.loadURL('https://mail.google.com');
    mainWindow.webContents.on('dom-ready', () => {
        addCustomCSS(mainWindow);
        // Initialize minimal mode if the setting is turned on
        minimal_mode_1.init();
    });
    mainWindow.on('close', e => {
        if (!isQuitting) {
            e.preventDefault();
            mainWindow.blur();
            mainWindow.hide();
        }
    });
    electron_1.ipcMain.on('unread-count', (_, unreadCount) => {
        if (electron_util_1.is.macos) {
            electron_1.app.dock.setBadge(unreadCount ? unreadCount.toString() : '');
        }
        if ((electron_util_1.is.linux || electron_util_1.is.windows) && tray) {
            const icon = unreadCount ? 'tray-icon-unread.png' : 'tray-icon.png';
            const iconPath = path_1.default.join(__dirname, '..', 'static', icon);
            tray.setImage(iconPath);
        }
    });
}
function createMailto(url) {
    replyToWindow = new electron_1.BrowserWindow({
        parent: mainWindow
    });
    replyToWindow.loadURL(`https://mail.google.com/mail/?extsrc=mailto&url=${url}`);
}
function addCustomCSS(windowElement) {
    if (!config_1.default.get('customStyles')) {
        return;
    }
    windowElement.webContents.insertCSS(fs_1.default.readFileSync(path_1.default.join(__dirname, '..', 'css', 'style.css'), 'utf8'));
    const platformCSSFile = path_1.default.join(__dirname, '..', 'css', `style.${helpers_1.platform}.css`);
    if (fs_1.default.existsSync(platformCSSFile)) {
        windowElement.webContents.insertCSS(fs_1.default.readFileSync(platformCSSFile, 'utf8'));
    }
}
electron_1.app.on('ready', () => {
    createWindow();
    electron_1.Menu.setApplicationMenu(menu_1.default);
    if ((electron_util_1.is.linux || electron_util_1.is.windows) && !tray) {
        const appName = electron_1.app.getName();
        const iconPath = path_1.default.join(__dirname, '..', 'static', 'tray-icon.png');
        const contextMenuTemplate = [
            {
                role: 'quit'
            }
        ];
        if (electron_util_1.is.linux) {
            contextMenuTemplate.unshift({
                click: () => {
                    mainWindow.show();
                },
                label: 'Show'
            });
        }
        const contextMenu = electron_1.Menu.buildFromTemplate(contextMenuTemplate);
        tray = new electron_1.Tray(iconPath);
        tray.setToolTip(appName);
        tray.setContextMenu(contextMenu);
        tray.on('click', () => {
            mainWindow.show();
        });
    }
    const { webContents } = mainWindow;
    webContents.on('dom-ready', () => {
        mainWindow.show();
    });
    webContents.on('new-window', (event, url, _1, _2, options) => {
        event.preventDefault();
        // `Add account` opens `accounts.google.com`
        if (/^https:\/\/accounts\.google\.com/.test(url)) {
            mainWindow.loadURL(url);
        }
        else if (/^https:\/\/mail\.google\.com/.test(url)) {
            // Check if the user switches accounts which is determined
            // by the URL: `mail.google.com/mail/u/<local_account_id>/...`
            const currentAccountId = helpers_1.getUrlAccountId(mainWindow.webContents.getURL());
            const targetAccountId = helpers_1.getUrlAccountId(url);
            if (targetAccountId !== currentAccountId) {
                return mainWindow.loadURL(url);
            }
            // Center the new window on the screen
            event.newGuest = new electron_1.BrowserWindow({
                ...options,
                x: null,
                y: null
            });
            event.newGuest.webContents.on('dom-ready', () => {
                addCustomCSS(event.newGuest);
            });
            event.newGuest.webContents.on('new-window', (event, url) => {
                event.preventDefault();
                electron_1.shell.openExternal(url);
            });
        }
        else {
            electron_1.shell.openExternal(url);
        }
        return null;
    });
});
electron_1.app.on('open-url', (event, url) => {
    event.preventDefault();
    createMailto(url);
});
electron_1.app.on('activate', () => {
    mainWindow.show();
});
electron_1.app.on('before-quit', () => {
    isQuitting = true;
    if (mainWindow) {
        config_1.default.set('lastWindowState', {
            bounds: mainWindow.getBounds(),
            fullscreen: mainWindow.isFullScreen(),
            maximized: mainWindow.isMaximized()
        });
    }
});
//# sourceMappingURL=app.js.map