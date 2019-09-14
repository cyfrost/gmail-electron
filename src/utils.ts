import { app, BrowserWindow, dialog, MessageBoxOptions } from 'electron'

export function getMainWindow(): BrowserWindow {
  return BrowserWindow.getAllWindows()[0]
}

export function sendChannelToMainWindow(
  channel: string,
  ...args: unknown[]
): void {
  getMainWindow().webContents.send(channel, ...args)
}

export function showRestartDialog(enabled: boolean, name: string): void {
  const state = enabled ? 'enable' : 'disable'

  const msgOptions: MessageBoxOptions = {
    type: 'info',
    buttons: ['Restart', 'Cancel'],
    message: 'Restart required',
    detail: `To ${state} ${name}, please restart ${app.getName()}`
  }

  dialog.showMessageBox(getMainWindow(), msgOptions).then((response: any) => {
    if (response === 0) {
      app.relaunch()
      app.quit()
    }
  })
}
