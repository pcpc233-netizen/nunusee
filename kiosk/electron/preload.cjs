const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('kiosk', {
  getScores: () => ipcRenderer.invoke('scores:get'),
  addScore: (score) => ipcRenderer.invoke('scores:add', score),
  isElectron: true,
});
