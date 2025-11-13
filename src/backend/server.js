// server.js - Backend API menggunakan Node.js dan Express// Import koneksi pool dari db.js

const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const app = express();
const port = 8000; 


const dbConfig = {
    host: 'localhost', 
    user: 'root',      
    password: '',      
    database: 'dbdatabarang', 
    port: 3306 
};

app.use(cors({
    origin: ['*','http://localhost:5173', 'http://127.0.0.1:5173'], 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json()); 

async function getConnection() {
    return await mysql.createConnection(dbConfig);
}

app.get('/api/v1/barang/all', async (req, res) => {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT * FROM view_barang');
        res.status(200).json({
            status: 'success',
            message: 'Data barang berhasil diambil',
            data: rows
        });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ status: 'error', message: 'Gagal mengambil data', error: error.message });
    } finally {
        if (connection) await connection.end();
    }
});

app.get('/api/v1/barang/active', async (req, res) => {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT * FROM view_barang_aktif');
        res.status(200).json({
            status: 'success',
            message: 'Data barang aktif berhasil diambil',
            data: rows
        });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ status: 'error', message: 'Gagal mengambil data', error: error.message });
    } finally {
        if (connection) await connection.end();
    }
});

app.get('/api/v1/barang/:id', async (req, res) => {
    let connection;
    try {
        const { id } = req.params;
        if (isNaN(parseInt(id))) {
            return res.status(400).json({ status: 'fail', message: 'ID barang tidak valid' });
        }
        connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute(
            'SELECT idbarang, nama, jenis, idsatuan, status, harga FROM barang WHERE idbarang = ?',
            [id]
        );
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
    let connection;
    try {
        const { nama, jenis, idsatuan, status, harga} = req.body;

        if (!nama || !jenis || idsatuan === undefined || idsatuan === null || status === undefined || status === null || !harga) {
            return res.status(400).json({ status: 'fail', message: 'Semua field (nama, jenis, idsatuan, status, harga) wajib diisi.' });
        }
        if (jenis !== 'B' && jenis !== 'J') {
            return res.status(400).json({ status: 'fail', message: 'Nilai jenis tidak valid (harus B atau J).' });
        }
        if (harga <=0 ) {
            return res.status(400).json({ status: 'fail', message: 'Nilai harga tidak valid (harus > 0).' });
        }
        if (status !== 0 && status !== 1) {
            return res.status(400).json({ status: 'fail', message: 'Nilai status tidak valid (harus 0 atau 1).' });
        }
        if (isNaN(parseInt(idsatuan))) {
            return res.status(400).json({ status: 'fail', message: 'ID Satuan tidak valid.' });
        }

        connection = await mysql.createConnection(dbConfig);

        const [satuanCheck] = await connection.execute('SELECT idsatuan FROM satuan WHERE idsatuan = ?', [idsatuan]);
        if (satuanCheck.length === 0) {
            return res.status(400).json({ status: 'fail', message: `Satuan dengan ID ${idsatuan} tidak ditemukan.` });
        }

        const query = 'INSERT INTO barang (nama, jenis, idsatuan, status, harga) VALUES (?,?, ?, ?, ?)';
        const [result] = await connection.execute(query, [nama, jenis, idsatuan, status, harga]);

        const [newData] = await connection.execute('SELECT * FROM view_barang WHERE idbarang = ?', [result.insertId]);
        res.status(201).json({ status: 'success', message: 'Barang berhasil ditambahkan', data: newData[0] });

    } catch (error) {
        console.error("Error adding barang:", error);
        res.status(500).json({ status: 'error', message: 'Gagal menambahkan barang', error: error.message });
    } finally {
        if (connection) await connection.end();
    }
});

app.put('/api/v1/barang/:id', async (req, res) => {
    let connection;
    try {
        const { id } = req.params;
 
        if (isNaN(parseInt(id))) {
            return res.status(400).json({ status: 'fail', message: 'ID barang tidak valid' });
        }

        const { nama, jenis, idsatuan, status, harga } = req.body;

        if (!nama || !jenis || idsatuan === undefined || idsatuan === null || status === undefined || status === null || !harga) {
            return res.status(400).json({ status: 'fail', message: 'Semua field (nama, jenis, idsatuan, status,harga) wajib diisi.' });
        }
        if (jenis !== 'B' ) {
            return res.status(400).json({ status: 'fail', message: 'Nilai jenis tidak valid (harus B atau J).' });
        }
        if (harga <=0 ) {
            return res.status(400).json({ status: 'fail', message: 'Nilai harga tidak valid (harus > 0).' });
        }
        if (status !== 0 && status !== 1) {
            return res.status(400).json({ status: 'fail', message: 'Nilai status tidak valid (harus 0 atau 1).' });
        }
        if (isNaN(parseInt(idsatuan))) {
            return res.status(400).json({ status: 'fail', message: 'ID Satuan tidak valid.' });
        }

        connection = await mysql.createConnection(dbConfig);

        const [satuanCheck] = await connection.execute('SELECT idsatuan FROM satuan WHERE idsatuan = ?', [idsatuan]);
        if (satuanCheck.length === 0) {
            return res.status(400).json({ status: 'fail', message: `Satuan dengan ID ${idsatuan} tidak ditemukan.` });
        }

        const query = 'UPDATE barang SET nama = ?, jenis = ?, idsatuan = ?, status = ?, harga = ? WHERE idbarang = ?';
        const [result] = await connection.execute(query, [nama, jenis, idsatuan, status, harga, id]);

        console.log("📊 Affected rows:", result.affectedRows);

        if (result.affectedRows === 0) {
            return res.status(404).json({ status: 'fail', message: `Barang dengan ID ${id} tidak ditemukan` });
        }

        const [updatedData] = await connection.execute('SELECT * FROM barang WHERE idbarang = ?', [id]);
        console.log("✅ Data berhasil diupdate:", updatedData[0]);

        res.status(200).json({ status: 'success', message: `Barang ID ${id} berhasil diperbarui`, data: updatedData[0] });

    } catch (error) {
        console.error("❌ Error updating barang:", error);
        res.status(500).json({ status: 'error', message: 'Gagal memperbarui barang', error: error.message });
    } finally {
        if (connection) await connection.end();
    }
});

app.delete('/api/v1/barang/:id', async (req, res) => {
    let connection;
    try {
        const { id } = req.params;
        if (isNaN(parseInt(id))) {
            return res.status(400).json({ status: 'fail', message: 'ID barang tidak valid' });
        }
        connection = await mysql.createConnection(dbConfig);
        const [check] = await connection.execute('SELECT idbarang FROM barang WHERE idbarang = ?', [id]);
        if (check.length === 0) {
            return res.status(404).json({ status: 'fail', message: `Barang dengan ID ${id} tidak ditemukan` });
        }

        const query = 'DELETE FROM barang WHERE idbarang = ?';
        await connection.execute(query, [id]);
        res.status(200).json({ status: 'success', message: `Barang ID ${id} berhasil dihapus`, data: null });
    } catch (error) {
        console.error("Error deleting barang:", error);
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({ status: 'fail', message: 'Gagal menghapus: Barang ini sedang digunakan di data transaksi lain.' });
        }
        res.status(500).json({ status: 'error', message: 'Gagal menghapus barang', error: error.message });
    } finally {
        if (connection) await connection.end();
    }
});


