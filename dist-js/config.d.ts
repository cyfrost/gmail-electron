import Store from 'electron-store'
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
declare const config: Store<boolean | LastWindowState>
export default config
