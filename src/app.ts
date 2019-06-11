import * as path from 'path'
import {
  app,
  ipcMain as ipc,
  shell,
  BrowserWindow,
  Menu,
  Tray,
  MenuItemConstructorOptions
} from 'electron'
import { is } from 'electron-util'
import * as log from 'electron-log'
import * as electronDl from 'electron-dl'
import * as electronContextMenu from 'electron-context-menu'

import config from './config'
import menu from './menu'
import { getUrlAccountId } from './helpers'

const shouldStartMinimized = app.commandLine.hasSwitch('start-minimized')

electronDl({ showBadge: false })
electronContextMenu({ showCopyImageAddress: true, showSaveImageAs: true })

app.setAppUserModelId('io.cheung.gmail-desktop')

let mainWindow: BrowserWindow
let onlineStatusWindow: BrowserWindow
let aboutWindow: BrowserWindow
let replyToWindow: BrowserWindow
let isQuitting = false
let tray: Tray
let trayContextMenu: any

function displayMainWindow() {
  if (!shouldStartMinimized) {
    mainWindow.show()
  } else {
    mainWindow.hide()
  }
}

const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore()
        mainWindow.focus()
      }
      mainWindow.show()
      mainWindow.focus()
    }
  })
}

function createWindow(): void {
  const lastWindowState: any = config.get('lastWindowState')

  mainWindow = new BrowserWindow({
    title: app.getName(),
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
    log.info('Node Version: ', process.versions.node)
    log.info('Electron Version: ', process.versions.electron)
    log.info('Chromium Version:', process.versions.chrome)
    displayMainWindow()
  })

  mainWindow.on('close', e => {
    if (!isQuitting) {
      e.preventDefault()
      mainWindow.blur()
      mainWindow.hide()
    }
  })

  mainWindow.on('hide', () => {
    trayContextMenu.getMenuItemById('show-win').enabled = true
    trayContextMenu.getMenuItemById('show-win').visible = true
    trayContextMenu.getMenuItemById('hide-win').enabled = false
    trayContextMenu.getMenuItemById('hide-win').visible = false
    tray.setContextMenu(trayContextMenu)
  })

  mainWindow.on('show', () => {
    trayContextMenu.getMenuItemById('show-win').enabled = false
    trayContextMenu.getMenuItemById('show-win').visible = false
    trayContextMenu.getMenuItemById('hide-win').enabled = true
    trayContextMenu.getMenuItemById('hide-win').visible = true
    tray.setContextMenu(trayContextMenu)
  })

  ipc.on('unread-count', (_: any, unreadCount: number) => {
    if ((is.linux || is.windows) && tray) {
      const icon = unreadCount ? 'tray-icon-unread.png' : 'tray-icon.png'
      const iconPath = path.join(__dirname, '..', 'src', 'assets', icon)
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

ipc.on('online-status-changed', (_event: any, status: string) => {
  log.info('Online Status Changed')
  log.info(status)
  if (status === 'online') {
    mainWindow.reload()
  }
})

app.on('ready', () => {
  onlineStatusWindow = new BrowserWindow({
    width: 0,
    height: 0,
    show: false,
    webPreferences: { nodeIntegration: true }
  })
  onlineStatusWindow.loadURL(
    `file://${__dirname}/../extras/html/online_status.html`
  )

  createWindow()

  Menu.setApplicationMenu(menu)

  mainWindow.setMenuBarVisibility(false)
  mainWindow.setAutoHideMenuBar(true)

  if (!tray) {
    const appName = app.getName()
    const iconPath = path.join(
      __dirname,
      '..',
      'src',
      'assets',
      'tray-icon.png'
    )

    const contextMenuTemplate: MenuItemConstructorOptions[] = [
      {
        role: 'quit'
      }
    ]

    contextMenuTemplate.unshift(
      {
        label: 'Show',
        click: function() {
          mainWindow.show()
        },
        enabled: false,
        id: 'show-win'
      },
      {
        label: 'Hide',
        click: function() {
          mainWindow.hide()
        },
        id: 'hide-win'
      },
      {
        type: 'separator'
      },
      {
        label: 'About',
        click: displayAppAbout
      },
      // {
      //   label: "Options",
      //   click: global.settings.init
      // },
      {
        type: 'separator'
      }
    )
    trayContextMenu = Menu.buildFromTemplate(contextMenuTemplate)

    tray = new Tray(iconPath)
    tray.setToolTip(appName)
    tray.setContextMenu(trayContextMenu)
    tray.on('click', () => {
      mainWindow.show()
    })
  }

  const { webContents } = mainWindow

  webContents.on('dom-ready', () => {
    displayMainWindow()
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

function displayAppAbout() {
  
  if (aboutWindow !== undefined){
    aboutWindow.show();
  }
  else{
    aboutWindow = new BrowserWindow({
    title: 'About ' + app.getName(),
    width: 570,
    height: 680,
    resizable: false,
    center: true,
    frame: true,
    webPreferences: {
      nodeIntegration: true,
      nativeWindowOpen: true
    }
    })
  }
  aboutWindow.loadURL(`file://${__dirname}/../extras/html/about.html`);
  aboutWindow.setMenu(null)
  aboutWindow.setMenuBarVisibility(false)
  aboutWindow.show()
}

app.on('open-url', (event, url) => {
  event.preventDefault()
  createMailto(url)
})

app.on('activate', () => {
  displayMainWindow()
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
