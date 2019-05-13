"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_util_1 = __importDefault(require("electron-util"));
// URL: `mail.google.com/mail/u/<local_account_id>`
function getUrlAccountId(url) {
    const accountIdRegExp = /mail\/u\/(\d+)\//;
    const res = accountIdRegExp.exec(url);
    return res && res[1];
}
exports.getUrlAccountId = getUrlAccountId;
exports.platform = electron_util_1.default.platform({
    macos: 'macos',
    linux: 'linux',
    windows: 'windows'
});
//# sourceMappingURL=helpers.js.map