app.get('/api/v1/satuan/all', async (req, res) => {
    let connection;
        connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT * FROM view_satuan');
        
        const normalizedRows = rows.map(row => ({
        ...row,
        status: Number(row.status)
        }));

        res.status(200).json({
            status: 'success',
            message: 'Data satuan berhasil diambil',
            data: normalizedRows
        });
});
app.get('/api/v1/satuan/active', async (req, res) => {
    let connection;
        connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT * FROM view_satuan_aktif');
        
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
// Tambahkan endpoint-endpoint ini ke dalam server.js Anda

// GET single satuan by ID
app.get('/api/v1/satuan/:id', async (req, res) => {
    let connection;
    try {
        const { id } = req.params;
        if (isNaN(parseInt(id))) {
            return res.status(400).json({ status: 'fail', message: 'ID satuan tidak valid' });
        }
        
        connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute(
            'SELECT idsatuan, nama_satuan, status FROM satuan WHERE idsatuan = ?',
            [id]
        );
        
        if (rows.length === 0) {
            return res.status(404).json({ 
                status: 'fail', 
                message: `Satuan dengan ID ${id} tidak ditemukan` 
            });
        }
        
        res.status(200).json({ status: 'success', data: rows[0] });
    } catch (error) {
        console.error("Error fetching single satuan:", error);
        res.status(500).json({ 
            status: 'error', 
            message: 'Gagal mengambil data satuan', 
            error: error.message 
        });
    } finally {
        if (connection) await connection.end();
    }
});

// POST - Tambah satuan baru
app.post('/api/v1/satuan', async (req, res) => {
    let connection;
    try {
        const { nama_satuan, status } = req.body;
        
        if (!nama_satuan || status === undefined || status === null) {
            return res.status(400).json({ 
                status: 'fail', 
                message: 'Field nama_satuan dan status wajib diisi.' 
            });
        }
        
        if (status !== 0 && status !== 1) {
            return res.status(400).json({ 
                status: 'fail', 
                message: 'Nilai status tidak valid (harus 0 atau 1).' 
            });
        }

        connection = await mysql.createConnection(dbConfig);
        
        const query = 'INSERT INTO satuan (nama_satuan, status) VALUES (?, ?)';
        const [result] = await connection.execute(query, [nama_satuan, status]);

        const [newData] = await connection.execute(
            'SELECT * FROM satuan WHERE idsatuan = ?', 
            [result.insertId]
        );
        
        res.status(201).json({ 
            status: 'success', 
            message: 'Satuan berhasil ditambahkan', 
            data: newData[0] 
        });

    } catch (error) {
        console.error("Error adding satuan:", error);
        res.status(500).json({ 
            status: 'error', 
            message: 'Gagal menambahkan satuan', 
            error: error.message 
        });
    } finally {
        if (connection) await connection.end();
    }
});

// PUT - Update satuan
app.put('/api/v1/satuan/:id', async (req, res) => {
    let connection;
    try {
        const { id } = req.params;
        if (isNaN(parseInt(id))) {
            return res.status(400).json({ status: 'fail', message: 'ID satuan tidak valid' });
        }
        
        const { nama_satuan, status } = req.body;
        
        if (!nama_satuan || status === undefined || status === null) {
            return res.status(400).json({ 
                status: 'fail', 
                message: 'Field nama_satuan dan status wajib diisi.' 
            });
        }
        
        if (status !== 0 && status !== 1) {
            return res.status(400).json({ 
                status: 'fail', 
                message: 'Nilai status tidak valid (harus 0 atau 1).' 
            });
        }

        connection = await mysql.createConnection(dbConfig);
        
        const query = 'UPDATE satuan SET nama_satuan = ?, status = ? WHERE idsatuan = ?';
        const [result] = await connection.execute(query, [nama_satuan, status, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                status: 'fail', 
                message: `Satuan dengan ID ${id} tidak ditemukan` 
            });
        }
        
        const [updatedData] = await connection.execute(
            'SELECT * FROM satuan WHERE idsatuan = ?', 
            [id]
        );
        
        res.status(200).json({ 
            status: 'success', 
            message: `Satuan ID ${id} berhasil diperbarui`, 
            data: updatedData[0] 
        });

    } catch (error) {
        console.error("Error updating satuan:", error);
        res.status(500).json({ 
            status: 'error', 
            message: 'Gagal memperbarui satuan', 
            error: error.message 
        });
    } finally {
        if (connection) await connection.end();
    }
});

// DELETE - Hapus satuan
app.delete('/api/v1/satuan/:id', async (req, res) => {
    let connection;
    try {
        const { id } = req.params;
        if (isNaN(parseInt(id))) {
            return res.status(400).json({ status: 'fail', message: 'ID satuan tidak valid' });
        }
        
        connection = await mysql.createConnection(dbConfig);
        
        const [check] = await connection.execute(
            'SELECT idsatuan FROM satuan WHERE idsatuan = ?', 
            [id]
        );
        
        if (check.length === 0) {
            return res.status(404).json({ 
                status: 'fail', 
                message: `Satuan dengan ID ${id} tidak ditemukan` 
            });
        }

        const query = 'DELETE FROM satuan WHERE idsatuan = ?';
        await connection.execute(query, [id]);
        
        res.status(200).json({ 
            status: 'success', 
            message: `Satuan ID ${id} berhasil dihapus`, 
            data: null 
        });
        
    } catch (error) {
        console.error("Error deleting satuan:", error);
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({ 
                status: 'fail', 
                message: 'Gagal menghapus: Satuan ini sedang digunakan oleh data barang.' 
            });
        }
        res.status(500).json({ 
            status: 'error', 
            message: 'Gagal menghapus satuan', 
            error: error.message 
        });
    } finally {
        if (connection) await connection.end();
    }
});

