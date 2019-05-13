"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("./config"));
const utils_1 = require("./utils");
function setMinimalMode(enabled) {
    utils_1.sendChannelToMainWindow('set-minimal-mode', enabled);
}
exports.setMinimalMode = setMinimalMode;
function init() {
    const isMinimalModeEnabled = config_1.default.get('minimalMode');
    setMinimalMode(isMinimalModeEnabled);
}
exports.init = init;
//# sourceMappingURL=minimal-mode.js.map