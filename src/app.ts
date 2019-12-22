import * as path from "path";
import {
  app,
  ipcMain as ipc,
  shell,
  BrowserWindow,
  Menu,
  Tray,
  MenuItemConstructorOptions
} from "electron";
import * as log from "electron-log";
import * as electronContextMenu from "electron-context-menu";
import { init as initDownloads } from "./download";
import config, { ConfigKey } from "./config";
import menu from "./menu";
import { getUrlAccountId } from "./helpers";
import { getMainWindow } from "./utils";
import { is } from "electron-util";
const { dialog } = require('electron')


let mainWindow: BrowserWindow;
let onlineStatusWindow: BrowserWindow;
let aboutWindow: any;
let replyToWindow: BrowserWindow;
let isQuitting = false;
let tray: Tray;
let trayContextMenu: any;
const shouldStartMinimized = app.commandLine.hasSwitch("start-minimized") || app.commandLine.hasSwitch("launch-minimized") || config.get(ConfigKey.LaunchMinimized);

init();

function init() {
  if (is.macos) {
    app.quit();
  }

  validateSingleInstance();
  app.setAppUserModelId("com.cyfrost.gmail");
  initDownloads();
  electronContextMenu({
    showCopyImageAddress: true,
    showSaveImageAs: true
  });
  registerIPCHandlers();

  app.on("open-url", (event, url) => {
    event.preventDefault();
    createMailto(url);
  });

  app.on("before-quit", () => {
    isQuitting = true;
    config.set(ConfigKey.LastWindowState, {
      bounds: mainWindow.getBounds(),
      fullscreen: mainWindow.isFullScreen(),
      maximized: mainWindow.isMaximized()
    });
  });

  app.on("ready", initGmail);
}

function validateSingleInstance() {
  const gotTheLock = app.requestSingleInstanceLock();

  if (!gotTheLock) {
    app.quit();
  } else {
    app.on("second-instance", () => {
      mainWindow.show();
    });
  }
}

function displayMainWindow() {
  if (!shouldStartMinimized) {
    mainWindow.show();
  } else {
    mainWindow.hide();
  }
}

function createWindow(): void {
  const lastWindowState: any = config.get(ConfigKey.LastWindowState);

  mainWindow = new BrowserWindow({
    title: app.getName(),
    width: lastWindowState.bounds.width,
    height: lastWindowState.bounds.height,
    x: lastWindowState.bounds.x,
    y: lastWindowState.bounds.y,
    webPreferences: {
      nodeIntegration: false,
      nativeWindowOpen: true
    },
    show: !shouldStartMinimized
  });

  if (lastWindowState.maximized && !mainWindow.isMaximized() && !shouldStartMinimized) {
    mainWindow.maximize();
  }

  mainWindow.loadURL("https://mail.google.com");

  mainWindow.on("close", e => {
    if (!isQuitting) {
      e.preventDefault();
      mainWindow.blur();
      mainWindow.hide();
    }
  });

  mainWindow.on("minimize", () => toggleAppVisiblityTrayItem(false));
  mainWindow.on("hide", () => toggleAppVisiblityTrayItem(false));
  mainWindow.on("show", () => toggleAppVisiblityTrayItem(true));
}

function removeTrayIcon() {
  tray.destroy();
}

function toggleAppVisiblityTrayItem(isMainWindowVisible: boolean): void {
  if (!config.get(ConfigKey.EnableTrayIcon) || !tray) {
    return;
  }

  trayContextMenu.getMenuItemById(
    "show-win"
  ).visible = !isMainWindowVisible;
  trayContextMenu.getMenuItemById(
    "hide-win"
  ).visible = isMainWindowVisible;
  tray.setContextMenu(trayContextMenu);
}

function createMailto(url: string): void {
  replyToWindow = new BrowserWindow({
    parent: mainWindow
  });

  replyToWindow.loadURL(
    `https://mail.google.com/mail/?extsrc=mailto&url=${url}`
  );
}

function registerIPCHandlers() {
  ipc.on("online-status-changed", (_event: any, status: string) => {
    log.info("Network change detected: now " + status);
    if (config.get(ConfigKey.EnableTrayIcon) && tray) {
      const icon =
      status === "online"
        ? "tray-icon-unread.png"
        : "tray-icon.png";
    const iconPath = path.join(__dirname, "../src/assets/", icon);
    tray.setImage(iconPath);
    }
  });
}

function loadNetworkChangeHandler() {
  onlineStatusWindow = new BrowserWindow({
    width: 0,
    height: 0,
    show: false,
    webPreferences: { nodeIntegration: true }
  });

  onlineStatusWindow.loadURL(
    `file://${__dirname}/../src/assets/OnlineStatus.html`
  );
}