app.get('/api/v1/vendor/all', async (req, res) => {
    let connection;
        connection = await mysql.createConnection(dbConfig);
        
        const [rows] = await connection.execute('SELECT * FROM view_vendor');
        

        res.status(200).json({
            status: 'success',
            message: 'Data satuan berhasil diambil',
            data: rows
        });
});
app.get('/api/v1/vendor/active', async (req, res) => {
    let connection;
        connection = await mysql.createConnection(dbConfig);
        
        const [rows] = await connection.execute('SELECT * FROM view_vendor_aktif');
        

        res.status(200).json({
            status: 'success',
            message: 'Data satuan berhasil diambil',
            data: rows
        });
});
app.get('/api/v1/role', async (req, res) => {
    let connection;
        connection = await mysql.createConnection(dbConfig);
        
        const [rows] = await connection.execute('SELECT * FROM view_role');
        
        res.status(200).json({
            status: 'success',
            message: 'Data satuan berhasil diambil',
            data: rows
        });
});
app.get('/api/v1/user', async (req, res) => {
    let connection;
        connection = await mysql.createConnection(dbConfig);
        
        const [rows] = await connection.execute('SELECT * FROM view_user');
        

        res.status(200).json({
            status: 'success',
            message: 'Data satuan berhasil diambil',
            data: rows
        });
});
app.get('/api/v1/margin/all', async (req, res) => {
    let connection;
        connection = await mysql.createConnection(dbConfig);
        
        const [rows] = await connection.execute('SELECT * FROM view_margin_penjualan');
        

        res.status(200).json({
            status: 'success',
            message: 'Data satuan berhasil diambil',
            data: rows
        });
});
app.get('/api/v1/margin/active', async (req, res) => {
    let connection;
        connection = await mysql.createConnection(dbConfig);
        
        const [rows] = await connection.execute('SELECT * FROM view_margin_penjualan_aktif');
        

        res.status(200).json({
            status: 'success',
            message: 'Data satuan berhasil diambil',
            data: rows
        });
});

app.get('/api/v1/pengadaan', async (req, res) => {
    let connection;
        connection = await mysql.createConnection(dbConfig);
        
        const [rows] = await connection.execute('SELECT * FROM view_pengadaan');
        

        res.status(200).json({
            status: 'success',
            message: 'Data satuan berhasil diambil',
            data: rows
        });
});
app.get('/api/v1/pengadaan/detail', async (req, res) => {
    let connection;
        connection = await mysql.createConnection(dbConfig);
        
        const [rows] = await connection.execute('SELECT * FROM detail_pengadaan');

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
app.get('/api/v1/penerimaan/detail', async (req, res) => {
    let connection;
        connection = await mysql.createConnection(dbConfig);
        
        const [rows] = await connection.execute('SELECT * FROM detail_penerimaan');

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
    app.get('/api/v1/penjualan/detail', async (req, res) => {
        let connection;
            connection = await mysql.createConnection(dbConfig);
            
            const [rows] = await connection.execute('SELECT * FROM detail_penjualan');
    
            res.status(200).json({
                status: 'success',
                message: 'Data satuan berhasil diambil',
                data: rows
            });
    });
    


app.listen(port, () => {
    console.log(`Node.js API server berjalan di http://localhost:${port}`);
});

