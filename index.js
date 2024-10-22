// node_modules\electron\dist\electron.exe C:\Users\nelwa\Desktop\peminjaman-app

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// Membuat database baru atau membuka database yang sudah ada
const db = new sqlite3.Database('peminjaman.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the peminjaman database.');
});

// Membuat tabel jika belum ada
db.run(`CREATE TABLE IF NOT EXISTS peminjaman (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  waktu TEXT,
  tanggal TEXT,
  nama TEXT,
  jabatan TEXT,
  divisi TEXT,
  barang TEXT,
  jumlah INTEGER,
  keterangan TEXT
  tanggal_pengembalian TEXT
)`);

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false
    }
  });
  win.loadFile('renderer/login.html');
  win.webContents.openDevTools();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// Handler untuk login
ipcMain.handle('login', async (_, { username, password }) => {
  console.log(`Received credentials - Username: ${username}, Password: ${password}`); // Debug
  if (username === 'admin' && password === 'password123') {
    return { success: true };
  } else {
    return { success: false };
  }
});

// Handler untuk menyimpan peminjaman
ipcMain.on('save-peminjaman', (_, data) => {
  const { waktu, tanggal, nama, jabatan, divisi, barang, jumlah, keterangan } = data;

  db.run(`INSERT INTO peminjaman (waktu, tanggal, nama, jabatan, divisi, barang, jumlah, keterangan, tanggal_pengembalian) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [waktu, tanggal, nama, jabatan, divisi, barang, jumlah, keterangan, tanggal_pengembalian], 
          function(err) {
    if (err) {
      console.error(err.message);
    } else {
      console.log(`Data peminjaman berhasil disimpan dengan ID ${this.lastID}`);
    }
  });
});

// Handler untuk mengambil riwayat
ipcMain.handle('get-riwayat', () => {
  console.log('Handler get-riwayat dipanggil');
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM peminjaman', [], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
});

// Handler untuk update pengembalian
ipcMain.on('confirm-pengembalian', (event, id) => {
  console.log(`Handler confirm-pengembalian dipanggil untuk ID ${id}`);
  const tanggalPengembalian = new Date().toLocaleDateString();
  db.run(`UPDATE peminjaman SET tanggal_pengembalian = ? WHERE id = ?`, [tanggalPengembalian, id], function(err) {
    if (err) {
      console.error('Error updating pengembalian:', err.message);
    } else {
      console.log(`Pengembalian untuk ID ${id} berhasil diperbarui.`);
      event.reply('pengembalian-updated', { success: true, tanggal_pengembalian: tanggalPengembalian });
    }
  });
});

// Handler untuk menghapus peminjaman
ipcMain.on('delete-peminjaman', (event, id) => {
  console.log(`Handler delete-peminjaman dipanggil untuk ID ${id}`);
  db.run(`DELETE FROM peminjaman WHERE id = ?`, id, function(err) {
      if (err) {
          console.error(err.message);
      } else {
          console.log(`Peminjaman dengan ID ${id} berhasil dihapus.`);
      }
  });
});

