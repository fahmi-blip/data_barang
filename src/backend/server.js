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

        if (!nama || !jenis || idsatuan === undefined || idsatuan === null || status === undefined || status === null || harga === undefined || harga === null) {
            return res.status(400).json({ status: 'fail', message: 'Semua field (nama, jenis, idsatuan, status, harga) wajib diisi.' });
        }
        if (jenis !== 'B' && jenis !== 'J') {
            return res.status(400).json({ status: 'fail', message: 'Nilai jenis tidak valid (harus B atau J).' });
        }
        if (isNaN(parseFloat(harga)) || harga < 0) {
             return res.status(400).json({ status: 'fail', message: 'Harga tidak valid.' });
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

        const query = 'INSERT INTO barang (nama, jenis, idsatuan, status, harga) VALUES (?, ?, ?, ?, ?)';
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

        if (!nama || !jenis || idsatuan === undefined || idsatuan === null || status === undefined || status === null || harga === undefined || harga === null) {
            return res.status(400).json({ status: 'fail', message: 'Semua field (nama, jenis, idsatuan, status,harga) wajib diisi.' });
        }
        if (jenis !== 'B' ) {
            return res.status(400).json({ status: 'fail', message: 'Nilai jenis tidak valid (harus B atau J).' });
        }
        if (isNaN(parseFloat(harga)) || harga < 0) {
             return res.status(400).json({ status: 'fail', message: 'Harga tidak valid.' });
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


        if (result.affectedRows === 0) {
            return res.status(404).json({ status: 'fail', message: `Barang dengan ID ${id} tidak ditemukan` });
        }

        const [updatedData] = await connection.execute('SELECT * FROM barang WHERE idbarang = ?', [id]);

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
        
        const [rows] = await connection.execute('SELECT * FROM view_detail_pengadaan');

        res.status(200).json({
            status: 'success',
            message: 'Data satuan berhasil diambil',
            data: rows
        });
});
app.post('/api/v1/pengadaan', async (req, res) => {
    let connection;
    try {
        const { user_id, vendor_id, subtotal_nilai, ppn, details } = req.body;

        // Validasi input
        if (!user_id || !vendor_id || !subtotal_nilai || ppn === undefined || !Array.isArray(details) || details.length === 0) {
            return res.status(400).json({
                status: 'fail',
                message: 'Data tidak lengkap. Pastikan user_id, vendor_id, subtotal_nilai, ppn, dan details terisi.'
            });
        }

        connection = await mysql.createConnection(dbConfig);
        await connection.beginTransaction();

        // Hitung total_nilai
        const total_nilai = subtotal_nilai + ppn;

        // Insert header pengadaan
        const [headerResult] = await connection.execute(
            'INSERT INTO pengadaan (user_iduser, vendor_idvendor, subtotal_nilai, ppn, total_nilai, status) VALUES (?, ?, ?, ?, ?, ?)',
            [user_id, vendor_id, subtotal_nilai, ppn, total_nilai, '1']
        );

        const idpengadaan = headerResult.insertId;

        // Insert detail pengadaan
        for (const detail of details) {
            const { idbarang, jumlah, harga_satuan } = detail;
            
            if (!idbarang || !jumlah || !harga_satuan) {
                throw new Error('Data detail tidak lengkap');
            }
            
            const sub_total = jumlah * harga_satuan;

            await connection.execute(
                'INSERT INTO detail_pengadaan (harga_satuan, jumlah, sub_total, idbarang, idpengadaan) VALUES (?, ?, ?, ?, ?)',
                [harga_satuan, jumlah, sub_total, idbarang, idpengadaan]
            );
        }

        await connection.commit();

        // Ambil data lengkap pengadaan yang baru dibuat
        const [newData] = await connection.execute(
            'SELECT * FROM view_pengadaan WHERE idpengadaan = ?',
            [idpengadaan]
        );

        res.status(201).json({
            status: 'success',
            message: 'Pengadaan berhasil ditambahkan',
            data: { idpengadaan, details: newData }
        });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error("Error adding pengadaan:", error);
        res.status(500).json({
            status: 'error',
            message: 'Gagal menambahkan pengadaan',
            error: error.message
        });
    } finally {
        if (connection) await connection.end();
    }
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
        
        const [rows] = await connection.execute('SELECT * FROM view_detail_penerimaan');

        res.status(200).json({
            status: 'success',
            message: 'Data satuan berhasil diambil',
            data: rows
        });
});

app.post('/api/v1/penerimaan', async (req, res) => {
    let connection;
    try {
        const { idpengadaan, iduser, details } = req.body;

        if (!idpengadaan || !iduser || !Array.isArray(details) || details.length === 0) {
            return res.status(400).json({
                status: 'fail',
                message: 'Data tidak lengkap. Pastikan idpengadaan, iduser, dan details terisi.'
            });
        }

        connection = await mysql.createConnection(dbConfig);
        await connection.beginTransaction();

        // Insert header penerimaan
        const [result] = await connection.execute(
            'INSERT INTO penerimaan (idpengadaan, iduser, status) VALUES (?, ?, ?)',
            [idpengadaan, iduser, '1']
        );

        const idpenerimaan = result.insertId;

        for (const detail of details) {
            const { barang_idbarang, jumlah_terima, harga_satuan_terima } = detail;
            const sub_total_terima = jumlah_terima * harga_satuan_terima;

            await connection.execute(
                'INSERT INTO detail_penerimaan (idpenerimaan, barang_idbarang, jumlah_terima, harga_satuan_terima, sub_total_terima) VALUES (?, ?, ?, ?, ?)',
                [idpenerimaan, barang_idbarang, jumlah_terima, harga_satuan_terima, sub_total_terima]
            );
        }

        await connection.commit();

        const [newData] = await connection.execute(
            'SELECT * FROM view_penerimaan WHERE idpenerimaan = ?',
            [idpenerimaan]
        );

        res.status(201).json({
            status: 'success',
            message: 'Penerimaan berhasil ditambahkan dan kartu stok diupdate otomatis',
            data: { idpenerimaan, details: newData }
        });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error("Error adding penerimaan:", error);
        res.status(500).json({
            status: 'error',
            message: 'Gagal menambahkan penerimaan',
            error: error.message
        });
    } finally {
        if (connection) await connection.end();
    }
});

