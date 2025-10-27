const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

// Configuración
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configuración CORS (para desarrollo)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// Servir archivos estáticos desde la carpeta configurada
const imagesDir = process.env.IMAGES_DIR;
const imagesUrl = process.env.IMAGES_URL;

// Crear directorio de imágenes si no existe
if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
    console.log(`Directorio de imágenes creado en: ${imagesDir}`);
}

// Servir archivos estáticos
app.use(process.env.IMAGES_BASE_URL, express.static(process.env.IMAGES_DIR));

// Configurar ruta estática para las imágenes
app.use(imagesUrl, express.static(imagesDir));
console.log(`Ruta de imágenes configurada: ${imagesUrl} -> ${imagesDir}`);

// Rutas
const dogsRoutes = require('./routes/dogs.routes');
app.use('/api/dogs', dogsRoutes);

// Manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: err.message || 'Algo salió mal' });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    console.log(`Configuración de imágenes:`);
    console.log(`- Directorio físico: ${imagesDir}`);
    console.log(`- Ruta URL: ${imagesUrl}`);
});