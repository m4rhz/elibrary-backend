const express = require('express');
const router = express.Router();

// Endpoint untuk menerima pengaduan
router.post('/submit-complaint', (req, res) => {
  const { complaint } = req.body;
  if (!complaint) {
    return res.status(400).json({ message: 'Pengaduan tidak boleh kosong' });
  }

  

  res.status(200).json({ message: 'Pengaduan berhasil dikirim' });
});

module.exports = router;
