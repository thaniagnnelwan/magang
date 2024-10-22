const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('peminjaman.db');

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS peminjaman (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        waktu TEXT,
        tanggal TEXT,
        nama TEXT,
        jabatan TEXT,
        divisi TEXT,
        barang TEXT,
        jumlah INTEGER,
        keterangan TEXT,
        tanggal_pengembalian TEXT
    )`);
});

function tambahPeminjaman(waktu, tanggal, nama, jabatan, divisi, barang, jumlah, keterangan, callback) {
  const stmt = db.prepare("INSERT INTO peminjaman (waktu, tanggal, nama, jabatan, divisi, barang, jumlah, keterangan) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
  stmt.run(waktu, tanggal, nama, jabatan, divisi, barang, jumlah, keterangan, function (err) {
    if (err) {
      callback(err);
    } else {
      callback(null, this.lastID);
    }
  });
  stmt.finalize();
}

module.exports = { tambahPeminjaman };
