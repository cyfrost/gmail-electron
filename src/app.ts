import * as path from 'path'
import * as fs from 'fs'
import {
  app,
  ipcMain as ipc,
  shell,
  BrowserWindow,
  Menu,
  Tray,
  MenuItemConstructorOptions
} from 'electron'
import { autoUpdater } from 'electron-updater'
import { is } from 'electron-util'
import * as log from 'electron-log'
import * as electronDl from 'electron-dl'
import * as electronContextMenu from 'electron-context-menu'

import config from './config'
import { init as initDebug } from './debug'
import menu from './menu'
import { platform, getUrlAccountId } from './helpers'

const shouldStartMinimized = app.commandLine.hasSwitch('start-minimized');

// Initialize the debug mode handler when starting the app
initDebug()

electronDl({ showBadge: false })
electronContextMenu({ showCopyImageAddress: true, showSaveImageAs: true })

if (!is.development) {
  log.transports.file.level = 'info'
  autoUpdater.logger = log

  const UPDATE_CHECK_INTERVAL = 60000 * 60 * 3 // 3 Hours
  setInterval(() => {
    autoUpdater.checkForUpdates()
  }, UPDATE_CHECK_INTERVAL)

  autoUpdater.checkForUpdates()
}

app.setAppUserModelId('io.cheung.gmail-desktop')

let mainWindow: BrowserWindow
let onlineStatusWindow: BrowserWindow
let replyToWindow: BrowserWindow
let isQuitting = false
let tray: Tray

if (!app.requestSingleInstanceLock()) {
  app.quit()
}

function displayMainWindow(){
  if (!shouldStartMinimized){
    mainWindow.show();
  }
  else{
    mainWindow.hide();
  }
}

app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) {
      mainWindow.restore()
    }

    mainWindow.show()
  }
})

function createWindow(): void {
  const lastWindowState: any = config.get('lastWindowState')

  mainWindow = new BrowserWindow({
    title: app.getName(),
    titleBarStyle: config.get('customStyles') ? 'hiddenInset' : 'default',
    width: lastWindowState.bounds.width,
    height: lastWindowState.bounds.height,
    x: lastWindowState.bounds.x,
    y: lastWindowState.bounds.y,
    webPreferences: {
      nodeIntegration: false,
      nativeWindowOpen: true,
      preload: path.join(__dirname, 'preload')
    }
  })

  if (lastWindowState.fullscreen && !mainWindow.isFullScreen()) {
    mainWindow.setFullScreen(lastWindowState.fullscreen)
  }

  if (lastWindowState.maximized && !mainWindow.isMaximized()) {
    mainWindow.maximize()
  }

  mainWindow.loadURL('https://mail.google.com')

  mainWindow.webContents.on('dom-ready', () => {
    log.info("Node Version: ", process.versions.node);
    log.info("Electron Version: ", process.versions.electron);
    log.info("Chromium Version:", process.versions.chrome);
    displayMainWindow();
  })

  mainWindow.on('close', e => {
    if (!isQuitting) {
      e.preventDefault()
      mainWindow.blur()
      mainWindow.hide()
    }
  })

  ipc.on('unread-count', (_: any, unreadCount: number) => {
    if ((is.linux || is.windows) && tray) {
      const icon = unreadCount ? 'tray-icon-unread.png' : 'tray-icon.png'
      const iconPath = path.join(__dirname, '..', 'static', icon)
      tray.setImage(iconPath)
    }
  })
}

function createMailto(url: string): void {
  replyToWindow = new BrowserWindow({
    parent: mainWindow
  })

  replyToWindow.loadURL(
    `https://mail.google.com/mail/?extsrc=mailto&url=${url}`
  )
}

function addCustomCSS(windowElement: BrowserWindow): void {
  if (!config.get('customStyles')) {
    return
  }

  windowElement.webContents.insertCSS(
    fs.readFileSync(path.join(__dirname, '..', 'css', 'style.css'), 'utf8')
  )

  const platformCSSFile = path.join(
    __dirname,
    '..',
    'css',
    `style.${platform}.css`
  )
  if (fs.existsSync(platformCSSFile)) {
    windowElement.webContents.insertCSS(
      fs.readFileSync(platformCSSFile, 'utf8')
    )
  }
}

ipc.on('online-status-changed', (_event: any, status: string) => {
  log.info("Online Status Changed")
  log.info(status)
  if (status === "online"){
    mainWindow.reload();
  }
})

app.on('ready', () => {
  
  onlineStatusWindow = new BrowserWindow({ width: 0, height: 0, show: false, webPreferences: {nodeIntegration: true} });
  onlineStatusWindow.loadURL(`file://${__dirname}/../extras/html/online_status.html`)

  createWindow()

  Menu.setApplicationMenu(menu)

  if ((is.linux || is.windows) && !tray) {
    const appName = app.getName()
    const iconPath = path.join(__dirname, '..', 'static', 'tray-icon.png')

    const contextMenuTemplate: MenuItemConstructorOptions[] = [
      {
        role: 'quit'
      }
    ]

    if (is.linux) {
      contextMenuTemplate.unshift({
        click: () => {
          mainWindow.show()
        },
        label: 'Show'
      },
      {
        label: ('Hide'),
        visible: !config.get("startminimized"), // Show this option on start
        click: function () {
          mainWindow.hide();
        }
      },
      {
        type: "separator"
      },
      // {
      //   label: "Options",
      //   click: global.settings.init
      // },
      {
        type: "separator"
      },
      // {
      //   label: "About",
      //   click: global.about.init
      // }
      )
    }

    const contextMenu = Menu.buildFromTemplate(contextMenuTemplate)

    tray = new Tray(iconPath)
    tray.setToolTip(appName)
    tray.setContextMenu(contextMenu)
    tray.on('click', () => {
      mainWindow.show()
    })
  }

  const { webContents } = mainWindow

  webContents.on('dom-ready', () => {
    displayMainWindow();
  })

  webContents.on('new-window', (event: any, url, _1, _2, options) => {
    event.preventDefault()

    // `Add account` opens `accounts.google.com`
    if (/^https:\/\/accounts\.google\.com/.test(url)) {
      mainWindow.loadURL(url)
    } else if (/^https:\/\/mail\.google\.com/.test(url)) {
      // Check if the user switches accounts which is determined
      // by the URL: `mail.google.com/mail/u/<local_account_id>/...`
      const currentAccountId = getUrlAccountId(mainWindow.webContents.getURL())
      const targetAccountId = getUrlAccountId(url)

      if (targetAccountId !== currentAccountId) {
        return mainWindow.loadURL(url)
      }

      // Center the new window on the screen
      event.newGuest = new BrowserWindow({
        ...options,
        x: null,
        y: null
      })

      event.newGuest.webContents.on('dom-ready', () => {
        addCustomCSS(event.newGuest)
      })

      event.newGuest.webContents.on(
        'new-window',
        (event: Event, url: string) => {
          event.preventDefault()
          shell.openExternal(url)
        }
      )
    } else {
      shell.openExternal(url)
    }
    return null
  })
})

app.on('open-url', (event, url) => {
  event.preventDefault()
  createMailto(url)
})

app.on('activate', () => {
  displayMainWindow();
})

app.on('before-quit', () => {
  isQuitting = true

  if (mainWindow) {
    config.set('lastWindowState', {
      bounds: mainWindow.getBounds(),
      fullscreen: mainWindow.isFullScreen(),
      maximized: mainWindow.isMaximized()
    })
  }
})
