import * as path from 'path';
import * as fs from 'fs';
import { app, dialog, ipcMain as ipc, shell, BrowserWindow, Menu, Tray, MenuItemConstructorOptions } from 'electron';
import * as log from 'electron-log';
import * as electronContextMenu from 'electron-context-menu';
import { init as initDownloadProvider } from './download';
import config, { ConfigKey } from './config';
import menu from './menu';
import { getUrlAccountId } from './helpers';
import { is } from 'electron-util';

let mainWindow: BrowserWindow;
let onlineStatusWindow: BrowserWindow;
let aboutWindow: any;
let replyToWindow: BrowserWindow;
let isQuitting = false;
let tray: Tray;
let isOnline = false;
let trayContextMenu: any;
const shouldStartMinimized =
  app.commandLine.hasSwitch('start-minimized') || app.commandLine.hasSwitch('launch-minimized') || config.get(ConfigKey.LaunchMinimized);

init();

function noMacOS() {
  if (is.macos) {
    log.error('Fatal: Detected process env as darwin, aborting due to lack of app support.');
    app.quit();
  }
}

function init() {
  noMacOS();
  validateSingleInstance();
  app.setAppUserModelId('Gmail');
  initDownloadProvider();
  electronContextMenu({
    showCopyImageAddress: true,
    showSaveImageAs: true,
    showCopyImage: true
  });

  app.on('open-url', (event, url) => {
    event.preventDefault();
    createMailto(url);
  });

  app.on('before-quit', () => {
    isQuitting = true;
    config.set(ConfigKey.LastWindowState, {
      bounds: mainWindow.getBounds(),
      fullscreen: mainWindow.isFullScreen(),
      maximized: mainWindow.isMaximized()
    });
  });

  app.on('ready', initGmail);
}

function initGmail() {
  loadNetworkChangeHandler();
  createWindow();
  setAppMenus();
  checkAutoStartStatus();
  createTray();

  mainWindow.webContents.on('did-finish-load', onGmailLoadingFinishedHandler);

  mainWindow.webContents.on('new-window', (event, url, _1, _2, options) => onNewWindowEventHandler(event, url, _1, _2, options));
}

function validateSingleInstance() {
  const gotTheLock = app.requestSingleInstanceLock();

  if (!gotTheLock) {
    log.error('Fatal: Failed to acquire single instance lock on main thread. Aborting!');
    app.quit();
  } else {
    app.on('second-instance', () => {
      log.info('Detected second instance invocation, resuing initial instance instead');
      mainWindow.show();
    });
  }
}

function displayMainWindow() {
  shouldStartMinimized ? mainWindow.hide() : mainWindow.show();
  log.info(`Window display mode: ${shouldStartMinimized ? 'hidden' : 'visible'}`);
}

function createWindow(): void {
  const lastWindowState: any = config.get(ConfigKey.LastWindowState);

  mainWindow = new BrowserWindow({
    title: app.name,
    width: lastWindowState.bounds.width,
    height: lastWindowState.bounds.height,
    x: lastWindowState.bounds.x,
    y: lastWindowState.bounds.y,
    webPreferences: {
      nodeIntegration: false,
      nativeWindowOpen: false,
      preload: path.join(__dirname, 'preload-injected.js')
    },
    show: !shouldStartMinimized
  });

  log.info('Main window creation successful!');

  if (lastWindowState.maximized && !mainWindow.isMaximized() && !shouldStartMinimized) {
    mainWindow.maximize();
  }

  mainWindow.loadURL('https://mail.google.com');

  mainWindow.on('close', e => {
    if (!isQuitting) {
      e.preventDefault();
      mainWindow.blur();
      mainWindow.hide();
    }
  });

  mainWindow.on('minimize', () => toggleAppVisiblityTrayItem(false));
  mainWindow.on('hide', () => toggleAppVisiblityTrayItem(false));
  mainWindow.on('show', () => toggleAppVisiblityTrayItem(true));
}

