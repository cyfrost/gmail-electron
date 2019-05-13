"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_debug_1 = __importDefault(require("electron-debug"));
const config_1 = __importDefault(require("./config"));
const OPTIONS = {
    showDevTools: false
};
function init() {
    const enabled = config_1.default.get('debugMode');
    electron_debug_1.default({ ...OPTIONS, isEnabled: enabled });
}
exports.init = init;
//# sourceMappingURL=debug.js.map