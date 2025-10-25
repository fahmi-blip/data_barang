// server.js - Backend API menggunakan Node.js dan Express

const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
const port = 8000; // Port API backend

// --- 1. KONFIGURASI DATABASE MYSQL (LARAGON) ---
const dbConfig = {
    host: 'localhost', // Atau 127.0.0.1
    user: 'root',      // Username default Laragon
    password: '',      // Password default Laragon (kosong)
    database: 'dbdatabarang', // Ganti dengan nama database Anda
    port: 3306 // Port MySQL default
};

// Middleware CORS - WAJIB agar React (port 5173/3000) bisa mengakses API ini
app.use(cors({
    origin: ['*','http://localhost:5173', 'http://127.0.0.1:5173'], // Izinkan akses dari React development server
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json()); // Untuk parse request body JSON

// --- 2. ENDPOINT API UNTUK DATA BARANG ---
app.get('/api/v1/barang', async (req, res) => {
    let connection;
    
        connection = await mysql.createConnection(dbConfig);
        
        // Mengambil data dari VIEW_BARANG yang sudah Anda definisikan di SQL
        const [rows] = await connection.execute('SELECT * FROM view_barang ');
        
        // Mengirimkan respons sukses
        res.status(200).json({
            status: 'success',
            message: 'Data barang berhasil diambil',
            data: rows
        });
});

app.get('/api/v1/barang/:id', async (req, res) => {
    let connection;
    try {
        const { id } = req.params;
        connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT idbarang, nama, jenis, idsatuan, status FROM barang WHERE idbarang = ?', [id]); // Ambil dari tabel asli
        if (rows.length === 0) {
            return res.status(404).json({ status: 'fail', message: `Barang dengan ID ${id} tidak ditemukan` });
        }
        res.status(200).json({ status: 'success', data: rows[0] });
    } catch (error) {
        console.error("Error fetching single barang:", error);
        res.status(500).json({ status: 'error', message: 'Gagal mengambil data barang', error: error.message });
    } finally {
        if (connection) await connection.end();
    }
});
app.post('/api/v1/barang', async (req, res) => {
    const { idbarang, jenis, nama,id_satuan,status } = req.body;
    let connection;
    if (!idbarang || !jenis || nama === undefined || id_satuan === undefined || status === undefined) {
        return res.status(400).json({ status: 'fail', message: 'Data tidak lengkap' });
    }
    connection = await mysql.createConnection(dbConfig);
        const [result] = await connection.execute(
            'INSERT INTO barang (idbarang, jenis, nama, id_satuan, status) VALUES (?, ?, ?, ?,?)',
            [idbarang, jenis, nama, id_satuan, status]
        );

        res.status(201).json({
            status: 'success',
            message: 'Data barang berhasil ditambahkan',
            data: { id: result.insertId, idbarang, jenis, nama, id_satuan, status }
        });
});
app.put('/api/v1/barang/:id', async (req, res) => {
    const barangId = req.params.id;
    const { idbarang, jenis, nama, id_satuan, status } = req.body;
    let connection;
    if (!idbarang || !jenis || nama === undefined || id_satuan === undefined || status === undefined) {
        return res.status(400).json({ status: 'fail', message: 'Data tidak lengkap' });
        }
    connection = await mysql.createConnection(dbConfig);
        const [result] = await connection.execute(
            'UPDATE barang SET idbarang = ?, jenis = ?, nama = ?, id_satuan = ?, status = ? WHERE id = ?',
            [idbarang, jenis, nama, id_satuan, status, barangId]
        ); 
        res.status(200).json({
            status: 'success',
            message: 'Data barang berhasil diperbarui',
            data: { id: barangId, idbarang, jenis, nama, id_satuan, status }
        });
});
app.delete('/api/v1/barang/:id', async (req, res) => {
    let connection;
    try {
        const { id } = req.params;
        connection = await mysql.createConnection(dbConfig);
        const query = 'DELETE FROM barang WHERE idbarang = ?'; // DELETE dari tabel 'barang'
        const [result] = await connection.execute(query, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ status: 'fail', message: `Barang dengan ID ${id} tidak ditemukan` });
        }

        res.status(200).json({ // Bisa juga 204 No Content jika tidak ada body
            status: 'success',
            message: `Barang dengan ID ${id} berhasil dihapus`,
            data: null // Atau data yang dihapus jika perlu
        });
    } catch (error) {
        console.error("Error deleting barang:", error);
        // Handle constraint errors jika barang terkait dengan tabel lain
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
             return res.status(400).json({ status: 'fail', message: 'Barang tidak dapat dihapus karena terkait dengan data lain.' });
        }
        res.status(500).json({ status: 'error', message: 'Gagal menghapus barang', error: error.message });
    } finally {
        if (connection) await connection.end();
    }
});


app.get('/api/v1/satuan', async (req, res) => {
    let connection;
        connection = await mysql.createConnection(dbConfig);
        
        // Mengambil data dari tabel 'satuan' secara langsung
        const [rows] = await connection.execute('SELECT * FROM satuan');
        
        const normalizedRows = rows.map(row => ({
        ...row,
        status: Number(row.status)
        }));

        res.status(200).json({
            status: 'success',
            message: 'Data satuan berhasil diambil',
            data: rows
        });
});

app.get('/api/v1/vendor', async (req, res) => {
    let connection;
        connection = await mysql.createConnection(dbConfig);
        
        // Mengambil data dari tabel 'satuan' secara langsung
        const [rows] = await connection.execute('SELECT * FROM vendor');
        

        res.status(200).json({
            status: 'success',
            message: 'Data satuan berhasil diambil',
            data: rows
        });
});

app.get('/api/v1/pengadaan', async (req, res) => {
    let connection;
        connection = await mysql.createConnection(dbConfig);
        
        // Mengambil data dari tabel 'satuan' secara langsung
        const [rows] = await connection.execute('SELECT * FROM view_pengadaan');
        

        res.status(200).json({
            status: 'success',
            message: 'Data satuan berhasil diambil',
            data: rows
        });
});

app.get('/api/v1/penerimaan', async (req, res) => {
    let connection;
        connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT * FROM view_penerimaan');

        res.status(200).json({
            status: 'success',
            message: 'Data satuan berhasil diambil',
            data: rows
        });
});
app.get('/api/v1/penjualan', async (req, res) => {
    let connection;
        connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT * FROM view_penjualan');

        res.status(200).json({
            status: 'success',
            message: 'Data satuan berhasil diambil',
            data: rows
        });
});




// --- 3. MULAI SERVER ---
app.listen(port, () => {
    console.log(`Node.js API server berjalan di http://localhost:${port}`);

});
