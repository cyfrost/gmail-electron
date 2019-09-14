import * as fs from 'fs'
import * as Store from 'electron-store'
import * as oldConfig from 'electron-settings'

export interface LastWindowState {
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
  AutoUpdate = 'autoUpdate'
}

const defaults = {
  lastWindowState: ({
    bounds: {
      width: 800,
      height: 600,
      x: undefined as number | undefined,
      y: undefined as number | undefined
    },
    fullscreen: false,
    maximized: true
  } as unknown) as LastWindowState,
  debugMode: false,
  autoUpdate: true
}

const config = new Store({
  defaults,
  name: 'config'
})

// @TODO: Remove `electron-settings` in future version
function migrate(): void {
  const oldConfigFile = oldConfig.file()

  if (!fs.existsSync(oldConfigFile)) {
    return
  }

  if (oldConfig.has('debug-mode')) {
    const debugMode = (oldConfig.get('debug-mode') as unknown) as boolean
    config.set('debugMode', debugMode)
  }

  fs.unlinkSync(oldConfigFile)
}

migrate()

export default config
