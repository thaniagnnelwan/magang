const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  login: (credentials) => {
    console.log('Login function called with:', credentials); // Debug
    return ipcRenderer.invoke('login', credentials);
  },
  savePeminjaman: (data) => ipcRenderer.send('save-peminjaman', data),
  getRiwayat: () => ipcRenderer.invoke('get-riwayat'),
  confirmPengembalian: (id) => {
    console.log('Confirm pengembalian dipanggil dengan ID:', id);
    return ipcRenderer.send('confirm-pengembalian', id);
  },
  deletePeminjaman: (id) => {
    console.log('Delete peminjaman dipanggil dengan ID:', id);
    return ipcRenderer.send('delete-peminjaman', id);
  }});

