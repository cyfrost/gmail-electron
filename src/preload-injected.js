import { ipcRenderer } from 'electron';
const DarkReader = require('darkreader');

(function () {
  function enableDarkTheme(darkReaderConfig) {
    DarkReader.enable(darkReaderConfig);
  }

  function disableDarkTheme() {
    DarkReader.disable();
  }

  ipcRenderer.on('enable-dark-mode', function(event, store) {
    const darkReaderConfig = store;
    enableDarkTheme(darkReaderConfig);
  });

  ipcRenderer.on('disable-dark-mode', disableDarkTheme);
})();
