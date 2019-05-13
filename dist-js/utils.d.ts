import { BrowserWindow } from 'electron'
export declare function getMainWindow(): BrowserWindow
export declare function sendChannelToMainWindow(
  channel: string,
  ...args: unknown[]
): void
export declare function showRestartDialog(enabled: boolean, name: string): void
