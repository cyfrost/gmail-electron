import { app, BrowserWindow, shell, Menu } from 'electron'
import config from './config'


const menuTemplate: any[] = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Set as default mailto client',
        type: 'checkbox',
        checked: app.isDefaultProtocolClient('mailto'),
        click() {
          if (app.isDefaultProtocolClient('mailto')) {
            app.removeAsDefaultProtocolClient('mailto')
          } else {
            app.setAsDefaultProtocolClient('mailto')
          }
        }
      },
      {
        type: 'separator'
      },
      {
        label: 'Clear app data and restart',
        click() {
          // Clear app config
          config.clear()
          // Restart without firing quitting events
          app.relaunch()
          app.exit(0)
        }
      },
      {
        type: 'separator'
      },
      {
        label: 'Quit',
        accelerator: 'CommandOrControl+Shift+Q',
        click() {
          app.quit()
        }
      }
    ]
  },
  {
    label: 'View',
    role: 'view',
    submenu: [
      {
        label: `Reload`,
        role: 'reload',
        accelerator: 'CommandOrControl+R',
        click() {
          let mainWindow = BrowserWindow.getAllWindows()[0]
          mainWindow.reload()
        }
      },
      {
        label: 'Minimize',
        role: 'minimize'
      },
      {
        label: 'Close',
        accelerator: 'escape',
        role: 'close'
      }
    ]
  },
  {
    label: 'Help',
    role: 'help',
    submenu: [
      {
        label: `About`,
        role: 'about',
        click() {
          let mainWindow = BrowserWindow.getAllWindows()[0]
          mainWindow.webContents.send('display_about_window')
        }
      },

      {
        type: 'separator'
      },
      {
        label: `Visit GitHub repo`,
        click() {
          shell.openExternal('https://github.com/cyfrost/gmail-electron')
        }
      },
      {
        label: 'Report a problem',
        click() {
          shell.openExternal(
            'https://github.com/cyfrost/gmail-electron/issues/new/choose'
          )
        }
      }
    ]
  }
]

const menu = Menu.buildFromTemplate(menuTemplate)
export default menu
