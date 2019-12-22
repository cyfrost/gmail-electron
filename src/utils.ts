import { app, BrowserWindow, dialog } from 'electron';

export function getMainWindow(): BrowserWindow {
    return BrowserWindow.getAllWindows()[0];
}

export function sendChannelToMainWindow(channel: string, ...args: unknown[]): void {

    dialog.showMessageBox(getMainWindow(), {
        message: BrowserWindow.getAllWindows().length + ''
    })
    getMainWindow().webContents.send(channel, ...args);
}
