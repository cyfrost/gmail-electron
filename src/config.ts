import { is } from 'electron-util'

import Store = require('electron-store')

interface LastWindowState {
  bounds: {
    width: number
    height: number
    x: number | undefined
    y: number | undefined
  }
  fullscreen: boolean
  maximized: boolean
}

export enum ConfigKey {
  LastWindowState = 'lastWindowState',
  LaunchMinimized = 'launchMinimized',
  AutoStartOnLogin = 'autoStartOnLogin',
  AutoHideMenuBar = 'autoHideMenuBar',
  EnableTrayIcon = 'enableTrayIcon',
}

type TypedStore = {
  [ConfigKey.LastWindowState]: LastWindowState
  [ConfigKey.LaunchMinimized]: boolean
  [ConfigKey.AutoHideMenuBar]: boolean
  [ConfigKey.AutoStartOnLogin]: boolean
  [ConfigKey.EnableTrayIcon]: boolean
}

const defaults = {
  [ConfigKey.LastWindowState]: {
    bounds: {
      width: 800,
      height: 600,
      x: undefined,
      y: undefined
    },
    fullscreen: false,
    maximized: true
  },
  [ConfigKey.LaunchMinimized]: false,
  [ConfigKey.AutoHideMenuBar]: false,
  [ConfigKey.AutoStartOnLogin]: false,
  [ConfigKey.EnableTrayIcon]: false
}

const config = new Store<TypedStore>({
  defaults,
  name: 'config'
})

export default config