function removeTrayIcon() {
  if (is.linux) {
    log.warn(
      'Tray icon cannot be removed under linux due to a inconsistent behaviour of Tray indicators extension under GNOME and KDE. Waiting for app restart instead.'
    );
    dialog.showMessageBox(mainWindow, {
      buttons: ['OK'],
      message: 'Gmail needs to be restarted',
      detail: 'This change will take place on next restart of Gmail.'
    });
    return;
  }
  tray.destroy();
  log.info('Tray destroyed!');
}

function toggleAppVisiblityTrayItem(isMainWindowVisible: boolean): void {
  if (!config.get(ConfigKey.EnableTrayIcon) || !tray) {
    return;
  }

  trayContextMenu.getMenuItemById('show-win').visible = !isMainWindowVisible;
  trayContextMenu.getMenuItemById('hide-win').visible = isMainWindowVisible;
  tray.setContextMenu(trayContextMenu);
}

function createMailto(url: string): void {
  replyToWindow = new BrowserWindow({
    parent: mainWindow
  });

  replyToWindow.loadURL(`https://mail.google.com/mail/?extsrc=mailto&url=${url}`);
}

function loadNetworkChangeHandler() {
  onlineStatusWindow = new BrowserWindow({
    width: 0,
    height: 0,
    show: false,
    webPreferences: { nodeIntegration: true }
  });

  onlineStatusWindow.loadURL(`file://${__dirname}/../src/assets/OnlineStatus.html`);

  ipc.on('online-status-changed', (_event: any, status: string) => {
    isOnline = status === 'online';
    log.info('Network change detected: now ' + status);
    if (config.get(ConfigKey.EnableTrayIcon) && tray) {
      const icon = status === 'online' ? 'tray-icon-unread.png' : 'tray-icon.png';
      const iconPath = path.join(__dirname, '../src/assets/', icon);
      tray.setImage(iconPath);
    }
  });
  log.info('Registered IPC handler for network change detection.');
}

function setAppMenus() {
  const isMenuBarVisible = !config.get(ConfigKey.AutoHideMenuBar);
  Menu.setApplicationMenu(menu);
  mainWindow.setMenuBarVisibility(isMenuBarVisible);
  mainWindow.autoHideMenuBar = !isMenuBarVisible;
  log.info(`App menu is ${isMenuBarVisible ? 'set' : 'removed'}`);
}

function checkAutoStartStatus() {
  const isAutoStartEnabled = config.get(ConfigKey.AutoStartOnLogin);
  log.info(
    `Auto-start at login is ${isAutoStartEnabled ? 'enabled' : 'disabled'}, ${isAutoStartEnabled ? 'enabling' : 'disabling'} login item (if applicable).`
  );

  isAutoStartEnabled ? addSelfToSystemStartup() : removeSelfToSystemStartup();
}

function onGmailLoadingFinishedHandler() {
  log.info(
    `Gmail load successful...\n\nDebug Info:\n============\nNode: ${process.versions.node} \nElectron: ${process.versions.electron} \nChromium: ${process.versions.chrome}\n\n`
  );
  if (config.get(ConfigKey.EnableTrayIcon) && tray) {
    tray.setImage(path.join(__dirname, '../src/assets/tray-icon-unread.png'));
  }
  displayMainWindow();
  reloadAppTheme();
}

