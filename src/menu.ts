import { app, BrowserWindow, shell, Menu } from 'electron'
import config from './config'

const darwinMenu: any[] = [
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
        click: function() {
          let mainWindow = BrowserWindow.getAllWindows()[0];
          if (mainWindow) {
            mainWindow.reload()
          }
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
        role: 'about'
      },

      {
        type: 'separator'
      },
      {
        label: `Check for updates`,
        click() {
          shell.openExternal(
            'https://github.com/cyfrost/gmail-electron/releases'
          )
        }
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

const menu = Menu.buildFromTemplate(darwinMenu)
export default menu