app.get('/api/v1/stok', async (req, res) => {
    let connection;
        connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT * FROM kartu_stok');

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
            
            const [rows] = await connection.execute('SELECT * FROM view_detail_penjualan');
    
            res.status(200).json({
                status: 'success',
                message: 'Data satuan berhasil diambil',
                data: rows
            });
    });

app.post('/api/v1/penjualan', async (req, res) => {
    let connection;
    try {
        const { iduser, idmargin_penjualan, details } = req.body;

        if (!iduser || !idmargin_penjualan || !Array.isArray(details) || details.length === 0) {
            return res.status(400).json({
                status: 'fail',
                message: 'Data tidak lengkap. Pastikan iduser, idmargin_penjualan, dan details terisi.'
            });
        }

        connection = await mysql.createConnection(dbConfig);
        await connection.beginTransaction();

        // Ambil persentase margin
        const [marginData] = await connection.execute(
            'SELECT persen FROM margin_penjualan WHERE idmargin_penjualan = ?',
            [idmargin_penjualan]
        );

        if (marginData.length === 0) {
            throw new Error('Margin penjualan tidak ditemukan');
        }

        const persenMargin = marginData[0].persen;
        let subtotal_nilai = 0;

        // Hitung subtotal dengan menggunakan function fn_hitung_harga_jual
        const detailsWithPrice = [];
        for (const detail of details) {
            const { idbarang, jumlah } = detail;

            // Ambil harga beli barang
            const [barangData] = await connection.execute(
                'SELECT harga FROM barang WHERE idbarang = ?',
                [idbarang]
            );

            if (barangData.length === 0) {
                throw new Error(`Barang dengan ID ${idbarang} tidak ditemukan`);
            }

            const harga_beli = barangData[0].harga;

            // Gunakan function untuk hitung harga jual
            const [hargaJualResult] = await connection.execute(
                'SELECT fn_hitung_harga_jual(?, ?) as harga_jual',
                [harga_beli, persenMargin]
            );

            const harga_jual = hargaJualResult[0].harga_jual;
            const subtotal = harga_jual * jumlah;
            subtotal_nilai += subtotal;

            detailsWithPrice.push({
                idbarang,
                jumlah,
                harga_satuan: harga_jual,
                subtotal
            });
        }

        const ppn = Math.round(subtotal_nilai * 0.11); // PPN 11%
        const total_nilai = subtotal_nilai + ppn;

        // Insert header penjualan
        const [result] = await connection.execute(
            'INSERT INTO penjualan (iduser, idmargin_penjualan, subtotal_nilai, ppn, total_nilai) VALUES (?, ?, ?, ?, ?)',
            [iduser, idmargin_penjualan, subtotal_nilai, ppn, total_nilai]
        );

        const idpenjualan = result.insertId;

        // Insert detail penjualan (akan trigger kartu stok otomatis)
        for (const detail of detailsWithPrice) {
            await connection.execute(
                'INSERT INTO detail_penjualan (penjualan_idpenjualan, idbarang, harga_satuan, jumlah, subtotal) VALUES (?, ?, ?, ?, ?)',
                [idpenjualan, detail.idbarang, detail.harga_satuan, detail.jumlah, detail.subtotal]
            );
        }

        await connection.commit();

        // Ambil data lengkap penjualan
        const [newData] = await connection.execute(
            'SELECT * FROM view_penjualan WHERE idpenjualan = ?',
            [idpenjualan]
        );

        res.status(201).json({
            status: 'success',
            message: 'Penjualan berhasil ditambahkan dengan harga menggunakan margin dan kartu stok diupdate otomatis',
            data: { idpenjualan, details: newData }
        });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error("Error adding penjualan:", error);
        res.status(500).json({
            status: 'error',
            message: 'Gagal menambahkan penjualan',
            error: error.message
        });
    } finally {
        if (connection) await connection.end();
    }
});

app.get('/api/v1/kartu-stok', async (req, res) => {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute(`
            SELECT 
                k.*,
                b.nama as nama_barang
            FROM kartu_stok k
            LEFT JOIN barang b ON k.idbarang = b.idbarang
            ORDER BY k.created_at ASC
        `);
        res.status(200).json({
            status: 'success',
            message: 'Data kartu stok berhasil diambil',
            data: rows
        });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ status: 'error', message: 'Gagal mengambil data', error: error.message });
    } finally {
        if (connection) await connection.end();
    }
});

app.get('/api/v1/kartu-stok/:idbarang', async (req, res) => {
    let connection;
    try {
        const { idbarang } = req.params;
        connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute(`
            SELECT 
                k.*,
                b.nama as nama_barang
            FROM kartu_stok k
            LEFT JOIN barang b ON k.idbarang = b.idbarang
            WHERE k.idbarang = ?
            ORDER BY k.created_at ASC
        `, [idbarang]);
        res.status(200).json({
            status: 'success',
            message: 'Data kartu stok berhasil diambil',
            data: rows
        });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ status: 'error', message: 'Gagal mengambil data', error: error.message });
    } finally {
        if (connection) await connection.end();
    }
});



app.listen(port, () => {
    console.log(`Node.js API server berjalan di http://localhost:${port}`);
});

