const express = require("express");
const router = express.Router();
const Publicacion = require("../models/Publicacion"); // Importa el modelo de Publicación

// Ruta para obtener todas las publicaciones
router.get("/", async (req, res, next) => {
  try {
    // Obtener todas las publicaciones desde la base de datos
    const publicaciones = await Publicacion.find();

    // Si no hay publicaciones, se responde con un mensaje adecuado
    if (publicaciones.length === 0) {
      return res.status(404).json({ message: "No hay publicaciones disponibles." });
    }

    // Si hay publicaciones, se devuelven como respuesta en formato JSON
    res.status(200).json(publicaciones);
  } catch (error) {
    // Manejo de errores
    console.error(error);
    res.status(500).json({ message: "Error al obtener las publicaciones." });
  }
});
// Ruta para crear una nueva publicación
router.post("/", async (req, res, next) => {
    try {
      // Crear una nueva publicación con los datos proporcionados en el cuerpo de la solicitud
      const nuevaPublicacion = new Publicacion({
        usuario: req.body.usuario,
        fechaPublicacion: new Date(),
        nombreJuego: req.body.nombreJuego,
        trofeosLogros: req.body.trofeosLogros,
        duracion: req.body.duracion,
        dificultad: req.body.dificultad,
        contenido: req.body.contenido,
        plataforma: req.body.plataforma,
      });
  
      // Guardar la publicación en la base de datos
      const publicacionGuardada = await nuevaPublicacion.save();
  
      res.status(201).json(publicacionGuardada); // Devolver la publicación guardada
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al crear la publicación." });
    }
  });

module.exports = router;
