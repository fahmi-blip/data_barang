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
