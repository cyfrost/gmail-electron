"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
function getMainWindow() {
    return electron_1.BrowserWindow.getAllWindows()[0];
}
exports.getMainWindow = getMainWindow;
function sendChannelToMainWindow(channel, ...args) {
    getMainWindow().webContents.send(channel, ...args);
}
exports.sendChannelToMainWindow = sendChannelToMainWindow;
function showRestartDialog(enabled, name) {
    const state = enabled ? 'enable' : 'disable';
    electron_1.dialog.showMessageBox({
        type: 'info',
        buttons: ['Restart', 'Cancel'],
        message: 'Restart required',
        detail: `To ${state} ${name}, please restart ${electron_1.app.getName()}`
    }, response => {
        // If restart was clicked (index of 0), restart the app
        if (response === 0) {
            electron_1.app.relaunch();
            electron_1.app.quit();
        }
    });
}
exports.showRestartDialog = showRestartDialog;
//# sourceMappingURL=utils.js.map