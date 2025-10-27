const Dog = require('../models/dogs.model');
const pool = require('../config/db');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

exports.createDog = async (req, res) => {
    try {
        const { description, latitude, longitude } = req.body;

        let photoPath = null;
        if (req.file) {
            // Guarda la ruta relativa en la base de datos
            photoPath = `${process.env.IMAGES_BASE_URL}/${req.file.filename}`;

            // Opcional: Si necesitas la URL completa para algunas respuestas
            const fullUrl = `${process.env.SERVER_URL}${photoPath}`;
        }

        const query = `
        INSERT INTO dogs (description, photo_path, latitude, longitude)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
      `;
        const values = [description, photoPath, latitude, longitude];

        const { rows } = await pool.query(query, values);

        res.status(201).json({
            ...rows[0],
            // Opcional: Incluir URL completa en la respuesta
            photo_url: photoPath ? `${process.env.SERVER_URL}${photoPath}` : null
        });

    } catch (error) {
        // Limpieza en caso de error
        if (req.file) {
            fs.unlink(path.join(process.env.IMAGES_DIR, req.file.filename), () => { });
        }

        res.status(500).json({
            error: 'Error al crear el registro',
            details: error.message
        });
    }
};

exports.getDogs = async (req, res) => {
    try {
        const dogs = await Dog.getAll();
        res.json(dogs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener los perros' });
    }
};

exports.getNearbyDogs = async (req, res) => {
    try {
        const { latitude, longitude, radius = 5 } = req.query; // radio en km
        const dogs = await Dog.getNearby(
            parseFloat(latitude),
            parseFloat(longitude),
            parseFloat(radius)
        );
        res.json(dogs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al buscar perros cercanos' });
    }
};

exports.getDog = async (req, res) => {
    try {
        const dog = await Dog.getById(req.params.id);
        if (!dog) {
            return res.status(404).json({ message: 'Perro no encontrado' });
        }
        res.json(dog);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener el perro' });
    }
};

exports.getDesc = async (req, res) => {
    try {
        const dogs = await Dog.getByDesc(req.params.description);
        if (dogs.length === 0) {
            return res.status(404).json({ message: 'No se encontraron perros con esa descripción' });
        }
        res.json(dogs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener los perros' });
    }
};


exports.changeDogStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedDog = await Dog.activateDog(id);

        if (!updatedDog) {
            return res.status(404).json({ message: 'No se encontró un perro con ese ID' });
        }

        res.json({
            message: 'Registro actualizado correctamente',
            dog: updatedDog
        });

    } catch (error) {
        console.error('Error al actualizar el estado del perro:', error);
        res.status(500).json({
            message: 'Error al actualizar el estado del perro',
            error: error.message
        });
    }
};
