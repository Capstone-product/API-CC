const axios = require('axios');
const FormData = require('form-data');
const { Storage } = require('@google-cloud/storage');

const storage = new Storage({
  projectId: 'nutriscan-442811',
  keyFilename: './nutriscan-442811-95c5c9901509.json',
});

const bucketName = 'capstone-fruits';

const getCategoryFolder = (category) => {
  // Membuat mapping antara kategori dan folder penyimpanan
  const categoryFolders = {
    buah: 'Bangkit_Fruits',
  };

  return categoryFolders[category];
};

const uploadFileToStorage = async (file, category) => {
  const bucket = storage.bucket(bucketName);

  // Tentukan nama file di bucket
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
  const fileName = getCategoryFolder(category) + '/' + file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop();

  const fileUpload = bucket.file(fileName);

  const stream = fileUpload.createWriteStream({
    resumable: false,
    metadata: {
      contentType: file.mimetype,
    },
  });

  // Salin file yang diunggah ke Google Cloud Storage
  await new Promise((resolve, reject) => {
    stream.on('error', reject);
    stream.on('finish', resolve);
    stream.end(file.buffer);
  });

  return fileName;
};

const predBuah = async (req, res) => {
  try {
    const file = req.file;

    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const fileName = await uploadFileToStorage(file, 'buah');

    const formData = new FormData();
    formData.append('file', req.file.buffer, { filename: req.file.originalname });

    const response = await axios.post('https://fruits-123003842483.us-central1.run.app/', formData, {
      headers: {
        ...formData.getHeaders(),
      },
    });

    console.log(response.data);

    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).send('Terjadi kesalahan saat mengunggah file');
  }
};

module.exports = {
  predBuah,
};
