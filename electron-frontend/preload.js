const { contextBridge, ipcRenderer, webUtils } = require('electron');

console.log("Running preload")
contextBridge.exposeInMainWorld('electronAPI', {
  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
  writeFile: (filePath, data) => ipcRenderer.invoke('write-file', filePath, data),
  createFile: (filePath) => ipcRenderer.invoke('create-file', filePath),
  onDrop: (callback) => {
    window.addEventListener('drop', (event) => {
      event.preventDefault();
      const files = Array.from(event.dataTransfer.files).map(file => ({
        path: webUtils.getPathForFile(file),
        name: file.name
      }));
      console.log(event);
      callback(files);
    });
  },
  onDragOver: () => {
    window.addEventListener('dragover', (event) => {
      event.preventDefault();
    });
  },
  getFilePath: (file) => {
    return webUtils.getPathForFile(file)
  }
});
