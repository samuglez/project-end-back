const express = require("express");
const router = express.Router();
const Publicacion = require("../models/Publicacion"); // Importa el modelo de Publicación
const { isAuthenticated, isAdmin } = require("../middleware/jwt.middleware");

// Ruta para obtener todas las publicaciones
router.get("/",  async (req, res, next) => {
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
  // Ruta para obtener todas las publicaciones de un usuario específico
router.get("/usuario/:usuarioId", isAuthenticated, async (req, res, next) => {
  try {
    const { usuarioId } = req.params;
    
    const publicaciones = await Publicacion.find({ usuario: usuarioId });
    
    if (publicaciones.length === 0) {
      return res.status(404).json({ message: "Este usuario no tiene publicaciones." });
    }
    
    res.status(200).json(publicaciones);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener las publicaciones del usuario." });
  }
});
// Ruta para obtener una publicación específica por ID
router.get("/:id", isAuthenticated, async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const publicacion = await Publicacion.findById(id)
    .populate({
      path: "comentarios",
      populate: { path: "usuario", select: "name email" }, // Poblar el campo "usuario" en los comentarios
    });
    
    if (!publicacion) {
      return res.status(404).json({ message: "Publicación no encontrada." });
    }
    
    res.status(200).json(publicacion);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener la publicación." });
  }
});
// Ruta para crear una nueva publicación
router.post("/",isAuthenticated,   async (req, res, next) => {
    try {
      // Crear una nueva publicación con los datos proporcionados en el cuerpo de la solicitud
      const nuevaPublicacion = new Publicacion({
        usuario: req.payload._id,  // Asociamos la publicación al usuario logueado
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
  
      // Devolver la publicación guardada
      res.status(201).json(publicacionGuardada);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al crear la publicación." });
    }
  });
  
  // Ruta para actualizar una publicación existente
router.put("/:id", isAuthenticated, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.payload._id;

    // Primero verificamos si la publicación existe
    const publicacionExistente = await Publicacion.findById(id);
    
    if (!publicacionExistente) {
      return res.status(404).json({ message: "Publicación no encontrada" });
    }

    // Verificamos si el usuario es el creador de la publicación o es admin
    if (publicacionExistente.usuario.toString() !== userId && req.payload.rol !== "admin") {
      return res.status(403).json({ message: "No tienes permiso para editar esta publicación" });
    }

    // Actualizar la publicación
    const publicacionActualizada = await Publicacion.findByIdAndUpdate(
      id,
      {
        nombreJuego: req.body.nombreJuego,
        trofeosLogros: req.body.trofeosLogros,
        duracion: req.body.duracion,
        dificultad: req.body.dificultad,
        contenido: req.body.contenido,
        plataforma: req.body.plataforma,
        fechaActualizacion: new Date()
      },
      { new: true } // Para que devuelva el documento actualizado
    );

    res.status(200).json(publicacionActualizada);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar la publicación" });
  }
});

// Ruta para eliminar una publicación
router.delete("/:id", isAuthenticated, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.payload._id;

    // Primero verificamos si la publicación existe
    const publicacion = await Publicacion.findById(id);
    
    if (!publicacion) {
      return res.status(404).json({ message: "Publicación no encontrada" });
    }

    // Verificamos si el usuario es el creador de la publicación o es admin
    if (publicacion.usuario.toString() !== userId && req.payload.rol !== "admin") {
      return res.status(403).json({ message: "No tienes permiso para eliminar esta publicación" });
    }

    // Eliminar la publicación
    await Publicacion.findByIdAndDelete(id);

    res.status(200).json({ message: "Publicación eliminada correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar la publicación" });
  }
});

module.exports = router;
