document.getElementById('logout-btn').addEventListener('click', () => {
    window.location = 'login.html';
});

// Jika ini adalah halaman form peminjaman
const peminjamanForm = document.getElementById('peminjaman-form');
if (peminjamanForm) {
    peminjamanForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const data = {
            waktu: document.getElementById('waktu').value,
            tanggal: document.getElementById('tanggal').value,
            nama: document.getElementById('nama').value,
            jabatan: document.getElementById('jabatan').value,
            divisi: document.getElementById('divisi').value,
            barang: document.getElementById('barang').value,
            jumlah: document.getElementById('jumlah').value,
            keterangan: document.getElementById('keterangan').value
        };

        // Kirim data ke main process untuk disimpan ke database
        window.electronAPI.savePeminjaman(data);
        alert('Data peminjaman telah disimpan');
    });
}

document.addEventListener('DOMContentLoaded', () => {
// Menampilkan riwayat peminjaman
window.electronAPI.getRiwayat().then((data) => {
    console.log('Data riwayat:', data);
    const riwayatTbody = document.getElementById('riwayat-tbody');

    if (!riwayatTbody) {
        console.error("Element with id 'riwayat-tbody' not found.");
        return;
    }
    
    riwayatTbody.innerHTML = ''; // Kosongkan tabel

    if (data.length === 0) {
        riwayatTbody.innerHTML = '<tr><td colspan="9">Tidak ada data peminjaman.</td></tr>';
        return; // Kembali jika tidak ada data
    }

    const displayRiwayat = (dataToDisplay) => {
        riwayatTbody.innerHTML = ''; // Kosongkan tabel sebelum diisi ulang
        dataToDisplay.forEach((row, index) => {
            const pengembalianButton = row.tanggal_pengembalian
                ? `<td>${row.tanggal_pengembalian}</td>`  // Tampilkan tanggal pengembalian jika ada
                : `<td><button class="btn btn-success" id="return-btn-${row.id}">Pengembalian</button></td>`; // Tampilkan tombol jika belum dikembalikan
            
            const newRow = `
                <tr>
                    <td>${index + 1}</td>
                    <td>${row.nama}</td>
                    <td>${row.jabatan}</td>
                    <td>${row.divisi}</td>
                    <td>${row.barang}</td>
                    <td>${row.jumlah}</td>
                    <td>${row.tanggal}</td>
                    ${pengembalianButton}
                    <td><button class="btn btn-danger" id="delete-btn-${row.id}">Hapus</button></td> <!-- Tombol Hapus -->
                </tr>
            `;
            riwayatTbody.innerHTML += newRow;

            // Tambahkan event listener untuk tombol pengembalian
            if (!row.tanggal_pengembalian) { // Hanya tambahkan event listener jika barang belum dikembalikan
                const button = document.getElementById(`return-btn-${row.id}`);
                console.log(button);
                button.addEventListener('click', () => {
                    window.electronAPI.confirmPengembalian(row.id); // Kirim permintaan untuk mengkonfirmasi pengembalian
                });
            }

            // Tambahkan event listener untuk tombol hapus
            const deleteButton = document.getElementById(`delete-btn-${row.id}`);
            console.log(deleteButton);
            deleteButton.addEventListener('click', () => {
                if (confirm(`Apakah Anda yakin ingin menghapus data peminjaman ${row.nama}?`)) {
                    window.electronAPI.deletePeminjaman(row.id); // Kirim permintaan untuk menghapus data
                }
            });
        });
    };

    displayRiwayat(data);

    // Tambahkan kolom pencarian
    const searchButton = document.getElementById('search-btn');
    const searchInput = document.getElementById('search'); // Pastikan input pencarian ada di HTML
    searchButton.addEventListener('click', () => {
        const searchValue = searchInput.value.toLowerCase();
        const filteredData = data.filter(row => {
            return (
                row.nama.toLowerCase().includes(searchValue) ||
                row.jabatan.toLowerCase().includes(searchValue) ||
                row.divisi.toLowerCase().includes(searchValue) ||
                row.barang.toLowerCase().includes(searchValue)
            );
        });
        displayRiwayat(filteredData); // Tampilkan hasil pencarian
    });

}).catch((error) => {
    console.error('Error fetching riwayat:', error); // Tangani error jika terjadi
});
});
