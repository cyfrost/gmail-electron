import { app, BrowserWindow, shell, Menu } from 'electron';
import config, { ConfigKey } from './config';
import log from 'electron-log';
import * as main from './app';
import { getMainWindow } from './utils';
import * as path from 'path';

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
            app.removeAsDefaultProtocolClient('mailto');
          } else {
            app.setAsDefaultProtocolClient('mailto');
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
          config.clear();
          // Restart without firing quitting events
          app.relaunch();
          app.exit(0);
        }
      },
      {
        type: 'separator'
      },
      {
        label: 'Quit',
        accelerator: 'CommandOrControl+Shift+Q',
        click() {
          app.quit();
        }
      }
    ]
  },
  {
    role: 'editMenu'
  },
  {
    label: 'Settings',
    submenu: [
      {
        label: 'Auto-start at login',
        type: 'checkbox',
        checked: config.get(ConfigKey.AutoStartOnLogin),
        click({ checked }: { checked: boolean }) {
          config.set(ConfigKey.AutoStartOnLogin, checked);
          checked ? main.addSelfToSystemStartup() : main.removeSelfToSystemStartup();
        }
      },
      {
        label: 'Always launch minimized',
        type: 'checkbox',
        checked: config.get(ConfigKey.LaunchMinimized),
        click({ checked }: { checked: boolean }) {
          config.set(ConfigKey.LaunchMinimized, checked);
        }
      },
      {
        label: 'Auto-hide the menu bar',
        type: 'checkbox',
        checked: config.get(ConfigKey.AutoHideMenuBar),
        click({ checked }: { checked: boolean }) {
          config.set(ConfigKey.AutoHideMenuBar, checked);
          main.setAppMenus();
        }
      },
      {
        label: 'Enable Tray icon',
        type: 'checkbox',
        checked: config.get(ConfigKey.EnableTrayIcon),
        click({ checked }: { checked: boolean }) {
          config.set(ConfigKey.EnableTrayIcon, checked);
          checked ? main.createTray() : main.removeTrayIcon();
        }
      },
      {
        label: 'Edit Config file manually',
        click() {
          config.openInEditor();
        }
      }
    ]
  },
  {
    label: 'Window',
    role: 'window',
    submenu: [
      {
        label: `Reload`,
        role: 'reload',
        accelerator: 'CommandOrControl+R',
        click() {
          let mainWindow = BrowserWindow.getAllWindows()[0];
          mainWindow.reload();
        }
      },
      {
        label: 'Minimize',
        accelerator: 'CommandOrControl+M',
        role: 'minimize'
      },
      {
        label: 'Close',
        accelerator: 'CommandOrControl+W',
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
          main.showAppAbout();
        }
      },
      {
        label: 'View Logs',
        click() {
          shell.openItem(log.transports.file.findLogPath());
        }
      },
      {
        type: 'separator'
      },
      {
        label: `Visit GitHub repo`,
        click() {
          shell.openExternal('https://github.com/cyfrost/gmail-electron');
        }
      },
      {
        label: 'Report a problem',
        click() {
          shell.openExternal('https://github.com/cyfrost/gmail-electron/issues/new/choose');
        }
      }
    ]
  }
];

const menu = Menu.buildFromTemplate(menuTemplate);
export default menu;