function onNewWindowEventHandler(event, url, _1, _2, options) {
  event.preventDefault();
  if (/^https:\/\/accounts\.google\.com/.test(url)) {
    mainWindow.loadURL(url);
  } else if (/^https:\/\/mail\.google\.com/.test(url)) {
    const currentAccountId = getUrlAccountId(mainWindow.webContents.getURL());
    const targetAccountId = getUrlAccountId(url);
    if (targetAccountId !== currentAccountId) {
      return mainWindow.loadURL(url);
    }
    event.newGuest = new BrowserWindow({
      ...options,

function reloadAppTheme() {
  const isDarkThemeEnabled = config.get(ConfigKey.EnableDarkTheme) === true;
  const wc = mainWindow.webContents;
  const ipcEvent = isDarkThemeEnabled ? 'enable-dark-mode' : 'disable-dark-mode';

  wc.send(ipcEvent, config.get(ConfigKey.DarkReaderConfig));
}
  }
  return null;
}

function cleanURLFromGoogle(url: string): string {
  if (!url.includes('google.com/url')) {
    return url;
  }

  log.info("Cleaning up google's tracking from outbound URL...");
  const parsedUrl = new URL(url);
  return parsedUrl.searchParams.get('q') || url;
}

function createTray() {
  if (!config.get(ConfigKey.EnableTrayIcon) || tray) {
    return;
  }

  const appName = app.name;
  const icon = isOnline ? 'tray-icon-unread.png' : 'tray-icon.png';
  const iconPath = path.join(__dirname, '../src/assets/', icon);

  const contextMenuTemplate: MenuItemConstructorOptions[] = [
    {
      label: 'Show',
      click: () => mainWindow.show(),
      visible: false,
      id: 'show-win'
    },
    {
      label: 'Hide',
      click: () => mainWindow.hide(),
      id: 'hide-win'
    },
    {
      label: 'About',
      click: showAppAbout
    },
    {
      role: 'quit'
    }
  ];

  trayContextMenu = Menu.buildFromTemplate(contextMenuTemplate);
  tray = new Tray(iconPath);
  tray.setToolTip(appName);
  tray.setContextMenu(trayContextMenu);
  tray.on('click', () => mainWindow.show());
  tray.on('double-click', () => mainWindow.show());
  log.info('Tray created successfully!');
}

function setAutoStartOnFreedesktop(enableAutoStart: boolean) {
  const xdgConfigDirectory: string = process.env.XDG_CONFIG_HOME;
  const useFallback = !xdgConfigDirectory || !fs.existsSync(xdgConfigDirectory);
  const startupDirectory = useFallback ? path.join(require('os').homedir(), '.config/autostart') : path.join(xdgConfigDirectory, 'autostart');
  const dotDesktopFile = path.join(startupDirectory, 'gmail.desktop');
  log.info(`File: ${dotDesktopFile}, using fallback: ${useFallback}`);

  if (!enableAutoStart) {
    if (!fs.existsSync(dotDesktopFile)) {
      log.warn('File not found: autostart script not found.');
      return;
    }

    fs.unlink(dotDesktopFile, err => {
      if (err) {
        return log.error(`Failed to remove self from autostart. ${err}`);
      }

      log.info('Successfully removed self from autostart on Linux');
    });
    return;
  }

  const freeDesktopStartupScript =
`
[Desktop Entry]
Name=Gmail
Exec=/opt/Gmail/gmail %U
Terminal=false
Type=Application
Icon=gmail
StartupWMClass=Gmail
Comment=Gmail desktop client for Linux, and Windows.
Categories=Network;Office;
`;

  if (fs.existsSync(dotDesktopFile)) {
    log.warn('Autostart script already exists, overwriting with current config.');
  }

  fs.writeFile(dotDesktopFile, freeDesktopStartupScript, (err) => {
    if(err) {
      return log.error(`Failed to add Gmail to startup ${err}`);
    }

    log.info('Gmail added to startup on Linux successfully!');
  });
}

function addSelfToSystemStartup() {
  if (is.windows) {
    const appFolder = path.dirname(process.execPath);
    const exeName = path.basename(process.execPath);
    const appPath = path.resolve(appFolder, exeName);

    app.setLoginItemSettings({
      openAtLogin: true,
      path: appPath
    });
    log.info('Added Gmail to auto-start at login');
  } else if (is.linux) {
    setAutoStartOnFreedesktop(true);
  }
}

function removeSelfToSystemStartup() {
  if (is.windows) {
    app.setLoginItemSettings({
      openAtLogin: false
    });
    log.info('Removed Gmail from startup items');
  } else if (is.linux) {
    setAutoStartOnFreedesktop(false);
  }
}

function showAppAbout() {
  if (aboutWindow) {
    aboutWindow.show();
    return;
  }

  aboutWindow = new BrowserWindow({
    title: 'About Gmail',
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

  aboutWindow.on('close', () => (aboutWindow = undefined));
  aboutWindow.setMenu(null);
  aboutWindow.setMenuBarVisibility(false);
  aboutWindow.loadURL(`file://${__dirname}/../src/assets/about.html`);
  aboutWindow.show();
}

export { setAppMenus, removeTrayIcon, createTray, showAppAbout, addSelfToSystemStartup, removeSelfToSystemStartup, reloadAppTheme };
