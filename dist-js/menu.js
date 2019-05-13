"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const electron_util_1 = require("electron-util");
const config_1 = __importDefault(require("./config"));
const utils_1 = require("./utils");
const minimal_mode_1 = require("./minimal-mode");
const APP_NAME = electron_1.app.getName();
const darwinMenu = [
    {
        label: APP_NAME,
        submenu: [
            {
                label: `About ${APP_NAME}`,
                role: 'about'
            },
            {
                label: `Hide ${APP_NAME}`,
                accelerator: 'Cmd+H',
                role: 'hide'
            },
            {
                label: 'Hide Others',
                accelerator: 'Cmd+Shift+H',
                role: 'hideothers'
            },
            {
                label: 'Show All',
                role: 'unhide'
            },
            {
                type: 'separator'
            },
            {
                label: `Quit ${APP_NAME}`,
                accelerator: 'Cmd+Q',
                click() {
                    electron_1.app.quit();
                }
            }
        ]
    },
    {
        label: 'Settings',
        submenu: [
            {
                label: 'Appearance',
                submenu: [
                    {
                        label: 'Custom styles',
                        type: 'checkbox',
                        checked: config_1.default.get('customStyles'),
                        click(checked) {
                            config_1.default.set('customStyles', checked);
                            utils_1.showRestartDialog(checked, 'custom styles');
                        }
                    },
                    {
                        label: 'Minimal Mode',
                        type: 'checkbox',
                        checked: config_1.default.get('minimalMode'),
                        click(checked) {
                            config_1.default.set('minimalMode', checked);
                            minimal_mode_1.setMinimalMode(checked);
                        }
                    }
                ]
            },
            {
                label: 'Default Mailto Client',
                type: 'checkbox',
                checked: electron_1.app.isDefaultProtocolClient('mailto'),
                click() {
                    if (electron_1.app.isDefaultProtocolClient('mailto')) {
                        electron_1.app.removeAsDefaultProtocolClient('mailto');
                    }
                    else {
                        electron_1.app.setAsDefaultProtocolClient('mailto');
                    }
                }
            },
            {
                label: 'Debug Mode',
                type: 'checkbox',
                checked: config_1.default.get('debugMode'),
                click(checked) {
                    config_1.default.set('debugMode', checked);
                    utils_1.showRestartDialog(checked, 'debug mode');
                }
            }
        ]
    },
    {
        label: 'Edit',
        submenu: [
            {
                label: 'Undo Typing',
                accelerator: 'Cmd+Z',
                role: 'undo'
            },
            {
                label: 'Redo',
                accelerator: 'Shift+Cmd+Z',
                role: 'redo'
            },
            {
                type: 'separator'
            },
            {
                label: 'Cut',
                accelerator: 'Cmd+X',
                role: 'cut'
            },
            {
                label: 'Copy',
                accelerator: 'Cmd+C',
                role: 'copy'
            },
            {
                label: 'Paste',
                accelerator: 'Cmd+V',
                role: 'paste'
            },
            {
                label: 'Paste and Match Style',
                accelerator: 'Shift+Cmd+V',
                role: 'pasteAndMatchStyle'
            },
            {
                label: 'Select All',
                accelerator: 'Cmd+A',
                role: 'selectAll'
            }
        ]
    },
    {
        label: 'Window',
        role: 'window',
        submenu: [
            {
                label: 'Minimize',
                accelerator: 'Cmd+M',
                role: 'minimize'
            },
            {
                label: 'Close',
                accelerator: 'Cmd+W',
                role: 'close'
            }
        ]
    },
    {
        label: 'Help',
        role: 'help',
        submenu: [
            {
                label: `${APP_NAME} Website`,
                click() {
                    electron_1.shell.openExternal('https://github.com/timche/gmail-desktop');
                }
            },
            {
                label: 'Report an Issue',
                click() {
                    electron_1.shell.openExternal('https://github.com/timche/gmail-desktop/issues/new/choose');
                }
            }
        ]
    }
];
// Add the develop menu when running in the development environment
if (electron_util_1.is.development) {
    darwinMenu.splice(-1, 0, {
        label: 'Develop',
        submenu: [
            {
                label: 'Clear Cache and Restart',
                click() {
                    // Clear app config
                    config_1.default.clear();
                    // Restart without firing quitting events
                    electron_1.app.relaunch();
                    electron_1.app.exit(0);
                }
            }
        ]
    });
}
const menu = electron_1.Menu.buildFromTemplate(darwinMenu);
exports.default = menu;
//# sourceMappingURL=menu.js.map