function setAppMenus() {
  Menu.setApplicationMenu(menu);
  mainWindow.setMenuBarVisibility(false);
  mainWindow.setAutoHideMenuBar(true);
}

function initGmail() {
  loadNetworkChangeHandler();
  createWindow();
  setAppMenus();
  if (config.get(ConfigKey.EnableTrayIcon) && !tray) {
    createTray();
  }

  mainWindow.webContents.on(
    "did-finish-load",
    onGmailLoadingFinishedHandler
  );

  mainWindow.webContents.on("new-window", (event, url, _1, _2, options) =>
    onNewWindowEventHandler(event, url, _1, _2, options)
  );
}

function onGmailLoadingFinishedHandler() {
  let loggerOutput =
    "Successfully finished loading Gmail...\n\nDebug Info:\n============\nNode: " +
    process.versions.node +
    "\nElectron: " +
    process.versions.electron +
    "\nChromium: " +
    process.versions.chrome +
    "\n\n";
  log.info(loggerOutput);
  if (config.get(ConfigKey.EnableTrayIcon) && tray) {
    tray.setImage(
      path.join(__dirname, "../src/assets/tray-icon-unread.png")
    );
  }
  displayMainWindow();
}

function onNewWindowEventHandler(event, url, _1, _2, options) {
  event.preventDefault();
  if (/^https:\/\/accounts\.google\.com/.test(url)) {
    mainWindow.loadURL(url);
  } else if (/^https:\/\/mail\.google\.com/.test(url)) {
    const currentAccountId = getUrlAccountId(
      mainWindow.webContents.getURL()
    );
    const targetAccountId = getUrlAccountId(url);
    if (targetAccountId !== currentAccountId) {
      return mainWindow.loadURL(url);
    }
    event.newGuest = new BrowserWindow({
      ...options,
      x: null,
      y: null
    });
    event.newGuest.webContents.on(
      "new-window",
      (event: Event, url: string) => {
        event.preventDefault();
        shell.openExternal(url);
      }
    );
  } else {
    shell.openExternal(cleanURLFromGoogle(url));
  }
  return null;
}

function cleanURLFromGoogle(url: string): string {
  if (!url.includes('google.com/url')) {
    return url
  }

  const parsedUrl = new URL(url)
  return parsedUrl.searchParams.get('q') || url
}

function createTray() {
  const appName = app.getName();
  const iconPath = path.join(__dirname, "../src/assets/tray-icon.png");

  const contextMenuTemplate: MenuItemConstructorOptions[] = [
    {
      label: "Show",
      click: () => mainWindow.show(),
      visible: false,
      id: "show-win"
    },
    {
      label: "Hide",
      click: () => mainWindow.hide(),
      id: "hide-win"
    },
    {
      label: "About",
      click: displayAppAbout
    },
    {
      role: "quit"
    }
  ];

  trayContextMenu = Menu.buildFromTemplate(contextMenuTemplate);
  tray = new Tray(iconPath);
  tray.setToolTip(appName);
  tray.setContextMenu(trayContextMenu);
  tray.on("click", () => mainWindow.show());
  tray.on("double-click", () => mainWindow.show());
}

function addSelfToSystemStartup() {
  if (is.windows) {
    const appFolder = path.dirname(process.execPath)
    const updateExe = path.resolve(appFolder, '..', 'Update.exe')
    const exeName = path.basename(process.execPath)

    app.setLoginItemSettings({
      openAtLogin: true,
      path: updateExe,
      args: [
        '--processStart', `"${exeName}"`
      ]
    })
  } else if (is.linux) {

  }



}

function removeSelfToSystemStartup() {
  if (is.windows) {
    app.setLoginItemSettings({
      openAtLogin: false
    })
  }
}

function displayAppAbout() {
  if (aboutWindow) {
    aboutWindow.show();
    return;
  } else {
    aboutWindow = new BrowserWindow({
      title: "About Gmail",
      width: 490,
      height: 630,
      resizable: false,
      center: true,
      frame: true,
      webPreferences: {
        nodeIntegration: true,
        nativeWindowOpen: true
      }
    });
  }
  aboutWindow.on("close", () => {
    aboutWindow = null;
  });
  aboutWindow.setMenu(null);
  aboutWindow.setMenuBarVisibility(false);
  aboutWindow.loadURL(`file://${__dirname}/../src/assets/about.html`);
  aboutWindow.show();
}

export { removeTrayIcon, createTray, displayAppAbout, addSelfToSystemStartup, removeSelfToSystemStartup }
