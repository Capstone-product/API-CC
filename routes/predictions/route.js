const express = require('express');
const router = express.Router();
const uploadController = require('./controller');

// Konfigurasi multer untuk mengelola file yang diunggah
const multer = require('multer');

const upload = multer();

router.post('/buah', upload.single('file'), uploadController.predBuah);

module.exports = router;
