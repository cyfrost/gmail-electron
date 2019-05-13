"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const electron_store_1 = __importDefault(require("electron-store"));
const electron_settings_1 = __importDefault(require("electron-settings"));
const electron_util_1 = require("electron-util");
const defaults = {
    lastWindowState: {
        bounds: {
            width: 800,
            height: 600,
            x: undefined,
            y: undefined
        },
        fullscreen: false,
        maximized: true
    },
    minimalMode: false,
    debugMode: false,
    customStyles: true
};
const config = new electron_store_1.default({
    defaults,
    name: electron_util_1.is.development ? 'config.dev' : 'config'
});
// @TODO: Remove `electron-settings` in future version
function migrate() {
    const oldConfigFile = electron_settings_1.default.file();
    if (!fs_1.default.existsSync(oldConfigFile)) {
        return;
    }
    if (electron_settings_1.default.has('debug-mode')) {
        const debugMode = electron_settings_1.default.get('debug-mode');
        config.set('debugMode', debugMode);
    }
    if (electron_settings_1.default.has('minimal-mode')) {
        const minimalMode = electron_settings_1.default.get('minimal-mode');
        config.set('minimalMode', minimalMode);
    }
    fs_1.default.unlinkSync(oldConfigFile);
}
migrate();
exports.default = config;
//# sourceMappingURL=config.js.map