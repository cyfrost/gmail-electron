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
  
  fs.unlinkSync(oldConfigFile)
}

migrate()

export default config
